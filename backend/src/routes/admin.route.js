import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  getDashboardStats,
} from "../controllers/admin.controller.js";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, adminOnly);

// 📦 Управление товарами
router.post("/products", upload.array("images"), createProduct);
router.get("/products", getAllProducts);
router.put("/products/:id", upload.array("images"), updateProduct);

// 🛒 Управление заказами
router.get("/orders", getAllOrders);
router.patch("/orders/:orderId/status", updateOrderStatus);

// 👨‍💻 Управление пользователями
router.get("/customers", getAllCustomers);

// 📊 Аналитика и отчеты
router.get("/stats", getDashboardStats);

export default router;
