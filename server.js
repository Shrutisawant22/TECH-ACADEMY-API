import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import connectDB from "./db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";

// Load env variables
dotenv.config();

// Initialize app
const app = express();

// ======================
// 🔐 SECURITY MIDDLEWARE
// ======================
app.use(helmet()); // Protect headers
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

// ======================
// 📦 BODY PARSER
// ======================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ======================
// 📊 LOGGING
// ======================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ======================
// 🗄️ DATABASE CONNECTION
// ======================
connectDB();

// ======================
// 🚀 ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Tech Academy API is running 🚀"
  });
});

// ======================
// ❌ 404 HANDLER
// ======================
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`
  });
});

// ======================
// ⚠️ GLOBAL ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  console.error("ERROR 💥", err);

  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error"
  });
});

// ======================
// 🌐 SERVER START
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});