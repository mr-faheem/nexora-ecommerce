import express from "express";

import upload from "../middlewares/uploadMiddleware.js";

import {
  uploadImages,
  deleteImage,
} from "../controllers/uploadController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post(
  "/products",
  protect,
  adminOnly,
  upload.array("images", 5),
  uploadImages
);

router.delete(
  "/products",
  protect,
  adminOnly,
  deleteImage
);

export default router;