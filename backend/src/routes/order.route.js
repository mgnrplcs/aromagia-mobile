import { Router } from "express";

import { createOrder, getUserOrders } from "../controllers/order.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

// 📦 Создать новый заказ
router.post("/", createOrder);

// 📜 Получить историю заказов
router.get("/", getUserOrders);

export default router;
