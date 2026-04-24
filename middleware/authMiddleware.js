import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// ==========================
// 🔐 PROTECT ROUTES
// ==========================
export const protect = async (req, res, next) => {
  try {
    let token;

    // ======================
    // 📥 GET TOKEN FROM HEADER
    // ======================
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Not authorized, token missing"
      });
    }

    // ======================
    // 🔍 VERIFY TOKEN
    // ======================
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ======================
    // 👤 GET USER
    // ======================
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User no longer exists"
      });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      role: user.role
    };

    next();

  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid or expired token"
    });
  }
};

// ==========================
// 🛡️ ROLE BASED ACCESS
// ==========================
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "Access denied"
      });
    }
    next();
  };
};