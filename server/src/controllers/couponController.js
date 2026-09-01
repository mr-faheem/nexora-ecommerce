import mongoose from "mongoose";
import Coupon from "../models/Coupon.js";

// ======================================================
// Create Coupon - Admin
// ======================================================

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      minimumOrderAmount = 0,
      maximumDiscount = null,
      expiresAt,
      isActive = true,
    } = req.body;

    if (!code || !type || value === undefined || !expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Code, type, value and expiry date are required.",
      });
    }

    if (!["percentage", "fixed"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Coupon type must be percentage or fixed.",
      });
    }

    const numericValue = Number(value);

    if (numericValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Coupon value must be greater than 0.",
      });
    }

    if (type === "percentage" && numericValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot be greater than 100.",
      });
    }

    const expiryDate = new Date(expiresAt);

    if (Number.isNaN(expiryDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiry date.",
      });
    }

    if (expiryDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be in the future.",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    const existingCoupon = await Coupon.findOne({
      code: normalizedCode,
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists.",
      });
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      type,
      value: numericValue,
      minimumOrderAmount: Number(minimumOrderAmount) || 0,
      maximumDiscount:
        maximumDiscount === null || maximumDiscount === ""
          ? null
          : Number(maximumDiscount),
      expiresAt: expiryDate,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      coupon,
    });
  } catch (error) {
    console.error("Create Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating coupon.",
    });
  }
};

// ======================================================
// Get All Coupons - Admin
// ======================================================

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("Get Coupons Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching coupons.",
    });
  }
};

// ======================================================
// Update Coupon - Admin
// ======================================================

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID.",
      });
    }

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    const {
      code,
      type,
      value,
      minimumOrderAmount,
      maximumDiscount,
      expiresAt,
      isActive,
    } = req.body;

    if (code !== undefined) {
      const normalizedCode = code.trim().toUpperCase();

      const duplicateCoupon = await Coupon.findOne({
        code: normalizedCode,
        _id: {
          $ne: id,
        },
      });

      if (duplicateCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists.",
        });
      }

      coupon.code = normalizedCode;
    }

    if (type !== undefined) {
      if (!["percentage", "fixed"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Coupon type must be percentage or fixed.",
        });
      }

      coupon.type = type;
    }

    if (value !== undefined) {
      const numericValue = Number(value);

      if (numericValue <= 0) {
        return res.status(400).json({
          success: false,
          message: "Coupon value must be greater than 0.",
        });
      }

      if (
        (type || coupon.type) === "percentage" &&
        numericValue > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Percentage discount cannot be greater than 100.",
        });
      }

      coupon.value = numericValue;
    }

    if (minimumOrderAmount !== undefined) {
      coupon.minimumOrderAmount = Number(minimumOrderAmount);
    }

    if (maximumDiscount !== undefined) {
      coupon.maximumDiscount =
        maximumDiscount === null || maximumDiscount === ""
          ? null
          : Number(maximumDiscount);
    }

    if (expiresAt !== undefined) {
      const expiryDate = new Date(expiresAt);

      if (Number.isNaN(expiryDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date.",
        });
      }

      coupon.expiresAt = expiryDate;
    }

    if (isActive !== undefined) {
      coupon.isActive = Boolean(isActive);
    }

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully.",
      coupon,
    });
  } catch (error) {
    console.error("Update Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating coupon.",
    });
  }
};

// ======================================================
// Delete Coupon - Admin
// ======================================================

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID.",
      });
    }

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting coupon.",
    });
  }
};

// ======================================================
// Validate Coupon - User
// ======================================================

export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || orderAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and order amount are required.",
      });
    }

    const amount = Number(orderAmount);

    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount.",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not active.",
      });
    }

    if (coupon.expiresAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired.",
      });
    }

    if (amount < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minimumOrderAmount}.`,
      });
    }

    let discountAmount = 0;

    if (coupon.type === "percentage") {
      discountAmount =
        (amount * coupon.value) / 100;

      if (
        coupon.maximumDiscount !== null &&
        discountAmount > coupon.maximumDiscount
      ) {
        discountAmount = coupon.maximumDiscount;
      }
    }

    if (coupon.type === "fixed") {
      discountAmount = coupon.value;
    }

    if (discountAmount > amount) {
      discountAmount = amount;
    }

    const finalAmount = amount - discountAmount;

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully.",
      coupon: {
        id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      orderAmount: amount,
      discountAmount,
      finalAmount,
    });
  } catch (error) {
    console.error("Validate Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while validating coupon.",
    });
  }
};