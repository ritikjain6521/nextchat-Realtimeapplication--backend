import mongoose from "mongoose";

const campaignSchema = mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["Push", "Email", "Both"], default: "Push" },
  targetAudience: { type: String, enum: ["All Users", "Free Users", "Pro Users", "Team Users", "Enterprise Users"], default: "All Users" },
  sentCount: { type: Number, default: 0 },
  status: { type: String, enum: ["Sent", "Scheduled", "Draft"], default: "Sent" },
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
