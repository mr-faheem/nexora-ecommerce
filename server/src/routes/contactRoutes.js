import express from "express";

import {
  createContactMessage,
  getContactMessages,
  updateMessageReadStatus,
  deleteContactMessage,
} from "../controllers/contactController.js";

import {
  protect,
} from "../middlewares/authMiddleware.js";

import {
  adminOnly,
} from "../middlewares/adminMiddleware.js";

const router =
  express.Router();

// Public

router.post(
  "/",
  createContactMessage
);

// Admin

router.get(
  "/",
  protect,
  adminOnly,
  getContactMessages
);

router.patch(
  "/:id/read",
  protect,
  adminOnly,
  updateMessageReadStatus
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteContactMessage
);

export default router;