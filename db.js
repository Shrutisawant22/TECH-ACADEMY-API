import mongoose from "mongoose";

const MAX_RETRIES = 5;
let retryCount = 0;

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is not defined in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "tech_academy",
      autoIndex: false, // better for production
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // =========================
    // 🔁 CONNECTION EVENTS
    // =========================
    mongoose.connection.on("connected", () => {
      console.log("📡 Mongoose connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

  } catch (error) {
    console.error(`❌ DB Connection Failed: ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`🔁 Retrying connection... (${retryCount}/${MAX_RETRIES})`);

      setTimeout(connectDB, 5000); // retry after 5 sec
    } else {
      console.error("💥 Max retries reached. Exiting...");
      process.exit(1);
    }
  }
};

export default connectDB;