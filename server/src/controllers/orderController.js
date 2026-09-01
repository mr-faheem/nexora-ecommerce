import mongoose from "mongoose";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";

// ======================================================
// Helper - Restore Order Stock
// ======================================================

const restoreOrderStock = async (order) => {
  for (const item of order.items) {
    if (!item.product) {
      continue;
    }

    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc: {
          stock: item.quantity,
        },
      }
    );
  }
};

// ======================================================
// Create Order
//
// Supports:
// 1. Normal Cart Checkout
// 2. Buy Now Checkout
// ======================================================

export const createOrder = async (
  req,
  res
) => {
  try {
    const {
      fullName,
      phone,
      address,
      city,
      state,
      postalCode,
      country = "India",
      couponCode,
      paymentMethod = "COD",

      // Buy Now only
      buyNow,
    } = req.body || {};

    // ==================================================
    // Shipping Validation
    // ==================================================

    if (
      !fullName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !postalCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complete shipping address is required.",
      });
    }

    // ==================================================
    // Payment Method
    // ==================================================

    const allowedPaymentMethods = [
      "COD",
      "RAZORPAY",
    ];

    if (
      !allowedPaymentMethods.includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method.",
      });
    }

    // ==================================================
    // Checkout Type
    // ==================================================

    const isBuyNow =
      Boolean(
        buyNow &&
          buyNow.productId
      );

    let cart = null;

    let checkoutItems = [];

    // ==================================================
    // BUY NOW
    // ==================================================

    if (isBuyNow) {
      const {
        productId,
        quantity = 1,
      } = buyNow;

      if (
        !mongoose.Types.ObjectId.isValid(
          productId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Buy Now product ID.",
        });
      }

      const qty =
        Number(quantity);

      if (
        !Number.isInteger(qty) ||
        qty < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Buy Now quantity must be at least 1.",
        });
      }

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is not available.`,
        });
      }

      if (
        product.stock < qty
      ) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item(s) available for ${product.name}.`,
        });
      }

      checkoutItems = [
        {
          product,
          quantity: qty,
        },
      ];
    }

    // ==================================================
    // NORMAL CART CHECKOUT
    // ==================================================

    else {
      cart =
        await Cart.findOne({
          user: req.user._id,
        }).populate(
          "items.product"
        );

      if (
        !cart ||
        cart.items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cart is empty.",
        });
      }

      checkoutItems =
        cart.items;
    }

    // ==================================================
    // Build Order Items
    // ==================================================

    const orderItems = [];

    let subtotal = 0;

    for (
      const item of checkoutItems
    ) {
      const product =
        item.product;

      const quantity =
        Number(
          item.quantity
        );

      if (!product) {
        return res.status(400).json({
          success: false,
          message:
            "One of the selected products no longer exists.",
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is not available.`,
        });
      }

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}.`,
        });
      }

      if (
        product.stock <
        quantity
      ) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item(s) available for ${product.name}.`,
        });
      }

      const finalProductPrice =
        product.discountPrice &&
        product.discountPrice > 0
          ? product.discountPrice
          : product.price;

      subtotal +=
        finalProductPrice *
        quantity;

      orderItems.push({
        product:
          product._id,

        name:
          product.name,

        image:
          product.images &&
          product.images.length >
            0
            ? product.images[0]
                .url
            : "",

        price:
          finalProductPrice,

        quantity,
      });
    }

    subtotal =
      Math.round(
        subtotal * 100
      ) / 100;

    // ==================================================
    // Shipping
    // ==================================================

    const shippingCharge =
      subtotal >= 999
        ? 0
        : 99;

    const totalAmount =
      Math.round(
        (subtotal +
          shippingCharge) *
          100
      ) / 100;

    // ==================================================
    // Coupon
    // ==================================================

    let appliedCouponCode =
      null;

    let discountAmount = 0;

    if (couponCode) {
      const normalizedCode =
        couponCode
          .trim()
          .toUpperCase();

      const coupon =
        await Coupon.findOne({
          code: normalizedCode,
        });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid coupon code.",
        });
      }

      if (!coupon.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon is not active.",
        });
      }

      if (
        coupon.expiresAt &&
        new Date(
          coupon.expiresAt
        ) < new Date()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon has expired.",
        });
      }

      if (
        subtotal <
        (coupon.minimumOrderAmount ||
          0)
      ) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount for this coupon is ₹${coupon.minimumOrderAmount}.`,
        });
      }

      if (
        coupon.type ===
        "percentage"
      ) {
        discountAmount =
          (subtotal *
            coupon.value) /
          100;

        if (
          coupon.maximumDiscount &&
          coupon.maximumDiscount >
            0
        ) {
          discountAmount =
            Math.min(
              discountAmount,
              coupon.maximumDiscount
            );
        }
      } else if (
        coupon.type ===
        "fixed"
      ) {
        discountAmount =
          coupon.value;
      }

      discountAmount =
        Math.min(
          discountAmount,
          subtotal
        );

      discountAmount =
        Math.round(
          discountAmount * 100
        ) / 100;

      appliedCouponCode =
        coupon.code;
    }

    // ==================================================
    // Final Amount
    // ==================================================

    const finalAmount =
      Math.round(
        (totalAmount -
          discountAmount) *
          100
      ) / 100;

    if (finalAmount < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid final order amount.",
      });
    }

    // ==================================================
    // Create Order
    // ==================================================

    const order =
      await Order.create({
        user:
          req.user._id,

        items:
          orderItems,

        shippingAddress: {
          fullName:
            fullName.trim(),

          phone:
            phone.trim(),

          address:
            address.trim(),

          city:
            city.trim(),

          state:
            state.trim(),

          postalCode:
            postalCode.trim(),

          country:
            country?.trim() ||
            "India",
        },

        paymentMethod,

        paymentStatus:
          "pending",

        orderStatus:
          "pending",

        subtotal,

        shippingCharge,

        couponCode:
          appliedCouponCode,

        discountAmount,

        totalAmount,

        finalAmount,
      });

    // ==================================================
    // Reduce Stock
    //
    // Atomic check:
    // stock cannot go below zero.
    // ==================================================

    const reducedItems = [];

    try {
      for (
        const item of orderItems
      ) {
        const updatedProduct =
          await Product.findOneAndUpdate(
            {
              _id:
                item.product,

              isActive:
                true,

              stock: {
                $gte:
                  item.quantity,
              },
            },

            {
              $inc: {
                stock:
                  -item.quantity,
              },
            },

            {
              new: true,
            }
          );

        if (!updatedProduct) {
          throw new Error(
            `Stock changed while placing order for ${item.name}.`
          );
        }

        reducedItems.push({
          product:
            item.product,

          quantity:
            item.quantity,
        });
      }
    } catch (stockError) {
      console.error(
        "Stock Reduction Error:",
        stockError
      );

      // ================================================
      // Restore only products that were actually reduced
      // ================================================

      for (
        const reducedItem of reducedItems
      ) {
        try {
          await Product.findByIdAndUpdate(
            reducedItem.product,
            {
              $inc: {
                stock:
                  reducedItem.quantity,
              },
            }
          );
        } catch (
          restoreError
        ) {
          console.error(
            "Stock Rollback Error:",
            restoreError
          );
        }
      }

      await Order.findByIdAndDelete(
        order._id
      );

      return res.status(409).json({
        success: false,
        message:
          "Product stock changed while placing the order. Please try again.",
      });
    }

    // ==================================================
    // Clear Cart
    //
    // Normal Cart Checkout:
    // Cart clear hoga.
    //
    // Buy Now:
    // Existing cart bilkul touch nahi hoga.
    // ==================================================

    if (
      !isBuyNow &&
      cart
    ) {
      cart.items = [];

      await cart.save();
    }

    // ==================================================
    // Response
    // ==================================================

    const populatedOrder =
      await Order.findById(
        order._id
      )
        .populate(
          "user",
          "name email"
        )
        .populate(
          "items.product",
          "name slug stock"
        );

    return res.status(201).json({
      success: true,

      checkoutMode:
        isBuyNow
          ? "buy-now"
          : "cart",

      message:
        paymentMethod ===
        "RAZORPAY"
          ? "Order created. Complete payment to confirm your order."
          : "Order placed successfully.",

      order:
        populatedOrder,
    });
  } catch (error) {
    console.error(
      "Create Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating order.",
    });
  }
};

