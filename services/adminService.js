// ==========================
// 📁 services/adminService.js (ADVANCED VERSION)
// ==========================
import User from "../models/userModel.js";
import Course from "../models/courseModel.js";
import Enrollment from "../models/enrollmentModel.js";

// ==========================
// 👥 GET USERS (WITH FILTERS)
// ==========================
export const fetchUsers = async (query = {}) => {
  const { search, role, page = 1, limit = 10 } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  if (role) filter.role = role;

  const skip = (page - 1) * limit;

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  return {
    users,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  };
};

// ==========================
// 📚 GET ENROLLMENTS (FULL DATA)
// ==========================
export const fetchEnrollments = async (query = {}) => {
  const { page = 1, limit = 10 } = query;

  const skip = (page - 1) * limit;

  const enrollments = await Enrollment.find()
    .populate("user", "name email")
    .populate("course", "title price")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Enrollment.countDocuments();

  return {
    enrollments,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  };
};

// ==========================
// 📊 DASHBOARD STATS
// ==========================
export const fetchDashboardStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalCourses = await Course.countDocuments();
  const totalEnrollments = await Enrollment.countDocuments();

  const completedCourses = await Enrollment.countDocuments({
    progress: 100
  });

  // Revenue aggregation
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

  return {
    totalUsers,
    totalCourses,
    totalEnrollments,
    completedCourses,
    totalRevenue
  };
};

// ==========================
// ❌ DELETE USER
// ==========================
export const deleteUserById = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// ==========================
// ❌ DELETE COURSE
// ==========================
export const deleteCourseById = async (courseId) => {
  const course = await Course.findByIdAndDelete(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
};

// ==========================
// 🔄 UPDATE COURSE
// ==========================
export const updateCourseById = async (courseId, updateData) => {
  const course = await Course.findByIdAndUpdate(
    courseId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
};