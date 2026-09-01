import express from "express";

import {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/couponController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// User
router.post(
  "/validate",
  protect,
  validateCoupon
);

// Admin
router.post(
  "/",
  protect,
  adminOnly,
  createCoupon
);

router.get(
  "/",
  protect,
  adminOnly,
  getCoupons
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateCoupon
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCoupon
);

export default router;