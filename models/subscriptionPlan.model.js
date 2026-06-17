import mongoose from "mongoose";

const subscriptionPlanSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. Free, Pro, Team, Enterprise
  price: { type: Number, required: true },
  currency: { type: String, default: '₹' },
  billingCycle: { type: String, enum: ['Monthly', 'Yearly', 'One-Time'], default: 'Monthly' },
  features: [{ type: String }],
  color: { type: String, default: 'from-gray-500 to-gray-600' }, // Tailwind gradient classes
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
export default SubscriptionPlan;
