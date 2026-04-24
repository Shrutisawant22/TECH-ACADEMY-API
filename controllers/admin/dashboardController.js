// ==========================
// 📁 controllers/admin/dashboardController.js
// ==========================
import User from "../../models/userModel.js";
import Course from "../../models/courseModel.js";
import Enrollment from "../../models/enrollmentModel.js";

// ==========================
// 📊 DASHBOARD STATS
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
    console.error("Dashboard Error:", err.message);
    res.status(500).json({
      status: "error",
      message: "Failed to load dashboard"
    });
  }
};