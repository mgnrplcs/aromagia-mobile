import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  createReturnRequest,
  getMyReturns,
} from "../controllers/return.controller.js";

const router = Router();
router.use(protectRoute);

// ↩️ Возвраты
router.post("/", upload.array("images"), createReturnRequest);
router.get("/", getMyReturns);

export default router;
