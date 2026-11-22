import { usermodel } from "./user.schema.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/email.service.js";

// Google OAuth Client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// Constants
const CODE_EXPIRATION = 5 * 60 * 1000;
const RESEND_COOLDOWN = 60 * 1000;
const MAX_ATTEMPTS = 5;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

// Email Validation
const validateEmail = (email) => {
  if (typeof email !== "string") return false;

  const emailRegex =
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

  return emailRegex.test(email.trim().toLowerCase());
};

// Normalize Email
const normalizeEmail = (email) => {
  if (typeof email !== "string") return "";

  return email.trim().toLowerCase();
};

// Password Validation
const validatePassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= MIN_PASSWORD_LENGTH &&
    Buffer.byteLength(password, "utf8") <= MAX_PASSWORD_BYTES
  );
};

// Generate 6-Digit Code
const generateCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Secure Code Hashing Using HMAC
const hashCode = (code) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(code)
    .digest("hex");
};

// Compare Hashes Safely
const compareCode = (code, storedHash) => {
  if (
    typeof code !== "string" ||
    typeof storedHash !== "string" ||
    !/^[a-f0-9]{64}$/i.test(storedHash)
  ) {
    return false;
  }

  const newHash = hashCode(code);

  const newBuffer = Buffer.from(newHash, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (newBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    newBuffer,
    storedBuffer
  );
};

// Clear Verification Data
const clearVerificationData = (user) => {
  user.verificationCodeHash = undefined;
  user.verificationCodeExpiresAt = undefined;
  user.verificationAttempts = 0;
};

// Clear Password Reset Data
const clearPasswordResetData = (user) => {
  user.passwordResetCodeHash = undefined;
  user.passwordResetCodeExpiresAt = undefined;
  user.passwordResetAttempts = 0;
};

// Login Controller
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password ||
      Buffer.byteLength(password, "utf8") > 1024
    ) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email",
        success: false,
      });
    }

    const user = await usermodel
      .findOne({ email: normalizedEmail })
      .select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is deactivated",
        success: false,
      });
    }

    const isMatch = await bcryptjs.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Old accounts without isVerified remain accessible.
    // New accounts must verify their email.
    if (user.isVerified === false) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        code: "EMAIL_NOT_VERIFIED",
        success: false,
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in .env");
    }

    const tokenData = {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
    };

    const token = jwt.sign(
      tokenData,
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
        algorithm: "HS256",
      }
    );

    const isProduction =
      process.env.NODE_ENV === "production";

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.fullName}`,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        success: true,
      });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login",
      success: false,
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// Google Login Controller
export const GoogleLogin = async (req, res) => {
  try {
    const { credential } = req.body || {};

    if (
      typeof credential !== "string" ||
      !credential.trim()
    ) {
      return res.status(400).json({
        message: "Google credential is required",
        success: false,
      });
    }

    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.JWT_SECRET
    ) {
      return res.status(503).json({
        message: "Google authentication is not configured",
        success: false,
      });
    }

    // Verify Google ID Token on the backend
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        message: "Google account verification failed",
        success: false,
      });
    }

    const googleId = payload.sub;
    const email = normalizeEmail(payload.email);
    const fullName = payload.name?.trim() || "Google User";

    if (!validateEmail(email)) {
      return res.status(401).json({
        message: "Google email is invalid",
        success: false,
      });
    }

    if (
      fullName.length < 2 ||
      fullName.length > 100
    ) {
      return res.status(400).json({
        message: "Invalid Google account name",
        success: false,
      });
    }

    // Find account by Google ID or verified email
    let user = await usermodel.findOne({
      $or: [
        { googleId },
        { email },
      ],
    });

    if (user) {
      if (!user.isActive) {
        return res.status(403).json({
          message: "Account is deactivated",
          success: false,
        });
      }

      // Do not link a different Google account
      if (user.googleId && user.googleId !== googleId) {
        return res.status(409).json({
          message: "This email is already linked to another Google account",
          success: false,
        });
      }

      // Do not silently change the email of an existing Google account
      if (user.googleId === googleId && user.email !== email) {
        return res.status(409).json({
          message: "Google account email does not match the linked account",
          success: false,
        });
      }

      // Link Google to this account.
      // Google has already verified ownership of this email.
      user.googleId = googleId;
      user.isVerified = true;

      await user.save();

    } else {
      // Create a new Google account without a local password
      user = await usermodel.create({
        fullName,
        email,
        googleId,
        isVerified: true,
      });
    }

    // Generate JWT using the existing authentication system
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion || 0,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
        algorithm: "HS256",
      }
    );

    const isProduction =
      process.env.NODE_ENV === "production";

    // Set the same HttpOnly authentication cookie
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Google login successful",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        success: true,
      });

  } catch (error) {
    console.error("Google login error:", error);

    // Handle duplicate email or Google ID
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This account is already registered",
        success: false,
      });
    }

    return res.status(401).json({
      message: "Google authentication failed",
      success: false,
    });
  }
};

// Register Controller
export const Register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body || {};

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !fullName.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email",
        success: false,
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and must not exceed 72 bytes",
        success: false,
      });
    }

    const trimmedName = fullName.trim();

    if (
      trimmedName.length < 2 ||
      trimmedName.length > 100
    ) {
      return res.status(400).json({
        message: "Full name must be between 2 and 100 characters",
        success: false,
      });
    }

    const userExists = await usermodel.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(409).json({
        message: "Email already registered",
        success: false,
      });
    }

    const hashedPassword = await bcryptjs.hash(
      password,
      10
    );

    const verificationCode = generateCode();

    const newUser = await usermodel.create({
      fullName: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      verificationCodeHash: hashCode(verificationCode),
      verificationCodeExpiresAt: new Date(
        Date.now() + CODE_EXPIRATION
      ),
      verificationAttempts: 0,
      verificationLastSentAt: new Date(),
    });

    try {
      await sendVerificationEmail(
        normalizedEmail,
        verificationCode
      );
    } catch (emailError) {
      console.error(
        "Verification email error:",
        emailError.message
      );

      clearVerificationData(newUser);
      newUser.verificationLastSentAt = undefined;

      await newUser.save();

      return res.status(503).json({
        message:
          "Account created, but verification email could not be sent. Please try resending the code.",
        success: false,
      });
    }

    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
      success: true,
    });

  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        message: messages.join(", "),
        success: false,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
        success: false,
      });
    }

    return res.status(500).json({
      message: "Server error during registration",
      success: false,
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// Verify Email Controller
export const VerifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body || {};

    if (
      typeof email !== "string" ||
      !validateEmail(email) ||
      typeof code !== "string" ||
      !/^\d{6}$/.test(code)
    ) {
      return res.status(400).json({
        message: "Valid email and 6-digit code are required",
        success: false,
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await usermodel
      .findOne({ email: normalizedEmail })
      .select(
        "+verificationCodeHash +verificationCodeExpiresAt +verificationAttempts"
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        message: "Email is already verified",
        success: true,
      });
    }

    if (
      !user.verificationCodeHash ||
      !user.verificationCodeExpiresAt ||
      user.verificationCodeExpiresAt.getTime() < Date.now()
    ) {
      clearVerificationData(user);

      await user.save();

      return res.status(400).json({
        message:
          "Verification code has expired. Please request a new code.",
        success: false,
      });
    }

    if (!compareCode(code, user.verificationCodeHash)) {
      user.verificationAttempts =
        (user.verificationAttempts || 0) + 1;

      if (user.verificationAttempts >= MAX_ATTEMPTS) {
        clearVerificationData(user);

        await user.save();

        return res.status(429).json({
          message:
            "Too many incorrect attempts. Please request a new code.",
          success: false,
        });
      }

      await user.save();

      return res.status(400).json({
        message: "Invalid verification code",
        remainingAttempts:
          MAX_ATTEMPTS - user.verificationAttempts,
        success: false,
      });
    }

    user.isVerified = true;

    clearVerificationData(user);

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully. You can now log in.",
      success: true,
    });

  } catch (error) {
    console.error("Verify email error:", error);

    return res.status(500).json({
      message: "Server error during email verification",
      success: false,
    });
  }
};

// Resend Verification Code
export const ResendVerification = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (
      typeof email !== "string" ||
      !validateEmail(email)
    ) {
      return res.status(400).json({
        message: "Please provide a valid email",
        success: false,
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await usermodel
      .findOne({ email: normalizedEmail })
      .select("+verificationLastSentAt");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
        success: false,
      });
    }

    if (
      user.verificationLastSentAt &&
      Date.now() - user.verificationLastSentAt.getTime() <
        RESEND_COOLDOWN
    ) {
      return res.status(429).json({
        message: "Please wait before requesting another code",
        success: false,
      });
    }

    const verificationCode = generateCode();

    user.verificationCodeHash = hashCode(verificationCode);
    user.verificationCodeExpiresAt = new Date(
      Date.now() + CODE_EXPIRATION
    );
    user.verificationAttempts = 0;
    user.verificationLastSentAt = new Date();

    await user.save();

    try {
      await sendVerificationEmail(
        normalizedEmail,
        verificationCode
      );
    } catch (emailError) {
      console.error(
        "Resend verification error:",
        emailError.message
      );

      clearVerificationData(user);
      user.verificationLastSentAt = undefined;

      await user.save();

      return res.status(503).json({
        message:
          "Could not send verification email. Please try again later.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "A new verification code has been sent",
      success: true,
    });

  } catch (error) {
    console.error("Resend verification error:", error);

    return res.status(500).json({
      message: "Server error while resending verification code",
      success: false,
    });
  }
};

// Forgot Password Controller
export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (
      typeof email !== "string" ||
      !validateEmail(email)
    ) {
      return res.status(400).json({
        message: "Please provide a valid email",
        success: false,
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const genericResponse = {
      message:
        "If an eligible account exists, a password reset code will be sent.",
      success: true,
    };

    const user = await usermodel
      .findOne({ email: normalizedEmail })
      .select("+passwordResetLastSentAt");

    // Do not reveal whether an account exists.
    if (
      !user ||
      !user.isActive ||
      user.isVerified === false
    ) {
      return res.status(200).json(genericResponse);
    }

    // Return the same generic response during cooldown.
    if (
      user.passwordResetLastSentAt &&
      Date.now() - user.passwordResetLastSentAt.getTime() <
        RESEND_COOLDOWN
    ) {
      return res.status(200).json(genericResponse);
    }

    const resetCode = generateCode();

    user.passwordResetCodeHash = hashCode(resetCode);
    user.passwordResetCodeExpiresAt = new Date(
      Date.now() + CODE_EXPIRATION
    );
    user.passwordResetAttempts = 0;
    user.passwordResetLastSentAt = new Date();

    await user.save();

    try {
      await sendPasswordResetEmail(
        normalizedEmail,
        resetCode
      );
    } catch (emailError) {
      console.error(
        "Password reset email error:",
        emailError.message
      );

      clearPasswordResetData(user);
      user.passwordResetLastSentAt = undefined;

      await user.save();

      return res.status(200).json(genericResponse);
    }

    return res.status(200).json(genericResponse);

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Server error during password recovery",
      success: false,
    });
  }
};

// Reset Password Controller
export const ResetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body || {};

    if (
      typeof email !== "string" ||
      !validateEmail(email) ||
      typeof code !== "string" ||
      !/^\d{6}$/.test(code) ||
      !validatePassword(newPassword)
    ) {
      return res.status(400).json({
        message:
          "Valid email, 6-digit code, and password of at least 8 characters (maximum 72 bytes) are required",
        success: false,
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await usermodel
      .findOne({ email: normalizedEmail })
      .select(
        "+passwordResetCodeHash +passwordResetCodeExpiresAt +passwordResetAttempts"
      );

    if (
      !user ||
      !user.isActive ||
      user.isVerified === false ||
      !user.passwordResetCodeHash
    ) {
      return res.status(400).json({
        message: "Invalid or expired reset code",
        success: false,
      });
    }

    if (
      !user.passwordResetCodeExpiresAt ||
      user.passwordResetCodeExpiresAt.getTime() < Date.now()
    ) {
      clearPasswordResetData(user);

      await user.save();

      return res.status(400).json({
        message: "Reset code has expired. Please request a new code.",
        success: false,
      });
    }

    if (!compareCode(code, user.passwordResetCodeHash)) {
      user.passwordResetAttempts =
        (user.passwordResetAttempts || 0) + 1;

      if (user.passwordResetAttempts >= MAX_ATTEMPTS) {
        clearPasswordResetData(user);

        await user.save();

        return res.status(429).json({
          message:
            "Too many incorrect attempts. Please request a new code.",
          success: false,
        });
      }

      await user.save();

      return res.status(400).json({
        message: "Invalid reset code",
        remainingAttempts:
          MAX_ATTEMPTS - user.passwordResetAttempts,
        success: false,
      });
    }

    const hashedPassword = await bcryptjs.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    // Invalidate all previously issued JWT sessions.
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    clearPasswordResetData(user);

    await user.save();

    return res.status(200).json({
      message: "Password has been reset successfully. Please log in.",
      success: true,
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Server error while resetting password",
      success: false,
    });
  }
};

// Logout Controller
export const Logout = async (req, res) => {
  try {
    const isProduction =
      process.env.NODE_ENV === "production";

    return res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "Strict",
      })
      .json({
        message: "Logged out successfully",
        success: true,
      });

  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      message: "Server error during logout",
      success: false,
    });
  }
};