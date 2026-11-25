import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import passport from "passport";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

function safeUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
}

router.post("/register", async (req, res) => {
  const { name, email, password, role = "client" } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  if (!["client", "freelancer"].includes(role)) return res.status(400).json({ message: "Invalid role" });

  const normalized = email.toLowerCase().trim();
  if (await User.findOne({ email: normalized })) return res.status(409).json({ message: "Email already registered" });

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: normalized, password: hash, role, isEmailVerified: true });

  res.status(201).json({ token: signToken(user), user: safeUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase().trim() }).select("+password");
  if (!user?.password || !(await bcrypt.compare(password || "", user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  res.json({ token: signToken(user), user: safeUser(user) });
});

router.get("/me", protect, async (req, res) => res.json({ user: safeUser(req.user) }));

router.post("/forgot-password", async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() });
  if (!user) return res.json({ message: "If the account exists, a reset link has been generated." });

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  // In production send this through email. Returning it makes local development easy.
  res.json({
    message: "Reset token generated. Connect an email provider in production.",
    resetToken: token
  });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 6) return res.status(400).json({ message: "Valid token and 6+ character password required" });

  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() }
  }).select("+password");

  if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.provider = "local";
  await user.save();

  res.json({ message: "Password reset successful" });
});

router.put("/profile", protect, async (req, res) => {
  const allowed = [
    "name", "bio", "location", "phone", "skills", "portfolio",
    "businessName", "businessDescription", "avatar"
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }

  await req.user.save();
  res.json({ user: safeUser(req.user) });
});

router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).send("Google OAuth is not configured.");
  passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login`, session: false }),
  async (req, res) => {
    const token = signToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${encodeURIComponent(token)}`);
  }
);

export default router;
