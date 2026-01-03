import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";

const router = Router();

router.use(protectRoute);

// 🛒 Получить корзину
router.get("/", getCart);

// ➕ Добавить товар в корзину
router.post("/", addToCart);

// 🔢 Обновить количество товара
router.put("/:productId", updateQuantity);

// 🗑️ Удалить один товар из корзины
router.delete("/:productId", removeFromCart);

// 🧹 Очистить всю корзину
router.delete("/", clearCart);

export default router;
