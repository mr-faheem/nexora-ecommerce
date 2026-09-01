import express from "express";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  cancelPendingRazorpayOrder,
} from "../controllers/paymentController.js";

import {
  protect,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/razorpay/create-order",
  protect,
  createRazorpayOrder
);

router.post(
  "/razorpay/verify",
  protect,
  verifyRazorpayPayment
);

router.put(
  "/razorpay/:orderId/cancel",
  protect,
  cancelPendingRazorpayOrder
);

export default router;
