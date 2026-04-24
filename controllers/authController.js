import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

// ==========================
// 🔑 GENERATE TOKEN
// ==========================
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ==========================
// 📝 REGISTER USER
// ==========================
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ======================
    // ✅ VALIDATION
    // ======================
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 6 characters"
      });
    }

    // ======================
    // 🔍 CHECK USER EXISTS
    // ======================
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User already exists"
      });
    }

    // ======================
    // 👤 CREATE USER
    // ======================
    const user = await User.create({
      name,
      email,
      password
    });

    // ======================
    // 🎟️ TOKEN
    // ======================
    const token = generateToken(user._id);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user,
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

// ==========================
// 🔐 LOGIN USER
// ==========================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ======================
    // ✅ VALIDATION
    // ======================
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required"
      });
    }

    // ======================
    // 🔍 FIND USER
    // ======================
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials"
      });
    }

    // ======================
    // 🔑 CHECK PASSWORD
    // ======================
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials"
      });
    }

    // ======================
    // 🎟️ TOKEN
    // ======================
    const token = generateToken(user._id);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user,
        token
      }
    });

  } catch (error) {
    next(error);
  }
};