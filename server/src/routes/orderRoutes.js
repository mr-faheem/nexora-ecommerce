import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelMyOrder
} from "../controllers/orderController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// User
router.post("/", protect, createOrder);

router.get(
  "/my-orders",
  protect,
  getMyOrders
);

// Admin
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllOrders
);

router.put(
  "/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

// User/Admin single order
router.get(
  "/:id",
  protect,
  getOrderById
);
router.put(
  "/:id/cancel",
  protect,
  cancelMyOrder
);
export default router;