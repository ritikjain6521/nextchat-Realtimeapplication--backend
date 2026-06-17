import express from "express";
import secureRoute from "../middieware/Secureroute.js";
import { createOrder, verifyPayment } from "../controller/payment.controller.js";

const router = express.Router();

router.post("/create-order", secureRoute, createOrder);
router.post("/verify", secureRoute, verifyPayment);

export default router;
