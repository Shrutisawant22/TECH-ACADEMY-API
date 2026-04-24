// ==========================
// 📁 models/userModel.js (FIXED + ADVANCED CLEAN VERSION)
// ==========================
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ==========================
// 📄 USER SCHEMA
// ==========================
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // ✅ keep only here (removed duplicate index below)
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email"
      ]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
      index: true // ✅ keep only here
    },

    avatar: {
      type: String,
      default: "https://i.pravatar.cc/150"
    },

    // ==========================
    // 🔐 SECURITY
    // ==========================
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // ==========================
    // 🟢 STATUS
    // ==========================
    isActive: {
      type: Boolean,
      default: true,
      select: false
    },

    lastLogin: Date
  },
  {
    timestamps: true
  }
);

// ❌ REMOVED DUPLICATE INDEXES (IMPORTANT FIX)
// userSchema.index({ email: 1 });
// userSchema.index({ role: 1 });

// ==========================
// 🔐 HASH PASSWORD
// ==========================
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// ==========================
// 🔑 COMPARE PASSWORD
// ==========================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ==========================
// 🔐 CHECK TOKEN VALIDITY
// ==========================
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTime;
  }
  return false;
};

// ==========================
// 🔁 RESET TOKEN
// ==========================
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// ==========================
// 🧾 SAFE OUTPUT
// ==========================
userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.__v;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;

  return obj;
};

// ==========================
// 📦 EXPORT
// ==========================
const User = mongoose.model("User", userSchema);

export default User;