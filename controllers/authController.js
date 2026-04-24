// ==========================
// 📁 controllers/authController.js (ULTRA ADVANCED)
// ==========================
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

// ==========================
// 🔑 GENERATE TOKEN
// ==========================
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ==========================
// 🍪 SEND TOKEN RESPONSE
// ==========================
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: {
      user
    }
  });
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
    // 🔍 CHECK EXISTING USER
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

    sendTokenResponse(user, 201, res, "User registered successfully");

  } catch (error) {
    next(error);
  }
};

// ==========================
// 🔐 LOGIN USER (FINAL FIX)
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
    // 🔐 SAFE PASSWORD CHECK
    // ======================
    let isMatch = false;

    // if hashed password
    if (user.password && user.password.startsWith("$2")) {
      const bcrypt = await import("bcryptjs");
      isMatch = await bcrypt.default.compare(password, user.password);
    } else {
      // fallback (plain password case)
      isMatch = password === user.password;

      // auto-fix: hash password
      if (isMatch) {
        const bcrypt = await import("bcryptjs");
        const salt = await bcrypt.default.genSalt(12);
        user.password = await bcrypt.default.hash(password, salt);
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials"
      });
    }

    // ======================
    // 🧠 UPDATE LAST LOGIN
    // ======================
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // ======================
    // 🎟️ RESPONSE
    // ======================
    sendTokenResponse(user, 200, res, "Login successful");

  } catch (error) {
    next(error);
  }
};
// ==========================
// 👤 GET CURRENT USER
// ==========================
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: "success",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// 🔄 UPDATE PROFILE
// ==========================
export const updateProfile = async (req, res, next) => {
  try {
    const updates = {
      name: req.body.name,
      avatar: req.body.avatar
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: "success",
      message: "Profile updated",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// 🔑 CHANGE PASSWORD
// ==========================
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Both current and new password required"
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        status: "fail",
        message: "Current password incorrect"
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, "Password updated successfully");

  } catch (error) {
    next(error);
  }
};

// ==========================
// 🚪 LOGOUT
// ==========================
export const logout = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Logged out successfully"
  });
};