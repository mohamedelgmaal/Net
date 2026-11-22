import express from "express";
import rateLimit from "express-rate-limit";

import {
  Login,
  GoogleLogin,
  Register,
  Logout,
  VerifyEmail,
  ResendVerification,
  ForgotPassword,
  ResetPassword,
} from "./user/user.Controller.js";

import { authMiddleware } from "./middleware/auth.middleware.js";

const router = express.Router();

// Rate Limiter
const emailAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
    success: false,
  },
});

// Public Routes
router.post("/register", Register);
router.post("/login", Login);
router.post("/google", emailAuthLimiter, GoogleLogin);
router.get("/logout", Logout);

// Email Verification Routes
router.post("/verify-email", emailAuthLimiter, VerifyEmail);
router.post("/resend-verification", emailAuthLimiter, ResendVerification);

// Forgot Password Routes
router.post("/forgot-password", emailAuthLimiter, ForgotPassword);
router.post("/reset-password", emailAuthLimiter, ResetPassword);

// Protected Routes
router.get("/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "Authenticated successfully",
    user: req.user,
    success: true,
  });
});

export default router;