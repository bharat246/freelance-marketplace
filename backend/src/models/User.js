import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  provider: { type: String, enum: ["local", "google"], default: "local" },
  role: { type: String, enum: ["freelancer", "client"], default: "client" },
  avatar: String,
  bio: String,
  location: String,
  phone: String,
  skills: [{ type: String, trim: true }],
  portfolio: [{
    title: String,
    description: String,
    url: String,
    imageUrl: String
  }],
  businessName: String,
  businessDescription: String,
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  stripeAccountId: String,
  stripeOnboardingComplete: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

export default mongoose.model("User", userSchema);
