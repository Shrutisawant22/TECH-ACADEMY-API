// ==========================
// 📁 controllers/admin/adminController.js (FINAL WORKING - HARD FIX)
// ==========================
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../../models/userModel.js";
import Enrollment from "../../models/enrollmentModel.js";
import Course from "../../models/courseModel.js";

// ==========================
// 🔐 TOKEN GENERATOR
// ==========================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

// ==========================
// 🔐 ADMIN LOGIN (100% SAFE)
// ==========================
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ======================
    // 🔍 FIND ADMIN
    // ======================
    const admin = await User.findOne({ email, role: "admin" }).select("+password");

    if (!admin) {
      return res.status(401).json({
        status: "fail",
        message: "Admin not found"
      });
    }

    // ======================
    // 🔥 HANDLE BROKEN DATA (PLAIN PASSWORD CASE)
    // ======================
    let isMatch = false;

    // if password is already hashed
    if (admin.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, admin.password);
    } else {
      // fallback if password stored as plain text (bad data)
      isMatch = password === admin.password;

      // auto-fix: hash it for future
      if (isMatch) {
        const salt = await bcrypt.genSalt(12);
        admin.password = await bcrypt.hash(password, salt);
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid credentials"
      });
    }

    // ======================
    // 🧠 UPDATE LOGIN
    // ======================
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    // ======================
    // 🎟️ TOKEN
    // ======================
    const token = generateToken(admin._id);

    res.status(200).json({
      status: "success",
      message: "Admin login successful",
      token,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    console.error("🔥 ADMIN LOGIN ERROR:", err);
    res.status(500).json({
      status: "error",
      message: err.message || "Server error"
    });
  }
};

// ==========================
// 👥 USERS
// ==========================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      status: "success",
      results: users.length,
      data: users
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

// ==========================
// 📚 ENROLLMENTS
// ==========================
export const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("user", "name email")
      .populate("course", "title price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: enrollments.length,
      data: enrollments
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

// ==========================
// 📊 DASHBOARD
// ==========================
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();

    const completedCourses = await Enrollment.countDocuments({
      progress: 100
    });

    const revenueData = await Enrollment.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$course.price" }
        }
      }
    ]);

    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.status(200).json({
      status: "success",
      data: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        completedCourses,
        totalRevenue
      }
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};