import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
// import { toLegacyUser, toFullName } from "../utils/userMapper.js";
import { sendOTP } from "../utils/whatsApp.js";
// import { sendOtp } from "../utils/msg91.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Sanitize user data (remove sensitive fields)
function sanitizeUser(user) {
  const { passwordHash, providerId, ...safeUser } = user;
  return safeUser;
}

/* -------------------------------------------------------------------------- */
/*  Phone OTP helpers                                                          */
/*                                                                            */
/*  This uses an in-memory store for simplicity. For production.           */
/* -------------------------------------------------------------------------- */
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_RESEND_INTERVAL_MS = 30 * 1000; // 30s between sends
const MAX_VERIFY_ATTEMPTS = 5;
const otpStore = new Map();

function normalizePhone(phone) {
  const trimmed = String(phone).trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

function isValidPhone(phone) {
  const digits = String(phone).replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

// Returns { ok, status, message } and consumes the OTP on success.
function consumeOtp(rawPhone, code) {
  const phone = normalizePhone(rawPhone);

  if (!phone || !code) {
    return {
      ok: false,
      status: 400,
      message: "Phone and OTP are required",
      phone,
    };
  }

  const entry = otpStore.get(phone);

  console.log(entry, "entryentryentryentryentryentry");

  if (!entry) {
    return {
      ok: false,
      status: 400,
      message: "No OTP requested for this number. Please request a new code.",
      phone,
    };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return {
      ok: false,
      status: 400,
      message: "OTP has expired. Please request a new code.",
      phone,
    };
  }

  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(phone);
    return {
      ok: false,
      status: 429,
      message: "Too many attempts. Please request a new code.",
      phone,
    };
  }
  const enteredHash = crypto
    .createHash("sha256")
    .update(String(code).trim())
    .digest("hex");

  if (entry.code !== enteredHash) {
    entry.attempts += 1;
    return {
      ok: false,
      status: 401,
      message: "Invalid OTP. Please try again.",
      phone,
    };
  }

  otpStore.delete(phone);
  return { ok: true, status: 200, message: "OTP verified", phone };
}

// @desc    Send an OTP to a phone number
// @route   POST /api/auth/send-otp
// @access  Public
// export const sendPhoneOtpController = asyncHandler(async (req, res) => {
//   const { phone } = req.body;

//   if (!phone || !isValidPhone(phone)) {
//     return res
//       .status(400)
//       .json({ message: "Please provide a valid phone number" });
//   }

//   const normalizedPhone = normalizePhone(phone);
//   const now = Date.now();
//   const existing = otpStore.get(normalizedPhone);

//   if (existing && now - existing.lastSentAt < OTP_RESEND_INTERVAL_MS) {
//     const waitSeconds = Math.ceil(
//       (OTP_RESEND_INTERVAL_MS - (now - existing.lastSentAt)) / 1000,
//     );
//     return res.status(429).json({
//       message: `Please wait ${waitSeconds}s before requesting another code`,
//     });
//   }

//   const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

//   const otpHash = crypto.createHash("sha256").update(code).digest("hex");

//   await sendOTP(normalizedPhone, code);

//   otpStore.set(normalizedPhone, {
//     code: otpHash,
//     expiresAt: now + OTP_TTL_MS,
//     lastSentAt: now,
//     attempts: 0,
//   });

//   // otpStore.set(normalizedPhone, {
//   //   code,
//   //   expiresAt: now + OTP_TTL_MS,
//   //   lastSentAt: now,
//   //   attempts: 0,
//   // });

//   // TODO: integrate a real SMS provider here (Twilio/MSG91/etc.).
//   console.log(`[auth] OTP for ${normalizedPhone}: ${code}`);

//   const isProd = process.env.NODE_ENV === "production";
//   return res.status(200).json({
//     message: "OTP sent successfully",
//     ...(isProd ? {} : { devOtp: code }),
//   });
// });

// @desc    Send an OTP to a phone number
// @route   POST /api/auth/send-otp
// @access  Public
export const sendPhoneOtpController = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone || !isValidPhone(phone)) {
    return res
      .status(400)
      .json({ message: "Please provide a valid phone number" });
  }

  const normalizedPhone = normalizePhone(phone);
  const now = Date.now();
  const existing = otpStore.get(normalizedPhone);

  if (existing && now - existing.lastSentAt < OTP_RESEND_INTERVAL_MS) {
    const waitSeconds = Math.ceil(
      (OTP_RESEND_INTERVAL_MS - (now - existing.lastSentAt)) / 1000,
    );

    return res.status(429).json({
      message: `Please wait ${waitSeconds}s before requesting another code`,
    });
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const otpHash = crypto.createHash("sha256").update(code).digest("hex");

  // Send WhatsApp OTP
  const waResponse = await sendOTP(normalizedPhone, code);

  // If WhatsApp failed, don't save OTP
  if (!waResponse.success) {
    return res.status(500).json({
      message: "Failed to send OTP via WhatsApp. Please try again later.",
      error: waResponse.error,
    });
  }

  // Save OTP only after successful WhatsApp send
  otpStore.set(normalizedPhone, {
    code: otpHash,
    expiresAt: now + OTP_TTL_MS,
    lastSentAt: now,
    attempts: 0,
  });

  console.log(`[auth] OTP for ${normalizedPhone}: ${code}`);

  const isProd = process.env.NODE_ENV === "production";

  return res.status(200).json({
    message: "OTP sent successfully",
    ...(isProd ? {} : { devOtp: code }),
  });
});

