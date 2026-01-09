import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  getDashboardStats,
  // Товары
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  // Заказы
  getAllOrders,
  updateOrderStatus,
  // Пользователи
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
  // Бренды
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  // Купоны
  getAllCoupons,
  createCoupon,
  deleteCoupon,
  toggleCouponActive,
  updateCoupon,
  // Возвраты
  getAllReturns,
  updateReturnStatus,
} from "../controllers/admin.controller.js";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, adminOnly);

// 📦 Управление товарами
router.post("/products", upload.array("images"), createProduct);
router.get("/products", getAllProducts);
router.put("/products/:id", upload.array("images"), updateProduct);
router.delete("/products/:id", deleteProduct);

// 🛒 Управление заказами
router.get("/orders", getAllOrders);
router.patch("/orders/:orderId/status", updateOrderStatus);

// 🏷️ Управление брендами
router.get("/brands", getAllBrands);
router.post("/brands", upload.single("image"), createBrand);
router.put("/brands/:id", upload.single("image"), updateBrand);
router.delete("/brands/:id", deleteBrand);

// 👨‍💻 Управление пользователями
router.get("/customers", getAllCustomers);
router.put("/customers/:id", upload.single("image"), updateCustomer);
router.delete("/customers/:id", deleteCustomer);

// 🎫 Управление купонами
router.get("/coupons", getAllCoupons);
router.post("/coupons", createCoupon);
router.delete("/coupons/:id", deleteCoupon);
router.put("/coupons/:id", updateCoupon);
router.patch("/coupons/:id/toggle", toggleCouponActive);

// ↩️ Управление возвратами
router.get("/returns", getAllReturns);
router.patch("/returns/:id/status", updateReturnStatus);

// 📊 Аналитика и отчеты
router.get("/stats", getDashboardStats);

export default router;
