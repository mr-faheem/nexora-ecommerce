import express from "express";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import {
  protect,
} from "../middlewares/authMiddleware.js";

import {
  adminOnly,
} from "../middlewares/adminMiddleware.js";

import upload from "../middlewares/uploadMiddleware.js";

const router =
  express.Router();

// ======================================================
// Public
// ======================================================

router.get(
  "/",
  getCategories
);

router.get(
  "/:id",
  getCategoryById
);

// ======================================================
// Admin
// ======================================================

// Single category image
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  createCategory
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  updateCategory
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCategory
);

export default router;