// ======================================================
// Logged-in User Orders
// ======================================================

export const getMyOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({
        user:
          req.user._id,
      })
        .populate(
          "items.product",
          "name slug"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      count:
        orders.length,

      orders,
    });
  } catch (error) {
    console.error(
      "Get My Orders Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching orders.",
    });
  }
};

// ======================================================
// Get Single Order
//
// User can view own order.
// Admin can view any order.
// ======================================================

export const getOrderById = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid order ID.",
      });
    }

    const order =
      await Order.findById(
        id
      )
        .populate(
          "user",
          "name email"
        )
        .populate(
          "items.product",
          "name slug"
        );

    if (!order) {
      return res.status(404).json({
        success: false,

        message:
          "Order not found.",
      });
    }

    const isOwner =
      order.user._id.toString() ===
      req.user._id.toString();

    const isAdmin =
      req.user.role ===
      "admin";

    if (
      !isOwner &&
      !isAdmin
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Access denied.",
      });
    }

    return res.status(200).json({
      success: true,

      order,
    });
  } catch (error) {
    console.error(
      "Get Order Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching order.",
    });
  }
};

// ======================================================
// Get All Orders - Admin
// ======================================================

export const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find()
        .populate(
          "user",
          "name email"
        )
        .populate(
          "items.product",
          "name slug"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      count:
        orders.length,

      orders,
    });
  } catch (error) {
    console.error(
      "Get All Orders Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching all orders.",
    });
  }
};

