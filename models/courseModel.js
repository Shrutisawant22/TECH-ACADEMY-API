import mongoose from "mongoose";

// ==========================
// 📄 COURSE SCHEMA
// ==========================
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"]
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [50, "Description must be at least 50 characters"]
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Web Development",
        "Data Science",
        "Mobile Development",
        "AI & ML",
        "Cyber Security",
        "Cloud Computing"
      ]
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner"
    },

    thumbnail: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1518770660439-4636190af475"
    },

    instructor: {
      type: String,
      required: true,
      default: "Tech Academy Team"
    },

    duration: {
      type: Number, // in hours
      required: true,
      min: [1, "Duration must be at least 1 hour"]
    },

    price: {
      type: Number,
      default: 0
    },

    studentsEnrolled: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },

    tags: [
      {
        type: String
      }
    ],

    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// ==========================
// 🔍 INDEXING (PERFORMANCE)
// ==========================
courseSchema.index({ title: "text", description: "text" });

// ==========================
// 📊 VIRTUAL FIELD
// ==========================
courseSchema.virtual("formattedDuration").get(function () {
  return `${this.duration} hrs`;
});

// ==========================
// 📦 CLEAN RESPONSE
// ==========================
courseSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.__v;
  return obj;
};

// ==========================
// 📦 EXPORT MODEL
// ==========================
const Course = mongoose.model("Course", courseSchema);

export default Course;