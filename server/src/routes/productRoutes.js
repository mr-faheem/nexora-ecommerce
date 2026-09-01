import express from "express";

import {
  createProduct,
  getProducts,
  getAdminProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getRelatedProducts,
} from "../controllers/productController.js";

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
// PUBLIC PRODUCTS
// Only active products
// ======================================================

router.get(
  "/",
  getProducts
);

// ======================================================
// ADMIN PRODUCTS
// Active + Inactive
//
// IMPORTANT:
// Ye /:id se UPAR hona chahiye
// ======================================================

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAdminProducts
);

// ======================================================
// DELETE PRODUCT IMAGE
// ======================================================

router.delete(
  "/image/delete",
  protect,
  adminOnly,
  deleteProductImage
);

// ======================================================
// RELATED PRODUCTS
// ======================================================

router.get(
  "/:id/related",
  getRelatedProducts
);

// ======================================================
// SINGLE PRODUCT
// ======================================================

router.get(
  "/:id",
  getProductById
);

// ======================================================
// CREATE PRODUCT
// ======================================================

router.post(
  "/",
  protect,
  adminOnly,
  upload.array(
    "images",
    5
  ),
  createProduct
);

// ======================================================
// UPDATE PRODUCT
// ======================================================

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array(
    "images",
    5
  ),
  updateProduct
);

// ======================================================
// DELETE PRODUCT
// ======================================================

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteProduct
);

export default router;