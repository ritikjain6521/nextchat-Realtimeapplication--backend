import mongoose from "mongoose";

const creditPackSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. Starter Pack, Pro Pack
  credits: { type: Number, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: '₹' },
  color: { type: String, default: 'from-gray-500 to-gray-600' }, // Tailwind gradient classes
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const CreditPack = mongoose.model("CreditPack", creditPackSchema);
export default CreditPack;
