import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import userRouter from "./user.router.js"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())

// CORS FIX 🔥
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)

// Extra CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true")
  res.header("Access-Control-Allow-Origin", "http://localhost:3000")
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})
app.use(limiter)

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", userRouter)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" })
})

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    message: "Internal server error",
    success: false,
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    success: false,
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app