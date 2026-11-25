import express from "express";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { protect, allowRoles } from "../middleware/auth.js";
import { notify } from "../utils/notify.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { q, category, minBudget, maxBudget, status = "open", skill } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) filter.$text = { $search: q };
  if (category) filter.category = new RegExp(`^${category}$`, "i");
  if (skill) filter.skills = { $in: [new RegExp(skill, "i")] };
  if (minBudget || maxBudget) {
    filter.budgetMax = {};
    if (minBudget) filter.budgetMax.$gte = Number(minBudget);
    if (maxBudget) filter.budgetMin = { $lte: Number(maxBudget) };
  }

  const jobs = await Job.find(filter).populate("client", "name avatar businessName").sort("-createdAt").limit(100);
  res.json({ jobs });
});

router.get("/mine", protect, allowRoles("client"), async (req, res) => {
  const jobs = await Job.find({ client: req.user._id }).sort("-createdAt");
  res.json({ jobs });
});

router.get("/:id", async (req, res) => {
  const job = await Job.findById(req.params.id).populate("client", "name avatar businessName");
  if (!job) return res.status(404).json({ message: "Job not found" });
  const applications = await Application.find({ job: job._id })
    .populate("freelancer", "name avatar skills ratingAverage ratingCount bio")
    .sort("-createdAt");
  res.json({ job, applications });
});

router.post("/", protect, allowRoles("client"), async (req, res) => {
  const job = await Job.create({ ...req.body, client: req.user._id });
  res.status(201).json({ job });
});

router.put("/:id", protect, allowRoles("client"), async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, client: req.user._id });
  if (!job) return res.status(404).json({ message: "Job not found" });
  const allowed = ["title", "description", "category", "skills", "budgetMin", "budgetMax", "deadline", "location", "status"];
  for (const key of allowed) if (req.body[key] !== undefined) job[key] = req.body[key];
  await job.save();
  res.json({ job });
});

router.delete("/:id", protect, allowRoles("client"), async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, client: req.user._id });
  if (!job) return res.status(404).json({ message: "Job not found" });
  await Application.deleteMany({ job: job._id });
  res.json({ message: "Job deleted" });
});

router.post("/:id/apply", protect, allowRoles("freelancer"), async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job || job.status !== "open") return res.status(404).json({ message: "Job is not open" });

  try {
    const application = await Application.create({
      job: job._id,
      freelancer: req.user._id,
      coverLetter: req.body.coverLetter,
      proposedPrice: req.body.proposedPrice,
      deliveryDays: req.body.deliveryDays
    });

    await notify(job.client, "New job application", `${req.user.name} applied to "${job.title}".`, "application", `/jobs/${job._id}`);
    res.status(201).json({ application });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "You already applied to this job" });
    throw e;
  }
});

export default router;
