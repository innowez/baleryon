import express from "express";
import {
  signupController,
  signupWithPhoneController,
  loginController,
  loginWithPhoneController,
  sendPhoneOtpController,
  getMeController,
  googleAuthController,
  googleCallbackController,
} from "../controller/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signupController);
router.post("/login", loginController);

// Phone OTP routes (no password)
router.post("/send-otp", sendPhoneOtpController);
router.post("/signup/phone", signupWithPhoneController);
router.post("/login/phone", loginWithPhoneController);

// Google OAuth routes
router.get("/google", googleAuthController);
router.get("/google/callback", googleCallbackController);

// Protected routes
router.get("/me", protect, getMeController);

export default router;