// @desc    Register a new user with email
// @route   POST /api/auth/signup
// @access  Public
export const signupController = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;

  // Validation
  if (!email || !password || !fullName) {
    return res.status(400).json({
      message: "Please provide email, password, and full name",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "User already exists with this email",
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Get or create customer role
  const customerRole = await prisma.role.upsert({
    where: { name: "customer" },
    update: {},
    create: { name: "customer" },
  });

  // Create user
  const user = await prisma.user.create({
    data: {
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
      provider: "local",
      roleId: customerRole.id,
      isVerified: false,
    },
    include: {
      role: true,
    },
  });

  // Generate token
  const token = generateToken(user.id);

  res.status(201).json({
    message: "User registered successfully",
    user: sanitizeUser(user),
    token,
  });
});

// @desc    Register a new user with phone + OTP (no password)
// @route   POST /api/auth/signup/phone
// @access  Public
export const signupWithPhoneController = asyncHandler(async (req, res) => {
  const { phone, fullName, otp } = req.body;

  // Validation
  if (!phone || !fullName || !otp) {
    return res.status(400).json({
      message: "Please provide phone, full name, and OTP",
    });
  }

  // Verify the OTP first
  const otpResult = consumeOtp(phone, otp);
  if (!otpResult.ok) {
    return res.status(otpResult.status).json({ message: otpResult.message });
  }

  const normalizedPhone = otpResult.phone;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "User already exists with this phone number. Please log in.",
    });
  }

  // Get or create customer role
  const customerRole = await prisma.role.upsert({
    where: { name: "customer" },
    update: {},
    create: { name: "customer" },
  });

  // Create user (no passwordHash — phone users authenticate with OTP)
  const user = await prisma.user.create({
    data: {
      fullName: fullName.trim(),
      phone: normalizedPhone,
      provider: "phone",
      roleId: customerRole.id,
      isVerified: true, // verified via OTP
      email: `${normalizedPhone.replace(/\D/g, "")}@phone.baleryon.com`, // placeholder email
    },
    include: {
      role: true,
    },
  });

  // Generate token
  const token = generateToken(user.id);

  res.status(201).json({
    message: "User registered successfully",
    user: sanitizeUser(user),
    token,
  });
});

// @desc    Login user with email
// @route   POST /api/auth/login
// @access  Public
export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide email and password",
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      role: true,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // Check if user is blocked
  if (user.isBlocked) {
    return res.status(403).json({
      message: "Your account has been blocked. Please contact support.",
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate token
  const token = generateToken(user.id);

  res.status(200).json({
    message: "Login successful",
    user: sanitizeUser(user),
    token,
  });
});

// @desc    Login user with phone + OTP (no password)
// @route   POST /api/auth/login/phone
// @access  Public
export const loginWithPhoneController = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  console.log(phone, otp, "phonephonephonephonephone");

  // Validation
  if (!phone || !otp) {
    return res.status(400).json({
      message: "Please provide phone and OTP",
    });
  }

  // Verify the OTP first
  const otpResult = consumeOtp(phone, otp);
  if (!otpResult.ok) {
    return res.status(otpResult.status).json({ message: otpResult.message });
  }

  const normalizedPhone = otpResult.phone;

  console.log(normalizedPhone, "normalizedPhonenormalizedPhonenormalizedPhone");

  // Find user
  const user = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
    include: {
      role: true,
    },
  });

  console.log(user, "useruseruseruseruser");

  if (!user) {
    return res.status(404).json({
      message: "Invalid OTP or phone number. Please try again.",
    });
  }

  // Check if user is blocked
  if (user.isBlocked) {
    return res.status(403).json({
      message: "Your account has been blocked. Please contact support.",
    });
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate token
  const token = generateToken(user.id);

  res.status(200).json({
    message: "Login successful",
    user: sanitizeUser(user),
    token,
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMeController = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userRecord.id },
    include: {
      role: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    user: sanitizeUser(user),
  });
});

// @desc    Google OAuth callback handler
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallbackController = asyncHandler(async (req, res) => {
  // This will be implemented with passport.js or similar OAuth library
  // For now, return a placeholder
  res.status(501).json({
    message:
      "Google OAuth not yet implemented. Please use email or phone signup.",
  });
});

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google
// @access  Public
export const googleAuthController = asyncHandler(async (req, res) => {
  // This will redirect to Google OAuth
  // For now, return a placeholder
  res.status(501).json({
    message:
      "Google OAuth not yet implemented. Please use email or phone signup.",
  });
});
