import express from "express";

import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.get(
  "/product/:productId",
  getProductReviews
);

// Logged-in user
router.post(
  "/product/:productId",
  protect,
  addReview
);

router.put(
  "/:reviewId",
  protect,
  updateReview
);

router.delete(
  "/:reviewId",
  protect,
  deleteReview
);

export default router;