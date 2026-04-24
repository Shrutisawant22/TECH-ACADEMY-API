import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteOne({ email: "admin@tech.com" });

    const admin = await User.create({
      name: "Admin",
      email: "admin@tech.com",
      password: "admin123",
      role: "admin"
    });

    console.log("✅ Admin created:", admin.email);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();