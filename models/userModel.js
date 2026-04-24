import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email"
      ]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false // 🔐 hide password by default
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },

    avatar: {
      type: String,
      default: "https://i.pravatar.cc/150"
    }
  },
  {
    timestamps: true
  }
);

// ==========================
// 🔐 PASSWORD HASHING
// ==========================
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// ==========================
// 🔑 COMPARE PASSWORD
// ==========================
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ==========================
// 🧾 SAFE USER OBJECT
// ==========================
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// ==========================
// 📦 EXPORT MODEL
// ==========================
const User = mongoose.model("User", userSchema);

export default User;