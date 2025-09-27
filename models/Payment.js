// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: String, enum: ["pro", "business"], required: true },
  method: { type: String, enum: ["upi", "netbanking", "card"], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" },
  meta: { type: Object, default: {} }, // store UPI ID, bank options, card info (mock)
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
