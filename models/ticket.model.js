import mongoose from "mongoose";

const ticketSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ["Technical", "Billing", "Credits", "General", "Refund"], default: "General" },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  status: { type: String, enum: ["Open", "In Progress", "Resolved", "Closed"], default: "Open" },
  replies: [{
    from: { type: String, enum: ["User", "Admin"], default: "Admin" },
    message: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
