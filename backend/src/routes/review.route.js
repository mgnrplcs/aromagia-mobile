import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

import {
  createReview,
  deleteReview,
  getProductReviews,
} from "../controllers/review.controller.js";

const router = Router();

router.use(protectRoute);

// 👀 Просмотр отзывов
router.get("/product/:productId", getProductReviews);

// ✨ Управление отзывами
router.post("/", createReview);
router.delete("/:reviewId", deleteReview);

export default router;
