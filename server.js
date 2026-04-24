// ==========================
// 📁 server.js (ADVANCED PRO VERSION)
// ==========================
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import compression from "compression";

import connectDB from "./db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import adminRoutes from "./routes/admin/adminRoutes.js";

// ======================
// ⚙️ LOAD ENV
// ======================
dotenv.config();

// ======================
// 🚀 INIT APP
// ======================
const app = express();

// ======================
// 🛡️ GLOBAL SECURITY
// ======================
app.use(helmet());

// ======================
// 🌐 CORS CONFIG
// ======================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  })
);

// ======================
// 🚫 RATE LIMITING
// ======================
const limiter = rateLimit({
  max: 200,
  windowMs: 15 * 60 * 1000,
  message: {
    status: "fail",
    message: "Too many requests, try again later"
  }
});

app.use("/api", limiter);

// ======================
// 🔒 DATA SANITIZATION
// ======================
app.use(mongoSanitize()); // NoSQL injection
app.use(xss()); // XSS protection
app.use(hpp()); // Prevent param pollution

// ======================
// 📦 BODY PARSER
// ======================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ======================
// ⚡ PERFORMANCE
// ======================
app.use(compression());

// ======================
// 📊 LOGGING
// ======================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ======================
// 🗄️ DATABASE
// ======================
connectDB();

// ======================
// 🚀 ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/admin", adminRoutes);

// ======================
// 🩺 HEALTH CHECK
// ======================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    uptime: process.uptime(),
    message: "Tech Academy API running 🚀",
    timestamp: new Date()
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

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ======================
// 🌐 SERVER START
// ======================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ======================
// 🔥 UNHANDLED REJECTIONS
// ======================
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION 💥", err.message);
  server.close(() => process.exit(1));
});

// ======================
// 🔥 UNCAUGHT EXCEPTIONS
// ======================
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥", err.message);
  process.exit(1);
});