// ======================================================
// Update Order Status - Admin
// ======================================================

export const updateOrderStatus =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      const {
        status,
      } = req.body || {};

      // ================================================
      // ID Validation
      // ================================================

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order ID.",
        });
      }

      // ================================================
      // Status Validation
      // ================================================

      const allowedStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order status.",
        });
      }

      // ================================================
      // Find Order
      // ================================================

      const order =
        await Order.findById(
          id
        );

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found.",
        });
      }

      // ================================================
      // Compatibility for old orders
      // ================================================

      if (
        order.finalAmount ===
          undefined ||
        order.finalAmount ===
          null
      ) {
        order.finalAmount =
          order.totalAmount;
      }

      // ================================================
      // Already Cancelled
      // ================================================

      if (
        order.orderStatus ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Cancelled order status cannot be changed.",
        });
      }

      // ================================================
      // Delivered Order Protection
      // ================================================

      if (
        order.orderStatus ===
          "delivered" &&
        status ===
          "cancelled"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Delivered order cannot be cancelled.",
        });
      }

      // ================================================
      // Paid Razorpay Protection
      //
      // Paid online orders cannot simply be cancelled.
      // Refund flow required.
      // ================================================

      if (
        status ===
          "cancelled" &&
        order.paymentMethod ===
          "RAZORPAY" &&
        order.paymentStatus ===
          "paid"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Paid online order cannot be cancelled until refund is processed.",
        });
      }

      // ================================================
      // Admin Cancel Order
      // ================================================

      if (
        status ===
        "cancelled"
      ) {
        await restoreOrderStock(
          order
        );

        order.orderStatus =
          "cancelled";

        order.cancelledAt =
          new Date();

        // Online payment was never completed.

        if (
          order.paymentMethod ===
            "RAZORPAY" &&
          order.paymentStatus ===
            "pending"
        ) {
          order.paymentStatus =
            "failed";
        }

        await order.save();

        const cancelledOrder =
          await Order.findById(
            order._id
          )
            .populate(
              "user",
              "name email"
            )
            .populate(
              "items.product",
              "name slug stock"
            );

        return res
          .status(200)
          .json({
            success: true,

            message:
              "Order cancelled and stock restored successfully.",

            order:
              cancelledOrder,
          });
      }

      // ================================================
      // Prevent Processing Unpaid Razorpay Order
      // ================================================

      if (
        order.paymentMethod ===
          "RAZORPAY" &&
        order.paymentStatus !==
          "paid" &&
        [
          "processing",
          "shipped",
          "delivered",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Online payment must be completed before processing this order.",
        });
      }

      // ================================================
      // Normal Status Update
      // ================================================

      order.orderStatus =
        status;

      // ================================================
      // Delivered
      // ================================================

      if (
        status ===
        "delivered"
      ) {
        order.deliveredAt =
          new Date();

        // COD becomes paid after delivery.

        if (
          order.paymentMethod ===
          "COD"
        ) {
          order.paymentStatus =
            "paid";

          order.paidAt =
            order.paidAt ||
            new Date();
        }
      }

      await order.save();

      const updatedOrder =
        await Order.findById(
          order._id
        )
          .populate(
            "user",
            "name email"
          )
          .populate(
            "items.product",
            "name slug stock"
          );

      return res.status(200).json({
        success: true,

        message:
          "Order status updated successfully.",

        order:
          updatedOrder,
      });
    } catch (error) {
      console.error(
        "Update Order Status Error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Server error while updating order status.",
      });
    }
  };

