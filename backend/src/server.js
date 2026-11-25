import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import passport from "passport";
import { connectDB } from "./config/db.js";
import { configurePassport } from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import serviceRoutes from "./routes/services.js";
import jobRoutes from "./routes/jobs.js";
import contractRoutes from "./routes/contracts.js";
import reviewRoutes from "./routes/reviews.js";
import notificationRoutes from "./routes/notifications.js";
import paymentRoutes from "./routes/payments.js";
import uploadRoutes from "./routes/uploads.js";
import path from "path";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();
configurePassport();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "freelance-marketplace-api" }));

// Stripe webhook must receive raw body before express.json().
app.use("/api/payments/webhook", paymentRoutes);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 150 }), authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
