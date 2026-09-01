import express from "express";

import {
  addAddress,
  getMyAddresses,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "../controllers/addressController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addAddress);

router.get("/", protect, getMyAddresses);

router.put("/:id", protect, updateAddress);

router.put("/:id/default", protect, setDefaultAddress);

router.delete("/:id", protect, deleteAddress);

export default router;