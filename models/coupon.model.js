import mongoose from "mongoose";

const couponSchema = mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ["Credits", "Percentage", "Flat"], required: true },
  discountValue: { type: String, required: true }, // e.g. "100", "50%", "₹200"
  usageCount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 500 },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
