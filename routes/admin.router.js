import express from "express";
import { adminMiddleware } from "../middieware/admin.middleware.js";
import {
    getMetrics, getAllUsers, updateUserPlanAndCredits,
    getRevenue,
    getPayments, createPayment, refundPayment,
    getCreditsData,
    getTickets, createTicket, updateTicket,
    getCoupons, createCoupon, updateCoupon, deleteCoupon,
    getCampaigns, createCampaign,
    getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan,
    getCreditPacks, createCreditPack, updateCreditPack, deleteCreditPack
} from "../controller/admin.controller.js";

const router = express.Router();
router.use(adminMiddleware);

// Overview & Metrics
router.get("/metrics", getMetrics);

// Users
router.get("/users", getAllUsers);
router.put("/users/:userId", updateUserPlanAndCredits);

// Revenue
router.get("/revenue", getRevenue);

// Payments
router.get("/payments", getPayments);
router.post("/payments", createPayment);
router.put("/payments/:paymentId/refund", refundPayment);

// AI Credits
router.get("/credits", getCreditsData);

// Tickets
router.get("/tickets", getTickets);
router.post("/tickets", createTicket);
router.put("/tickets/:ticketId", updateTicket);

// Coupons
router.get("/coupons", getCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:couponId", updateCoupon);
router.delete("/coupons/:couponId", deleteCoupon);

// Notifications / Campaigns
router.get("/notifications", getCampaigns);
router.post("/notifications", createCampaign);

// Subscription Plans
router.get("/plans", getSubscriptionPlans);
router.post("/plans", createSubscriptionPlan);
router.put("/plans/:planId", updateSubscriptionPlan);
router.delete("/plans/:planId", deleteSubscriptionPlan);

// Credit Packs
router.get("/credit-packs", getCreditPacks);
router.post("/credit-packs", createCreditPack);
router.put("/credit-packs/:packId", updateCreditPack);
router.delete("/credit-packs/:packId", deleteCreditPack);

export default router;
