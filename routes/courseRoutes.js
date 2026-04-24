import express from "express";
import {
  getCourses,
  seedCourses
} from "../controllers/courseController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// 📚 COURSE ROUTES
// ==========================

// Get all courses (Protected)
router.get("/", protect, getCourses);

// Seed courses (Admin only)
router.post("/seed", protect, authorize("admin"), seedCourses);

export default router;