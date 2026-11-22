import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import userRouter from "./user.router.js";
import movieRouter from "./movie.router.js";
import dbConnection from "./db.connection.js";
import { verifyEmailConnection } from "./services/email.service.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Basic Express Security
app.disable("x-powered-by");
app.set("etag", false);

// Proxy Configuration
if (process.env.NODE_ENV === "development") {
  app.set("trust proxy", "loopback");
} else if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigin =
  process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parsers
app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "10kb",
    parameterLimit: 20,
  })
);

// Cookie Parser
app.use(cookieParser());

// General Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
    success: false,
  },
});

// Authentication Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
    success: false,
  },
});

// Apply Rate Limiters
app.use(generalLimiter);

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Google OAuth Configuration
app.get("/api/config/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return res.status(503).json({
      message: "Google authentication is not configured",
      success: false,
    });
  }

  return res.status(200).json({
    success: true,
    clientId,
  });
});

// Authentication Routes
app.use("/api/auth", userRouter);

// Movie Routes
app.use("/api/movies", movieRouter);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Server is running",
    success: true,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    success: false,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  // Invalid JSON
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      message: "Invalid JSON request body",
      success: false,
    });
  }

  // Request body too large
  if (err.status === 413) {
    return res.status(413).json({
      message: "Request body is too large",
      success: false,
    });
  }

  // CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "Request origin is not allowed",
      success: false,
    });
  }

  return res.status(500).json({
    message: "Internal server error",
    success: false,
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : undefined,
  });
});

// Start Server After Database Connection
const startServer = async () => {
  try {
    await dbConnection();

    const emailConnected = await verifyEmailConnection();

    if (!emailConnected) {
      console.warn(
        "Warning: Email service is unavailable. Email features may not work."
      );
    } else {
      console.log("Email service connection verified.");
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;