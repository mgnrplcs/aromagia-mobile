import { Router } from "express";

import { createPaymentIntent } from "../controllers/payment.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

// 💸 Платежи
router.post("/create-intent", createPaymentIntent);

export default router;
