import { Router } from "express";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

// 📍 Управление адресами
router.post("/addresses", addAddress);
router.get("/addresses", getAddresses);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

// ❤️ Управление избранным
router.post("/wishlist", addToWishlist);
router.get("/wishlist", getWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);

export default router;
