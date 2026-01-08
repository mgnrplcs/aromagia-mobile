import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from "../controllers/cart.controller.js";

const router = Router();

router.use(protectRoute);

// 🛒 Корзина
router.get("/", getCart);
router.post("/", addToCart);
router.put("/:productId", updateQuantity);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

// 🎫 Промокоды
router.post("/coupon", applyCoupon);
router.delete("/coupon", removeCoupon);

export default router;
