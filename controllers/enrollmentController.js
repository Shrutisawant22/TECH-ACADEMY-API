import mongoose from "mongoose";
import Enrollment from "../models/enrollmentModel.js";
import Course from "../models/courseModel.js";

// ==========================
// 📌 ENROLL IN COURSE
// ==========================
export const enrollCourse = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    // ======================
    // ✅ VALIDATION
    // ======================
    if (!courseId) {
      return res.status(400).json({
        status: "fail",
        message: "Course ID is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid course ID"
      });
    }

    // ======================
    // 🔍 CHECK COURSE EXISTS
    // ======================
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found"
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        status: "fail",
        message: "Course not available"
      });
    }

    // ======================
    // 🚫 PREVENT DUPLICATE
    // ======================
    const existing = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: "Already enrolled in this course"
      });
    }

    // ======================
    // 📦 CREATE ENROLLMENT
    // ======================
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId
    });

    // ======================
    // 📈 UPDATE COURSE STATS
    // ======================
    course.studentsEnrolled += 1;
    await course.save();

    // ======================
    // 📤 RESPONSE
    // ======================
    res.status(201).json({
      status: "success",
      message: "Enrolled successfully",
      data: enrollment
    });

  } catch (error) {
    next(error);
  }
};

// ==========================
// 📥 GET MY COURSES
// ==========================
export const getMyCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.find({ user: userId })
      .populate(
        "course",
        "title description thumbnail rating studentsEnrolled level"
      )
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: enrollments.length,
      data: enrollments
    });

  } catch (error) {
    next(error);
  }
};

// ==========================
// 🔄 UPDATE PROGRESS (RESTFUL)
// ==========================
export const updateProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { enrollmentId } = req.params;
    const { progress } = req.body;

    // ======================
    // ✅ VALIDATION
    // ======================
    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid enrollment ID"
      });
    }

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        status: "fail",
        message: "Progress must be between 0 and 100"
      });
    }

    // ======================
    // 🔍 FIND ENROLLMENT
    // ======================
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId
    });

    if (!enrollment) {
      return res.status(404).json({
        status: "fail",
        message: "Enrollment not found"
      });
    }

    // ======================
    // 🔄 UPDATE
    // ======================
    enrollment.progress = progress;
    enrollment.lastAccessed = new Date();

    await enrollment.save();

    res.status(200).json({
      status: "success",
      message: "Progress updated",
      data: enrollment
    });

  } catch (error) {
    next(error);
  }
};

// ==========================
// ❌ REMOVE ENROLLMENT
// ==========================
export const removeEnrollment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { enrollmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid enrollment ID"
      });
    }

    const enrollment = await Enrollment.findOneAndDelete({
      _id: enrollmentId,
      user: userId
    });

    if (!enrollment) {
      return res.status(404).json({
        status: "fail",
        message: "Enrollment not found"
      });
    }

    // ======================
    // 📉 DECREMENT COUNT
    // ======================
    await Course.findByIdAndUpdate(enrollment.course, {
      $inc: { studentsEnrolled: -1 }
    });

    res.status(200).json({
      status: "success",
      message: "Course removed successfully"
    });

  } catch (error) {
    next(error);
  }
};