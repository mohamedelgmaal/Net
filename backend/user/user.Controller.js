import { usermodel } from "./user.schema.js"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"

const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  return emailRegex.test(email)
}

const validatePassword = (password) => {
  return password && password.length >= 6
}

// Login Controller
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Please provide a valid email",
        success: false,
      })
    }

    const user = await usermodel.findOne({ email }).select("+password")
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is deactivated",
        success: false,
      })
    }

    const isMatch = await bcryptjs.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      })
    }

    const tokenData = {
      id: user._id,
      email: user.email,
      role: user.role,
    }

    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "24h",
      algorithm: "HS256",
    })

    const isProduction = process.env.NODE_ENV === "production"

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: isProduction, // true only in production
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
      .json({
        message: `Welcome back ${user.fullName}`,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
        success: true,
      })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({
      message: "Server error during login",
      success: false,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Register Controller
export const Register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Please provide a valid email",
        success: false,
      })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        success: false,
      })
    }

    if (fullName.length < 2 || fullName.length > 100) {
      return res.status(400).json({
        message: "Full name must be between 2 and 100 characters",
        success: false,
      })
    }

    const userExists = await usermodel.findOne({ email: email.toLowerCase() })
    if (userExists) {
      return res.status(409).json({
        message: "Email already registered",
        success: false,
      })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const newUser = await usermodel.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
    })

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
      success: true,
    })
  } catch (error) {
    console.error("Registration error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        message: messages.join(", "),
        success: false,
      })
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
        success: false,
      })
    }

    return res.status(500).json({
      message: "Server error during registration",
      success: false,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
