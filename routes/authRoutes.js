// ==========================
// 📁 routes/authRoutes.js (ADVANCED VERSION)
// ==========================
import express from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// 🚫 RATE LIMIT (ANTI-BRUTE FORCE)
// ==========================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: {
    status: "fail",
    message: "Too many requests, try again later"
  }
});

// ==========================
// 🔐 AUTH ROUTES
// ==========================

// Register
router.post("/register", authLimiter, register);

// Login
router.post("/login", authLimiter, login);

// Logout
router.post("/logout", protect, logout);

// ==========================
// 👤 USER ROUTES
// ==========================

// Get current user
router.get("/me", protect, getMe);

// Update profile
router.put("/update-profile", protect, updateProfile);

// Change password
router.put("/change-password", protect, changePassword);

export default router;