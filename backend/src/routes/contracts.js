import express from "express";
import Contract from "../models/Contract.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { protect } from "../middleware/auth.js";
import { notify } from "../utils/notify.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const filter = req.user.role === "client"
    ? { client: req.user._id }
    : { freelancer: req.user._id };

  const contracts = await Contract.find(filter)
    .populate("client", "name avatar")
    .populate("freelancer", "name avatar")
    .populate("job", "title")
    .sort("-createdAt");

  res.json({ contracts });
});

router.get("/:id", protect, async (req, res) => {
  const contract = await Contract.findById(req.params.id)
    .populate("client", "name avatar businessName")
    .populate("freelancer", "name avatar skills")
    .populate("job", "title");

  if (!contract) return res.status(404).json({ message: "Contract not found" });
  const allowed = [contract.client._id.toString(), contract.freelancer._id.toString()];
  if (!allowed.includes(req.user._id.toString())) return res.status(403).json({ message: "Forbidden" });

  res.json({ contract });
});

router.post("/", protect, async (req, res) => {
  if (req.user.role !== "client") return res.status(403).json({ message: "Only clients create contracts" });

  const { freelancer, job, title, description, totalAmount, milestones = [] } = req.body;
  const contract = await Contract.create({
    client: req.user._id,
    freelancer,
    job,
    title,
    description,
    totalAmount,
    milestones,
    status: "active"
  });

  if (job) await Job.findByIdAndUpdate(job, { status: "in_progress" });
  await notify(freelancer, "New contract", `You received a new contract: ${title}.`, "contract", `/contracts/${contract._id}`);

  res.status(201).json({ contract });
});

router.put("/:id", protect, async (req, res) => {
  const contract = await Contract.findById(req.params.id);
  if (!contract) return res.status(404).json({ message: "Contract not found" });

  if (contract.client.toString() !== req.user._id.toString() &&
      contract.freelancer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.body.description !== undefined) contract.description = req.body.description;
  if (req.body.status !== undefined) contract.status = req.body.status;
  if (req.body.title !== undefined && req.user.role === "client") contract.title = req.body.title;
  await contract.save();

  res.json({ contract });
});

router.patch("/:id/milestones/:milestoneId", protect, async (req, res) => {
  const contract = await Contract.findById(req.params.id);
  if (!contract) return res.status(404).json({ message: "Contract not found" });

  const participant = [contract.client.toString(), contract.freelancer.toString()].includes(req.user._id.toString());
  if (!participant) return res.status(403).json({ message: "Forbidden" });

  const milestone = contract.milestones.id(req.params.milestoneId);
  if (!milestone) return res.status(404).json({ message: "Milestone not found" });

  if (req.user.role === "freelancer" && req.body.status !== "submitted") {
    return res.status(403).json({ message: "Freelancers can submit milestones" });
  }
  if (req.user.role === "client" && !["approved", "cancelled"].includes(req.body.status)) {
    return res.status(403).json({ message: "Invalid client milestone status" });
  }

  milestone.status = req.body.status;
  await contract.save();

  const target = req.user.role === "client" ? contract.freelancer : contract.client;
  await notify(target, "Milestone updated", `${milestone.title} is now ${milestone.status}.`, "milestone", `/contracts/${contract._id}`);

  res.json({ contract });
});

router.post("/:id/complete", protect, async (req, res) => {
  const contract = await Contract.findOne({ _id: req.params.id, client: req.user._id });
  if (!contract) return res.status(404).json({ message: "Contract not found" });

  contract.status = "completed";
  contract.milestones.forEach(m => {
    if (m.status === "approved") m.status = "paid";
  });
  await contract.save();

  if (contract.job) await Job.findByIdAndUpdate(contract.job, { status: "completed" });
  await notify(contract.freelancer, "Contract completed", `Contract "${contract.title}" has been completed.`, "contract", `/contracts/${contract._id}`);

  res.json({ contract });
});

router.get("/application/:applicationId", protect, async (req, res) => {
  const application = await Application.findById(req.params.applicationId).populate("freelancer", "name email");
  if (!application) return res.status(404).json({ message: "Application not found" });
  res.json({ application });
});

export default router;
