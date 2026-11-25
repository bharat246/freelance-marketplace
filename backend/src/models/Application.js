import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coverLetter: { type: String, required: true },
  proposedPrice: { type: Number, required: true, min: 1 },
  deliveryDays: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
}, { timestamps: true });

applicationSchema.index({ job: 1, freelancer: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
