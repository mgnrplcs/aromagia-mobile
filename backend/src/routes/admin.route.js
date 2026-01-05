import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  getDashboardStats,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
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

// 📊 Аналитика и отчеты
router.get("/stats", getDashboardStats);

export default router;
