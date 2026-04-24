// ==========================
// 📁 routes/admin/adminRoutes.js (ADVANCED VERSION)
// ==========================
import express from "express";

import {
  adminLogin,
  getAllUsers,
  getAllEnrollments
} from "../../controllers/admin/adminController.js";

import { getDashboardStats } from "../../controllers/admin/dashboardController.js";

import {
  verifyAdmin,
  allowRoles
} from "../../middleware/adminMiddleware.js";

const router = express.Router();

// ==========================
// 🔐 AUTH ROUTES
// ==========================
router.post("/login", adminLogin);

// ==========================
// 🛡 PROTECTED ADMIN ROUTES
// ==========================

// Dashboard Stats
router.get(
  "/dashboard",
  verifyAdmin,
  getDashboardStats
);

// Get All Users
router.get(
  "/users",
  verifyAdmin,
  allowRoles("admin"),
  getAllUsers
);

// Get All Enrollments (User + Course + Payment)
router.get(
  "/enrollments",
  verifyAdmin,
  allowRoles("admin"),
  getAllEnrollments
);

// ==========================
// 🧪 FUTURE EXTENSIONS (READY)
// ==========================

// Delete User
// router.delete(
//   "/users/:id",
//   verifyAdmin,
//   allowRoles("admin"),
//   deleteUser
// );

// Update Course
// router.put(
//   "/courses/:id",
//   verifyAdmin,
//   allowRoles("admin"),
//   updateCourse
// );

export default router;