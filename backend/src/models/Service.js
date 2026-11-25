import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 1 },
  deliveryDays: { type: Number, required: true, min: 1 },
  availability: { type: String, default: "available" },
  samples: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

serviceSchema.index({ title: "text", description: "text", category: "text" });

export default mongoose.model("Service", serviceSchema);
