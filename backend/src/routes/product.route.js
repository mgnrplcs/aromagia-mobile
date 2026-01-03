import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllProducts } from "../controllers/admin.controller.js";
import {
  getProductById,
  getRecommendedProducts,
} from "../controllers/product.controller.js";

const router = Router();

router.use(protectRoute);

// 🛍️ Основные товары
router.get("/", getAllProducts);
// ✨ Рекомендации
router.get("/recommendations", getRecommendedProducts);
// 🔍 Товар по ID
router.get("/:id", getProductById);

export default router;
