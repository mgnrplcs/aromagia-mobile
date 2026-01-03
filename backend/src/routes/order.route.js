import { Router } from "express";

import { createOrder, getUserOrders } from "../controllers/order.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

// 🛒 Заказы пользователя
router.post("/", createOrder);
router.get("/", getUserOrders);

export default router;
