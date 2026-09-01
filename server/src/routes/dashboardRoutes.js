import express from "express";

import {
  getDashboardStats,
} from "../controllers/dashboardController.js";

import {
  protect,
} from "../middlewares/authMiddleware.js";

import {
  adminOnly,
} from "../middlewares/adminMiddleware.js";

const router = express.Router();

// ======================================================
// Admin Dashboard
// ======================================================

router.get(
  "/stats",
  protect,
  adminOnly,
  getDashboardStats
);

export default router;