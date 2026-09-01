import express from "express";

import {
  protect,
} from "../middlewares/authMiddleware.js";

import {
  adminOnly,
} from "../middlewares/adminMiddleware.js";

import {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// ======================================================
// Logged-in User
// ======================================================

router.get(
  "/profile",
  protect,
  getProfile
);

router.put(
  "/profile",
  protect,
  updateProfile
);

router.put(
  "/change-password",
  protect,
  changePassword
);

// ======================================================
// Admin
// ======================================================

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllUsers
);

router.put(
  "/admin/:id/role",
  protect,
  adminOnly,
  updateUserRole
);

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteUser
);

router.get(
  "/admin-test",
  protect,
  adminOnly,
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Welcome Admin. Admin route is working.",
    });
  }
);

export default router;