/**
 * Self-contained, in-memory auth backend used by the Next.js route handlers
 * under `src/app/api/auth/*`.
 *
 * This mirrors the patterns of the project's Express `authController` (sanitized
 * user + signed token) but is intentionally dependency-free and in-memory so the
 * phone-OTP flow is fully testable without a database or SMS provider. Swap this
 * out by setting `NEXT_PUBLIC_API_URL` to a real backend.
 */
import crypto from "crypto";
import { isSmsConfigured, sendSms } from "./sms";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_RESEND_INTERVAL_MS = 30 * 1000; // 30 seconds between sends
const MAX_VERIFY_ATTEMPTS = 5;
const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const JWT_SECRET = process.env.JWT_SECRET ?? "baleryon-dev-secret";

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  provider: string;
  createdAt: number;
  lastLogin: number | null;
}

export interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface OtpEntry {
  code: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
}

interface AuthState {
  otpByPhone: Map<string, OtpEntry>;
  usersByPhone: Map<string, StoredUser>;
}

// Persist state across module reloads (Next.js dev HMR) via globalThis.
const globalForAuth = globalThis as unknown as { __baleryonAuth?: AuthState };

const state: AuthState =
  globalForAuth.__baleryonAuth ??
  (globalForAuth.__baleryonAuth = {
    otpByPhone: new Map(),
    usersByPhone: new Map(),
  });

export function normalizePhone(phone: string): string {
  // Keep a leading "+" if present, strip every other non-digit character.
  const trimmed = String(phone).trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export interface SendOtpResult {
  ok: boolean;
  status: number;
  message: string;
}

export async function createOtp(rawPhone: string): Promise<SendOtpResult> {
  const phone = normalizePhone(rawPhone);

  if (!isValidPhone(phone)) {
    return {
      ok: false,
      status: 400,
      message: "Please provide a valid phone number",
    };
  }

  const now = Date.now();
  const existing = state.otpByPhone.get(phone);
  if (existing && now - existing.lastSentAt < OTP_RESEND_INTERVAL_MS) {
    const waitSeconds = Math.ceil(
      (OTP_RESEND_INTERVAL_MS - (now - existing.lastSentAt)) / 1000
    );
    return {
      ok: false,
      status: 429,
      message: `Please wait ${waitSeconds}s before requesting another code`,
    };
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  state.otpByPhone.set(phone, {
    code,
    expiresAt: now + OTP_TTL_MS,
    lastSentAt: now,
    attempts: 0,
  });

  const text = `Your Baleryon verification code is ${code}. It expires in 5 minutes.`;

  if (isSmsConfigured()) {
    try {
      await sendSms(phone, text);
    } catch (err) {
      // Don't leave a usable code around if delivery failed.
      state.otpByPhone.delete(phone);
      console.error("[auth] Failed to send OTP SMS", err);
      return {
        ok: false,
        status: 502,
        message: "Could not send the verification code. Please try again.",
      };
    }
  } else if (process.env.NODE_ENV === "production") {
    // Never silently skip delivery or fall back to leaking the code in prod.
    state.otpByPhone.delete(phone);
    console.error("[auth] SMS provider is not configured");
    return {
      ok: false,
      status: 500,
      message: "SMS service is unavailable. Please try again later.",
    };
  } else {
    // Local development without Twilio: print to the server console only.
    // The code is never returned to the client.
    console.log(`[auth] OTP for ${phone}: ${code}`);
  }

  return {
    ok: true,
    status: 200,
    message: "OTP sent successfully",
  };
}

export interface VerifyOtpResult {
  ok: boolean;
  status: number;
  message: string;
  user?: SafeUser;
  token?: string;
}

interface ConsumeOtpResult {
  ok: boolean;
  status: number;
  message: string;
  phone: string;
}

/**
 * Validate the OTP for a phone number and, on success, consume it so it can't
 * be reused. Shared by the phone signup and login flows.
 */
function consumeOtp(rawPhone: string, code: string): ConsumeOtpResult {
  const phone = normalizePhone(rawPhone);

  if (!phone || !code) {
    return { ok: false, status: 400, message: "Phone and OTP are required", phone };
  }

  const entry = state.otpByPhone.get(phone);
  if (!entry) {
    return {
      ok: false,
      status: 400,
      message: "No OTP requested for this number. Please request a new code.",
      phone,
    };
  }

  if (Date.now() > entry.expiresAt) {
    state.otpByPhone.delete(phone);
    return {
      ok: false,
      status: 400,
      message: "OTP has expired. Please request a new code.",
      phone,
    };
  }

  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    state.otpByPhone.delete(phone);
    return {
      ok: false,
      status: 429,
      message: "Too many attempts. Please request a new code.",
      phone,
    };
  }

  if (entry.code !== String(code).trim()) {
    entry.attempts += 1;
    return { ok: false, status: 401, message: "Invalid OTP. Please try again.", phone };
  }

  // OTP is valid — consume it.
  state.otpByPhone.delete(phone);
  return { ok: true, status: 200, message: "OTP verified", phone };
}

// @desc    Register a new user with phone + OTP
// @route   POST /api/auth/signup/phone
export function signupWithPhone(
  rawPhone: string,
  code: string,
  fullName?: string
): VerifyOtpResult {
  if (!fullName || !fullName.trim()) {
    return { ok: false, status: 400, message: "Please provide your full name" };
  }

  const result = consumeOtp(rawPhone, code);
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }

  const { phone } = result;

  if (state.usersByPhone.has(phone)) {
    return {
      ok: false,
      status: 409,
      message: "User already exists with this phone number. Please log in.",
    };
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    email: `${phone.replace(/\D/g, "")}@phone.baleryon.com`,
    phone,
    provider: "phone",
    createdAt: Date.now(),
    lastLogin: Date.now(),
  };
  state.usersByPhone.set(phone, user);

  return {
    ok: true,
    status: 201,
    message: "User registered successfully",
    user: sanitizeUser(user),
    token: generateToken(user.id),
  };
}

// @desc    Log a user in with phone + OTP
// @route   POST /api/auth/login/phone
export function loginWithPhone(rawPhone: string, code: string): VerifyOtpResult {
  const result = consumeOtp(rawPhone, code);
  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }

  const user = state.usersByPhone.get(result.phone);
  if (!user) {
    return {
      ok: false,
      status: 404,
      message: "No account found with this phone number. Please sign up.",
    };
  }

  user.lastLogin = Date.now();

  return {
    ok: true,
    status: 200,
    message: "Login successful",
    user: sanitizeUser(user),
    token: generateToken(user.id),
  };
}

function sanitizeUser(user: StoredUser): SafeUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
  };
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/** Minimal HS256 JWT, matching the shape issued by the Express backend. */
export function generateToken(userId: string): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    JSON.stringify({ id: userId, iat: now, exp: now + TOKEN_TTL_SECONDS })
  );
  const signature = base64url(
    crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest()
  );
  return `${header}.${payload}.${signature}`;
}
