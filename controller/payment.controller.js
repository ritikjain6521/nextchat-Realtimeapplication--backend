import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";

// Helper to get instance after dotenv loads
const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

export const createOrder = async (req, res) => {
    try {
        const { amount, plan } = req.body; // Amount should be in rupees

        if (!amount || !plan) {
            return res.status(400).json({ message: "Amount and plan are required" });
        }

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise (multiply by 100)
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        const razorpayInstance = getRazorpayInstance();
        const order = await razorpayInstance.orders.create(options);

        if (!order) {
            return res.status(500).json({ message: "Failed to create order" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay Create Order Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan,
            amount,
            creditsToAdd
        } = req.body;

        const userId = req.user._id;

        // Verify Signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: "Invalid payment signature!" });
        }

        // Fetch User
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create Payment Record for Admin Dashboard
        const newPayment = new Payment({
            userId,
            fullname: user.fullname,
            email: user.email,
            amount: Number(amount),
            plan: plan || 'Credit Pack',
            gateway: "Razorpay",
            transactionId: razorpay_payment_id,
            status: "Success"
        });
        await newPayment.save();

        // Update User Plan & Credits
        if (plan && plan !== 'Credit Pack') {
            user.plan = plan;
        }
        if (creditsToAdd) {
            user.credits = (user.credits || 0) + Number(creditsToAdd);
        }
        await user.save();

        res.status(200).json({
            message: "Payment verified successfully",
            user: { _id: user._id, fullname: user.fullname, email: user.email, plan: user.plan, credits: user.credits }
        });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
