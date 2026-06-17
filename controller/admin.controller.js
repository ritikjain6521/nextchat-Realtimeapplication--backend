import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';
import Ticket from '../models/ticket.model.js';
import Coupon from '../models/coupon.model.js';
import Campaign from '../models/campaign.model.js';
import SubscriptionPlan from '../models/subscriptionPlan.model.js';
import CreditPack from '../models/creditPack.model.js';

// ─── METRICS ────────────────────────────────────────────────────────────────
export const getMetrics = async (req, res) => {
    try {
        const users = await User.find();
        const payments = await Payment.find({ status: 'Success' });
        const tickets = await Ticket.find();

        const totalUsers = users.length;
        const premiumUsers = users.filter(u => u.plan !== 'Free').length;
        const freeUsers = users.filter(u => u.plan === 'Free').length;
        const totalCreditsCirculating = users.reduce((acc, u) => acc + (u.credits || 0), 0);
        const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
        const openTickets = tickets.filter(t => t.status === 'Open').length;

        let mrr = 0;
        users.forEach(u => {
            if (u.plan === 'Pro') mrr += 299;
            if (u.plan === 'Team') mrr += 999;
            if (u.plan === 'Enterprise') mrr += 2999;
        });

        res.status(200).json({
            metrics: {
                totalUsers, premiumUsers, freeUsers,
                totalCreditsCirculating,
                mrr: `₹${mrr.toLocaleString('en-IN')}`,
                totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
                openTickets,
                activeSubscriptions: premiumUsers,
            }
        });
    } catch (error) {
        console.error("Admin Metrics Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── USERS ───────────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUserPlanAndCredits = async (req, res) => {
    const { userId } = req.params;
    const { plan, credits, action } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (plan) user.plan = plan;
        if (credits !== undefined) {
            user.credits = action === 'add' ? user.credits + Number(credits) : Number(credits);
        }
        await user.save();
        res.status(200).json({ message: "User updated", user: { _id: user._id, fullname: user.fullname, plan: user.plan, credits: user.credits } });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── REVENUE ANALYTICS ───────────────────────────────────────────────────────
export const getRevenue = async (req, res) => {
    try {
        const payments = await Payment.find({ status: 'Success' }).sort({ createdAt: 1 });

        // Group by month
        const monthlyMap = {};
        payments.forEach(p => {
            const key = new Date(p.createdAt).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
            if (!monthlyMap[key]) monthlyMap[key] = { name: key, revenue: 0, count: 0 };
            monthlyMap[key].revenue += p.amount;
            monthlyMap[key].count += 1;
        });
        const monthlyData = Object.values(monthlyMap);

        // Plan breakdown
        const users = await User.find();
        const planDist = [
            { name: 'Free', value: users.filter(u => u.plan === 'Free').length },
            { name: 'Pro', value: users.filter(u => u.plan === 'Pro').length },
            { name: 'Team', value: users.filter(u => u.plan === 'Team').length },
            { name: 'Enterprise', value: users.filter(u => u.plan === 'Enterprise').length },
        ];

        const totalRevenue = payments.reduce((a, p) => a + p.amount, 0);
        const mrr = users.reduce((a, u) => {
            if (u.plan === 'Pro') return a + 299;
            if (u.plan === 'Team') return a + 999;
            if (u.plan === 'Enterprise') return a + 2999;
            return a;
        }, 0);

        res.status(200).json({ monthlyData, planDist, totalRevenue, mrr, arr: mrr * 12 });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
export const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 }).limit(100);
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createPayment = async (req, res) => {
    try {
        const { userId, amount, plan, gateway, status, transactionId } = req.body;
        const user = await User.findById(userId);
        const payment = new Payment({
            userId, amount, plan, gateway, status,
            transactionId: transactionId || `TXN${Date.now()}`,
            fullname: user?.fullname || 'Unknown',
            email: user?.email || 'Unknown',
        });
        await payment.save();
        res.status(201).json({ message: "Payment recorded", payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const refundPayment = async (req, res) => {
    const { paymentId } = req.params;
    try {
        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        payment.status = 'Refunded';
        payment.refundedAt = new Date();
        payment.refundReason = req.body.reason || 'Admin initiated refund';
        await payment.save();
        res.status(200).json({ message: "Refund processed", payment });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── AI CREDITS ──────────────────────────────────────────────────────────────
export const getCreditsData = async (req, res) => {
    try {
        const users = await User.find().select("fullname credits plan profilePhoto").sort({ credits: -1 });
        const totalCredits = users.reduce((a, u) => a + (u.credits || 0), 0);
        const topUsers = users.slice(0, 10);
        res.status(200).json({ totalCredits, topUsers, totalUsers: users.length });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── TICKETS ─────────────────────────────────────────────────────────────────
export const getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createTicket = async (req, res) => {
    try {
        const ticket = new Ticket({ ...req.body, userId: req.user?._id });
        await ticket.save();
        res.status(201).json({ message: "Ticket created", ticket });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTicket = async (req, res) => {
    const { ticketId } = req.params;
    try {
        const { status, reply } = req.body;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });
        if (status) ticket.status = status;
        if (reply) ticket.replies.push({ from: 'Admin', message: reply });
        await ticket.save();
        res.status(200).json({ message: "Ticket updated", ticket });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── COUPONS ─────────────────────────────────────────────────────────────────
export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createCoupon = async (req, res) => {
    try {
        const coupon = new Coupon({ ...req.body, createdBy: req.user._id });
        await coupon.save();
        res.status(201).json({ message: "Coupon created", coupon });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCoupon = async (req, res) => {
    const { couponId } = req.params;
    try {
        const coupon = await Coupon.findByIdAndUpdate(couponId, req.body, { new: true });
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });
        res.status(200).json({ message: "Coupon updated", coupon });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteCoupon = async (req, res) => {
    const { couponId } = req.params;
    try {
        await Coupon.findByIdAndDelete(couponId);
        res.status(200).json({ message: "Coupon deleted" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── NOTIFICATIONS / CAMPAIGNS ───────────────────────────────────────────────
export const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find().sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createCampaign = async (req, res) => {
    try {
        const { title, message, type, targetAudience } = req.body;
        let sentCount = 0;
        const users = await User.find();
        if (targetAudience === 'All Users') sentCount = users.length;
        else if (targetAudience === 'Free Users') sentCount = users.filter(u => u.plan === 'Free').length;
        else if (targetAudience === 'Pro Users') sentCount = users.filter(u => u.plan === 'Pro').length;
        else if (targetAudience === 'Team Users') sentCount = users.filter(u => u.plan === 'Team').length;
        else if (targetAudience === 'Enterprise Users') sentCount = users.filter(u => u.plan === 'Enterprise').length;

        const campaign = new Campaign({
            title, message, type, targetAudience,
            sentCount,
            status: 'Sent',
            sentAt: new Date(),
            createdBy: req.user._id
        });
        await campaign.save();
        res.status(201).json({ message: "Campaign sent", campaign });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── SUBSCRIPTION PLANS ──────────────────────────────────────────────────────
export const getSubscriptionPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find();
        // Return dummy active user counts for now
        const enhancedPlans = plans.map(p => ({
            ...p.toObject(),
            activeUsers: Math.floor(Math.random() * 500) // Dummy data to fill the UI
        }));
        res.status(200).json(enhancedPlans);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createSubscriptionPlan = async (req, res) => {
    try {
        const plan = new SubscriptionPlan(req.body);
        await plan.save();
        res.status(201).json({ message: "Plan created", plan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSubscriptionPlan = async (req, res) => {
    const { planId } = req.params;
    try {
        const plan = await SubscriptionPlan.findByIdAndUpdate(planId, req.body, { new: true });
        if (!plan) return res.status(404).json({ message: "Plan not found" });
        res.status(200).json({ message: "Plan updated", plan });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteSubscriptionPlan = async (req, res) => {
    const { planId } = req.params;
    try {
        await SubscriptionPlan.findByIdAndDelete(planId);
        res.status(200).json({ message: "Plan deleted" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── CREDIT PACKS ────────────────────────────────────────────────────────────
export const getCreditPacks = async (req, res) => {
    try {
        const packs = await CreditPack.find();
        res.status(200).json(packs);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createCreditPack = async (req, res) => {
    try {
        const pack = new CreditPack(req.body);
        await pack.save();
        res.status(201).json({ message: "Pack created", pack });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCreditPack = async (req, res) => {
    const { packId } = req.params;
    try {
        const pack = await CreditPack.findByIdAndUpdate(packId, req.body, { new: true });
        if (!pack) return res.status(404).json({ message: "Pack not found" });
        res.status(200).json({ message: "Pack updated", pack });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteCreditPack = async (req, res) => {
    const { packId } = req.params;
    try {
        await CreditPack.findByIdAndDelete(packId);
        res.status(200).json({ message: "Pack deleted" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
