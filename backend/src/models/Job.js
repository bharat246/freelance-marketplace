import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  skills: [String],
  budgetMin: { type: Number, min: 0 },
  budgetMax: { type: Number, min: 0 },
  deadline: Date,
  location: String,
  status: { type: String, enum: ["open", "in_progress", "completed", "closed"], default: "open" }
}, { timestamps: true });

jobSchema.index({ title: "text", description: "text", category: "text", skills: "text" });

export default mongoose.model("Job", jobSchema);
