import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true, min: 1 },
  dueDate: Date,
  status: {
    type: String,
    enum: ["pending", "funded", "submitted", "approved", "paid", "cancelled"],
    default: "pending"
  },
  paymentId: String,
  paidAt: Date
});

const contractSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  title: { type: String, required: true },
  description: String,
  totalAmount: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ["draft", "active", "completed", "cancelled"], default: "draft" },
  milestones: [milestoneSchema]
}, { timestamps: true });

export default mongoose.model("Contract", contractSchema);
