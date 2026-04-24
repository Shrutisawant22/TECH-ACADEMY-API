import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// ==========================
// 🔐 VERIFY ADMIN TOKEN
// ==========================
export const verifyAdmin = async (req, res, next) => {
  try {
    let token;

    // Extract token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized: No token"
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: "fail",
        message:
          err.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token"
      });
    }

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User not found"
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Access denied: Admin only"
      });
    }

    // Attach admin
    req.admin = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    console.error("Admin Auth Error:", err.message);

    return res.status(500).json({
      status: "error",
      message: "Server error in admin auth"
    });
  }
};

// ==========================
// 🛡 MULTI ROLE ADMIN CHECK
// ==========================
export const allowRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        return res.status(401).json({
          status: "fail",
          message: "Unauthorized"
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
          status: "fail",
          message: "Access denied"
        });
      }

      req.admin = {
        id: user._id,
        role: user.role
      };

      next();
    } catch {
      return res.status(401).json({
        status: "fail",
        message: "Invalid or expired token"
      });
    }
  };
};

// ==========================
// ⚡ QUICK ADMIN CHECK
// ==========================
export const adminOnly = verifyAdmin;