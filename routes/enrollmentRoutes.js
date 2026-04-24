import express from "express";
import {
  enrollCourse,
  getMyCourses,
  updateProgress,
  removeEnrollment
} from "../controllers/enrollmentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// 🔐 APPLY AUTH TO ALL ROUTES
// ==========================
router.use(protect);

// ==========================
// 🎓 ENROLLMENT ROUTES
// ==========================

// 📌 Enroll in a course
// POST /api/enrollments
router.post("/", enrollCourse);

// 📥 Get logged-in user's courses
// GET /api/enrollments/my-courses
router.get("/my-courses", getMyCourses);

// 🔄 Update progress (RESTFUL)
// PATCH /api/enrollments/:enrollmentId/progress
router.patch("/:enrollmentId/progress", updateProgress);

// ❌ Remove enrollment
// DELETE /api/enrollments/:enrollmentId
router.delete("/:enrollmentId", removeEnrollment);

// ==========================
// 🛡️ FALLBACK HANDLER
// ==========================
router.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Enrollment route not found"
  });
});

export default router;