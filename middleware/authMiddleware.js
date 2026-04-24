import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// ==========================
// 🔐 PROTECT ROUTES (STRICT)
// ==========================
export const protect = async (req, res, next) => {
  try {
    let token;

    // ======================
    // 📥 EXTRACT TOKEN
    // ======================
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ======================
    // ❌ NO TOKEN
    // ======================
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized: No token provided"
      });
    }

    // ======================
    // 🔍 VERIFY TOKEN
    // ======================
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: "fail",
        message:
          err.name === "TokenExpiredError"
            ? "Token expired, please login again"
            : "Invalid token"
      });
    }

    // ======================
    // 👤 FIND USER
    // ======================
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User not found"
      });
    }

    // ======================
    // 🧠 ATTACH USER
    // ======================
    req.user = {
      id: user._id,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Server error in authentication"
    });
  }
};

// ==========================
// 🛡 OPTIONAL AUTH (NON-BLOCKING)
// ==========================
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (user) {
      req.user = {
        id: user._id,
        role: user.role
      };
    }

    next();
  } catch {
    next(); // silently ignore
  }
};

// ==========================
// 🛡 ROLE BASED ACCESS
// ==========================
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: `Access denied for role: ${req.user.role}`
      });
    }

    next();
  };
};

// ==========================
// 🧪 ADMIN ONLY SHORTCUT
// ==========================
export const adminOnly = authorize("admin");