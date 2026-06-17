import mongoose from "mongoose";

const paymentSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullname: { type: String },
  email: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  plan: { type: String, enum: ["Free", "Pro", "Team", "Enterprise"], required: true },
  gateway: { type: String, enum: ["Razorpay", "Stripe", "PayPal", "UPI", "Card"], default: "Razorpay" },
  transactionId: { type: String, unique: true },
  status: { type: String, enum: ["Success", "Failed", "Refunded", "Pending"], default: "Pending" },
  refundedAt: { type: Date },
  refundReason: { type: String },
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
