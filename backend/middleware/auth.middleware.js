import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { usermodel } from "../user/user.schema.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
        success: false,
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");

      return res.status(500).json({
        message: "Server configuration error",
        success: false,
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"],
      }
    );

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !decoded.id ||
      !mongoose.Types.ObjectId.isValid(decoded.id)
    ) {
      return res.status(401).json({
        message: "Invalid authentication token",
        success: false,
      });
    }

    const user = await usermodel.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "User account is unavailable. Please log in again.",
        success: false,
      });
    }

    // Invalidate tokens issued before a password reset.
    const currentTokenVersion = user.tokenVersion || 0;
    const tokenVersion = decoded.tokenVersion ?? 0;

    if (tokenVersion !== currentTokenVersion) {
      return res.status(401).json({
        message: "Your session has expired. Please log in again.",
        success: false,
      });
    }

    req.user = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    next();

  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError" ||
      error.name === "CastError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired authentication token",
        success: false,
      });
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      message: "Authentication service temporarily unavailable",
      success: false,
    });
  }
};