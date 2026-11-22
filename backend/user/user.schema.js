import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // User Information
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name must not exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email",
      ],
    },

    // Password Authentication
    password: {
      type: String,
      required: false,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    // Google Authentication
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Session Version
    // Increment this value to invalidate existing JWT sessions.
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Email Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCodeHash: {
      type: String,
      select: false,
    },

    verificationCodeExpiresAt: {
      type: Date,
      select: false,
    },

    verificationAttempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      select: false,
    },

    verificationLastSentAt: {
      type: Date,
      select: false,
    },

    // Password Reset
    passwordResetCodeHash: {
      type: String,
      select: false,
    },

    passwordResetCodeExpiresAt: {
      type: Date,
      select: false,
    },

    passwordResetAttempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      select: false,
    },

    passwordResetLastSentAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const usermodel = mongoose.model("User", userSchema);