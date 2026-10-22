import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
// import { toLegacyUser, toFullName } from "../utils/userMapper.js";
import { sendOTP, verifyOTP } from "../utils/whatsApp.js";
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
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_INTERVAL_MS = 30 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

// Stores the provider's OTP ID, not the actual OTP code.
const otpStore = new Map();

function normalizePhone(phone) {
  const raw = String(phone ?? "").trim();
  const digits = raw.replace(/\D/g, "");

  // Normalize Indian numbers to E.164 format.
  if (/^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }

  if (/^91[6-9]\d{9}$/.test(digits)) {
    return `+${digits}`;
  }

  // Allow other international E.164 numbers if needed.
  if (
    raw.startsWith("+") &&
    /^\+[1-9]\d{7,14}$/.test(raw.replace(/[\s()-]/g, ""))
  ) {
    return raw.replace(/[\s()-]/g, "");
  }

  return null;
}

function isValidPhone(phone) {
  return Boolean(normalizePhone(phone));
}

// Verify through Wakit and consume the challenge on success.
async function consumeOtp(rawPhone, code) {
  const phone = normalizePhone(rawPhone);

  if (!phone || typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return {
      ok: false,
      status: 400,
      message: "Please provide a valid phone number and 6-digit OTP.",
      phone,
    };
  }

  const entry = otpStore.get(phone);

  if (!entry) {
    return {
      ok: false,
      status: 400,
      message: "No active OTP found. Please request a new code.",
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

  // Count every verification attempt, including incorrect codes.
  entry.attempts += 1;

  const result = await verifyOTP(entry.id, code);
  console.log(result, "resultresultresultresultresult");
  if (!result.success) {
    // Don't consume the challenge for a temporary provider outage.
    if (result.status && result.status >= 500) {
      return {
        ok: false,
        status: 502,
        message: "OTP verification service is temporarily unavailable.",
        phone,
      };
    }

    if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
      otpStore.delete(phone);
    }

    return {
      ok: false,
      status: 401,
      message: "Invalid or expired OTP. Please try again.",
      phone,
    };
  }

  if (!result.verified) {
    if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
      otpStore.delete(phone);
    }

    return {
      ok: false,
      status: 401,
      message: "Invalid or expired OTP. Please try again.",
      phone,
    };
  }

  otpStore.delete(phone);

  return {
    ok: true,
    status: 200,
    message: "OTP verified",
    phone,
  };
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
// export const sendPhoneOtpController = asyncHandler(async (req, res) => {
//   const { phone } = req.body;

//   // console.log(phone, "phonephonephonephonephone");
//   // console.log(isValidPhone(phone), "isValidPhoneisValidPhoneisValidPhone");

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

//   // Send WhatsApp OTP
//   const waResponse = await sendOTP(normalizedPhone, code);

//   // If WhatsApp failed, don't save OTP
//   // if (!waResponse.success) {
//   //   return res.status(500).json({
//   //     message: "Failed to send OTP via WhatsApp. Please try again later.",
//   //     error: waResponse.error,
//   //   });
//   // }

//   // Save OTP only after successful WhatsApp send
//   otpStore.set(normalizedPhone, {
//     code: otpHash,
//     expiresAt: now + OTP_TTL_MS,
//     lastSentAt: now,
//     attempts: 0,
//   });

//   console.log(`[auth] OTP for ${normalizedPhone}: ${code}`);

//   const isProd = process.env.NODE_ENV === "production";

//   return res.status(200).json({
//     message: "OTP sent successfully",
//     ...(isProd ? {} : { devOtp: code }),
//   });
// });

export const sendPhoneOtpController = asyncHandler(async (req, res) => {
  const normalizedPhone = normalizePhone(req.body.phone);

  if (!normalizedPhone) {
    return res.status(400).json({
      message: "Please provide a valid phone number.",
    });
  }

  const now = Date.now();
  const existing = otpStore.get(normalizedPhone);

  if (existing && now - existing.lastSentAt < OTP_RESEND_INTERVAL_MS) {
    const waitSeconds = Math.ceil(
      (OTP_RESEND_INTERVAL_MS - (now - existing.lastSentAt)) / 1000,
    );

    return res.status(429).json({
      message: `Please wait ${waitSeconds}s before requesting another code.`,
    });
  }

  const waResponse = await sendOTP(normalizedPhone);

  if (!waResponse.success) {
    return res.status(502).json({
      message: "Failed to send OTP via WhatsApp. Please try again later.",
      error:
        process.env.NODE_ENV === "production" ? undefined : waResponse.error,
    });
  }

  const providerOtp = waResponse.data;
  const providerExpiry = providerOtp.expiresAt
    ? new Date(providerOtp.expiresAt).getTime()
    : NaN;

  otpStore.set(normalizedPhone, {
    id: providerOtp.id,
    expiresAt:
      Number.isFinite(providerExpiry) && providerExpiry > now
        ? providerExpiry
        : now + OTP_TTL_MS,
    lastSentAt: now,
    attempts: 0,
  });

  return res.status(200).json({
    message: "OTP sent successfully on WhatsApp.",
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
  const otpResult = await consumeOtp(phone, otp);
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

  // Validation
  if (!phone || !otp) {
    return res.status(400).json({
      message: "Please provide phone and OTP",
    });
  }

  console.log(phone, otp, "phonephonephonephonephone");
  // Verify the OTP first
  const otpResult = await consumeOtp(phone, otp);
  console.log(otpResult, "otpResultotpResultotpResultotpResult");
  if (!otpResult.ok) {
    return res.status(otpResult.status).json({ message: otpResult.message });
  }

  const normalizedPhone = otpResult.phone;

  console.log(normalizedPhone, "normalizedPhonenormalizedPhonenormalizedPhone");

  // // Find user
  // const user = await prisma.user.findUnique({
  //   where: { phone: normalizedPhone },
  //   include: {
  //     role: true,
  //   },
  // });

  // Convert +917204474711 to 7204474711 for existing DB records
  const phoneForLookup = normalizedPhone.startsWith("+91")
    ? normalizedPhone.slice(3)
    : normalizedPhone;

  const user = await prisma.user.findUnique({
    where: { phone: phoneForLookup },
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
