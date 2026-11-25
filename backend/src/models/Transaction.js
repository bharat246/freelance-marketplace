import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contract: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
  milestoneId: String,
  stripeSessionId: String,
  stripePaymentIntentId: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: "inr" },
  status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
