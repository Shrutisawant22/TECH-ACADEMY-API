import mongoose from "mongoose";

// ==========================
// 📄 ENROLLMENT SCHEMA
// ==========================
const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    status: {
      type: String,
      enum: ["enrolled", "in-progress", "completed"],
      default: "enrolled",
      index: true
    },

    lastAccessed: {
      type: Date,
      default: Date.now
    },

    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// ==========================
// 🚫 UNIQUE INDEX (NO DUPLICATES)
// ==========================
enrollmentSchema.index(
  { user: 1, course: 1 },
  { unique: true }
);

// ==========================
// 📊 ADDITIONAL INDEXES (PERFORMANCE)
// ==========================
enrollmentSchema.index({ user: 1, status: 1 });
enrollmentSchema.index({ course: 1, createdAt: -1 });

// ==========================
// 🔄 AUTO STATUS MANAGEMENT
// ==========================
enrollmentSchema.pre("save", function (next) {
  // Normalize progress
  if (this.progress < 0) this.progress = 0;
  if (this.progress > 100) this.progress = 100;

  if (this.progress === 100) {
    this.status = "completed";
    this.completedAt = new Date();
  } else if (this.progress > 0) {
    this.status = "in-progress";
    this.completedAt = undefined;
  } else {
    this.status = "enrolled";
    this.completedAt = undefined;
  }

  this.lastAccessed = new Date();

  next();
});

// ==========================
// 🧠 INSTANCE METHOD
// ==========================
enrollmentSchema.methods.updateProgress = function (value) {
  this.progress = value;
  return this.save();
};

// ==========================
// ⚡ STATIC METHOD (FAST UPDATE)
// ==========================
enrollmentSchema.statics.updateProgressById = async function (
  enrollmentId,
  userId,
  progress
) {
  const enrollment = await this.findOne({
    _id: enrollmentId,
    user: userId
  });

  if (!enrollment) return null;

  enrollment.progress = progress;
  return enrollment.save();
};

// ==========================
// 📊 VIRTUALS
// ==========================
enrollmentSchema.virtual("isCompleted").get(function () {
  return this.progress === 100;
});

enrollmentSchema.virtual("progressLabel").get(function () {
  if (this.progress === 0) return "Not Started";
  if (this.progress === 100) return "Completed";
  return `${this.progress}% Completed`;
});

// ==========================
// 🧹 CLEAN RESPONSE
// ==========================
enrollmentSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });

  delete obj.__v;

  return obj;
};

// ==========================
// 📦 EXPORT MODEL
// ==========================
const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;