// ======================================================
// Cancel Own Order - User
// ======================================================

export const cancelMyOrder = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    // ==================================================
    // ID Validation
    // ==================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid order ID.",
      });
    }

    // ==================================================
    // Find Own Order
    // ==================================================

    const order =
      await Order.findOne({
        _id:
          id,

        user:
          req.user._id,
      });

    if (!order) {
      return res.status(404).json({
        success: false,

        message:
          "Order not found.",
      });
    }

    // ==================================================
    // Already Cancelled
    // ==================================================

    if (
      order.orderStatus ===
      "cancelled"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Order is already cancelled.",
      });
    }

    // ==================================================
    // Shipping Protection
    // ==================================================

    if (
      order.orderStatus ===
        "shipped" ||
      order.orderStatus ===
        "delivered"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "This order can no longer be cancelled.",
      });
    }

    // ==================================================
    // Paid Razorpay Protection
    // ==================================================

    if (
      order.paymentMethod ===
        "RAZORPAY" &&
      order.paymentStatus ===
        "paid"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Paid online order cannot be cancelled until refund is processed.",
      });
    }

    // ==================================================
    // Restore Product Stock
    // ==================================================

    await restoreOrderStock(
      order
    );

    // ==================================================
    // Cancel Order
    // ==================================================

    order.orderStatus =
      "cancelled";

    order.cancelledAt =
      new Date();

    // Razorpay payment was never completed.

    if (
      order.paymentMethod ===
        "RAZORPAY" &&
      order.paymentStatus ===
        "pending"
    ) {
      order.paymentStatus =
        "failed";
    }

    await order.save();

    // ==================================================
    // Updated Response
    // ==================================================

    const updatedOrder =
      await Order.findById(
        order._id
      )
        .populate(
          "user",
          "name email"
        )
        .populate(
          "items.product",
          "name slug stock"
        );

    return res.status(200).json({
      success: true,

      message:
        "Order cancelled successfully.",

      order:
        updatedOrder,
    });
  } catch (error) {
    console.error(
      "Cancel My Order Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while cancelling order.",
    });
  }
};