import express from "express";
import Review from "../models/Review.js";
import Contract from "../models/Contract.js";
import User from "../models/User.js";
import { protect, allowRoles } from "../middleware/auth.js";
import { notify } from "../utils/notify.js";

const router = express.Router();

router.get("/freelancer/:id", async (req, res) => {
  const reviews = await Review.find({ freelancer: req.params.id })
    .populate("client", "name avatar")
    .sort("-createdAt");
  res.json({ reviews });
});

router.post("/", protect, allowRoles("client"), async (req, res) => {
  const { contractId, rating, comment } = req.body;
  const contract = await Contract.findOne({
    _id: contractId,
    client: req.user._id,
    status: "completed"
  });

  if (!contract) return res.status(400).json({ message: "Only completed contracts can be reviewed" });

  try {
    const review = await Review.create({
      contract: contract._id,
      client: req.user._id,
      freelancer: contract.freelancer,
      rating,
      comment
    });

    const stats = await Review.aggregate([
      { $match: { freelancer: contract.freelancer } },
      { $group: { _id: "$freelancer", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    if (stats[0]) {
      await User.findByIdAndUpdate(contract.freelancer, {
        ratingAverage: Math.round(stats[0].avg * 10) / 10,
        ratingCount: stats[0].count
      });
    }

    await notify(contract.freelancer, "New review", `${req.user.name} left you a ${rating}-star review.`, "review", `/profile/${contract.freelancer}`);
    res.status(201).json({ review });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "This contract already has a review" });
    throw e;
  }
});

router.post("/:id/respond", protect, allowRoles("freelancer"), async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, freelancer: req.user._id });
  if (!review) return res.status(404).json({ message: "Review not found" });

  review.freelancerResponse = req.body.response;
  review.respondedAt = new Date();
  await review.save();

  await notify(review.client, "Freelancer responded", `${req.user.name} responded to your review.`, "review", `/profile/${req.user._id}`);
  res.json({ review });
});

export default router;
