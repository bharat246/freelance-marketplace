import express from "express";
import Service from "../models/Service.js";
import Review from "../models/Review.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { q, category, minPrice, maxPrice, availability } = req.query;
  const filter = { isActive: true };

  if (q) filter.$text = { $search: q };
  if (category) filter.category = new RegExp(`^${category}$`, "i");
  if (availability) filter.availability = availability;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const services = await Service.find(filter)
    .populate("freelancer", "name avatar location skills ratingAverage ratingCount")
    .sort("-createdAt")
    .limit(100);

  res.json({ services });
});

router.get("/:id", async (req, res) => {
  const service = await Service.findById(req.params.id).populate("freelancer", "name avatar location skills ratingAverage ratingCount bio portfolio");
  if (!service) return res.status(404).json({ message: "Service not found" });
  const reviews = await Review.find({ freelancer: service.freelancer._id })
    .populate("client", "name avatar")
    .sort("-createdAt")
    .limit(20);
  res.json({ service, reviews });
});

router.post("/", protect, allowRoles("freelancer"), async (req, res) => {
  const service = await Service.create({ ...req.body, freelancer: req.user._id });
  res.status(201).json({ service });
});

router.put("/:id", protect, allowRoles("freelancer"), async (req, res) => {
  const service = await Service.findOne({ _id: req.params.id, freelancer: req.user._id });
  if (!service) return res.status(404).json({ message: "Service not found" });

  const allowed = ["title", "description", "category", "price", "deliveryDays", "availability", "samples", "isActive"];
  for (const key of allowed) if (req.body[key] !== undefined) service[key] = req.body[key];
  await service.save();
  res.json({ service });
});

router.delete("/:id", protect, allowRoles("freelancer"), async (req, res) => {
  const service = await Service.findOneAndDelete({ _id: req.params.id, freelancer: req.user._id });
  if (!service) return res.status(404).json({ message: "Service not found" });
  res.json({ message: "Service deleted" });
});

export default router;
