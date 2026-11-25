import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();
const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    cb(null, allowed.includes(file.mimetype));
  }
});

router.post("/", protect, allowRoles("freelancer"), upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Valid file is required" });
  const base = `${req.protocol}://${req.get("host")}`;
  res.status(201).json({ url: `${base}/uploads/${req.file.filename}`, filename: req.file.filename });
});

export default router;
