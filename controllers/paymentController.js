// controllers/paymentController.js
import Payment from "../models/Payment.js";
import crypto from "crypto";

// Initiate payment
export const initiatePayment = async (req, res) => {
  try {
    const { plan, method } = req.body;
    if (!plan || !method) return res.status(400).json({ success: false, message: "Plan & method required" });

    const amounts = { pro: 2000, business: 5000 };
    const amount = amounts[plan];

    const paymentId = crypto.randomBytes(8).toString("hex");

    // Mock metadata
    const meta = {
      upiId: "user@upi",
      bankOptions: ["SBI", "HDFC", "ICICI", "Axis"],
      txnRef: crypto.randomBytes(6).toString("hex"),
    };

    const payment = await Payment.create({
      paymentId,
      user: req.user._id,
      plan,
      method,
      amount,
      meta,
    });

    res.json({ success: true, session: payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to initiate payment" });
  }
};

// Confirm payment
export const confirmPayment = async (req, res) => {
  try {
    const { paymentId, simulatedResult } = req.body;
    if (!paymentId) return res.status(400).json({ success: false, message: "Payment ID required" });

    const payment = await Payment.findOne({ paymentId });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    payment.status = simulatedResult === "success" ? "SUCCESS" : "FAILED";
    await payment.save();

    // Optional: update user's storage limit
    if (simulatedResult === "success") {
      const user = req.user;
      if (payment.plan === "pro") user.storageLimit = 50 * 1024 * 1024 * 1024; // 50GB
      if (payment.plan === "business") user.storageLimit = 200 * 1024 * 1024 * 1024; // 200GB
      await user.save();
    }

    res.json({
      success: true,
      message: `Payment ${payment.status}`,
      plan: payment.plan,
      storageLimit: req.user.storageLimit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to confirm payment" });
  }
};
