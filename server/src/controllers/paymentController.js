import crypto from "crypto";
import mongoose from "mongoose";
import Razorpay from "razorpay";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const getRazorpayInstance = () => {
  if (
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    throw new Error(
      "Razorpay environment variables are missing."
    );
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

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

const restoreOrderItemsToCart = async (
  order,
  userId
) => {
  let cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [],
    });
  }

  for (const item of order.items) {
    if (!item.product) {
      continue;
    }

    const productId =
      item.product.toString();

    const existingItem =
      cart.items.find(
        (cartItem) =>
          cartItem.product.toString() ===
          productId
      );

    if (existingItem) {
      existingItem.quantity +=
        item.quantity;
    } else {
      cart.items.push({
        product: item.product,
        quantity: item.quantity,
      });
    }
  }

  await cart.save();
};

const cancelPendingRazorpayOrderInternal =
  async (order) => {
    if (
      order.paymentMethod !==
      "RAZORPAY"
    ) {
      return;
    }

    if (
      order.paymentStatus === "paid"
    ) {
      return;
    }

    if (
      order.orderStatus ===
      "cancelled"
    ) {
      return;
    }

    await restoreOrderStock(order);

    await restoreOrderItemsToCart(
      order,
      order.user
    );

    order.paymentStatus = "failed";
    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();

    await order.save();
  };

// ======================================================
// Create Razorpay Order From Existing Nexora Order
// ======================================================

export const createRazorpayOrder =
  async (req, res) => {
    let nexoraOrder = null;

    try {
      const { orderId } =
        req.body || {};

      if (
        !orderId ||
        !mongoose.Types.ObjectId.isValid(
          orderId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid orderId is required.",
        });
      }

      nexoraOrder =
        await Order.findOne({
          _id: orderId,
          user: req.user._id,
        });

      if (!nexoraOrder) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        nexoraOrder.paymentMethod !==
        "RAZORPAY"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This order is not an online payment order.",
        });
      }

      if (
        nexoraOrder.paymentStatus ===
        "paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This order is already paid.",
        });
      }

      if (
        nexoraOrder.orderStatus ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cancelled order cannot be paid.",
        });
      }

      const amountInPaise =
        Math.round(
          Number(
            nexoraOrder.finalAmount
          ) * 100
        );

      if (
        !Number.isInteger(
          amountInPaise
        ) ||
        amountInPaise < 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payable amount.",
        });
      }

      // If Razorpay order was already created,
      // reuse it for retry instead of creating duplicates.
      if (
        nexoraOrder.razorpayOrderId
      ) {
        return res.status(200).json({
          success: true,
          message:
            "Razorpay order already exists.",
          keyId:
            process.env
              .RAZORPAY_KEY_ID,
          orderId:
            nexoraOrder._id,
          razorpayOrderId:
            nexoraOrder
              .razorpayOrderId,
          amount: amountInPaise,
          currency: "INR",
        });
      }

      const razorpay =
        getRazorpayInstance();

      const razorpayOrder =
        await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `nexora_${nexoraOrder._id
            .toString()
            .slice(-14)}`,
          notes: {
            nexoraOrderId:
              nexoraOrder._id.toString(),
            userId:
              req.user._id.toString(),
          },
        });

      nexoraOrder.razorpayOrderId =
        razorpayOrder.id;

      await nexoraOrder.save();

      return res.status(200).json({
        success: true,
        message:
          "Razorpay order created successfully.",
        keyId:
          process.env
            .RAZORPAY_KEY_ID,
        orderId:
          nexoraOrder._id,
        razorpayOrderId:
          razorpayOrder.id,
        amount:
          razorpayOrder.amount,
        currency:
          razorpayOrder.currency,
      });
    } catch (error) {
      console.error(
        "Create Razorpay Order Error:",
        error
      );

      // If Razorpay order creation itself fails after
      // Nexora order reserved stock, undo that reservation.
      if (
        nexoraOrder &&
        !nexoraOrder.razorpayOrderId &&
        nexoraOrder.paymentStatus !==
          "paid" &&
        nexoraOrder.orderStatus !==
          "cancelled"
      ) {
        try {
          await cancelPendingRazorpayOrderInternal(
            nexoraOrder
          );
        } catch (rollbackError) {
          console.error(
            "Razorpay Order Rollback Error:",
            rollbackError
          );
        }
      }

      return res.status(500).json({
        success: false,
        message:
          error?.error?.description ||
          error?.message ||
          "Unable to create Razorpay order.",
      });
    }
  };

// ======================================================
// Verify Razorpay Payment
// ======================================================

export const verifyRazorpayPayment =
  async (req, res) => {
    try {
      const {
        orderId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      } = req.body || {};

      if (
        !orderId ||
        !mongoose.Types.ObjectId.isValid(
          orderId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid orderId is required.",
        });
      }

      if (
        !razorpay_payment_id ||
        !razorpay_order_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Incomplete Razorpay payment response.",
        });
      }

      const order =
        await Order.findOne({
          _id: orderId,
          user: req.user._id,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        order.paymentMethod !==
        "RAZORPAY"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This order is not a Razorpay order.",
        });
      }

      if (
        order.paymentStatus === "paid"
      ) {
        return res.status(200).json({
          success: true,
          message:
            "Payment already verified.",
          order,
        });
      }

      if (
        !order.razorpayOrderId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Razorpay order ID is missing.",
        });
      }

      // The browser callback order id must match
      // the one previously saved by our server.
      if (
        razorpay_order_id !==
        order.razorpayOrderId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Razorpay order mismatch.",
        });
      }

      const signatureBody =
        `${order.razorpayOrderId}|${razorpay_payment_id}`;

      const expectedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env
              .RAZORPAY_KEY_SECRET
          )
          .update(signatureBody)
          .digest("hex");

      const expectedBuffer =
        Buffer.from(
          expectedSignature,
          "utf8"
        );

      const receivedBuffer =
        Buffer.from(
          razorpay_signature,
          "utf8"
        );

      const signatureValid =
        expectedBuffer.length ===
          receivedBuffer.length &&
        crypto.timingSafeEqual(
          expectedBuffer,
          receivedBuffer
        );

      if (!signatureValid) {
        return res.status(400).json({
          success: false,
          message:
            "Payment signature verification failed.",
        });
      }

      const razorpay =
        getRazorpayInstance();

      let payment =
        await razorpay.payments.fetch(
          razorpay_payment_id
        );

      const expectedAmount =
        Math.round(
          Number(order.finalAmount) *
            100
        );

      if (
        payment.order_id !==
        order.razorpayOrderId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment order verification failed.",
        });
      }

      if (
        Number(payment.amount) !==
        expectedAmount
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment amount verification failed.",
        });
      }

      if (
        payment.currency !== "INR"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment currency verification failed.",
        });
      }

      // If account auto-capture is disabled,
      // capture an authorised payment here.
      if (
        payment.status ===
        "authorized"
      ) {
        payment =
          await razorpay.payments.capture(
            razorpay_payment_id,
            expectedAmount,
            "INR"
          );
      }

      if (
        payment.status !==
        "captured"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Payment is not captured. Current status: ${payment.status}.`,
        });
      }

      order.razorpayPaymentId =
        razorpay_payment_id;

      order.razorpaySignature =
        razorpay_signature;

      order.paymentStatus = "paid";
      order.paidAt = new Date();

      await order.save();

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

      return res.status(200).json({
        success: true,
        message:
          "Payment verified successfully.",
        order: populatedOrder,
      });
    } catch (error) {
      console.error(
        "Verify Razorpay Payment Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.error?.description ||
          error?.message ||
          "Unable to verify payment.",
      });
    }
  };

// ======================================================
// Cancel Pending Razorpay Payment
// Restores stock + cart
// ======================================================

export const cancelPendingRazorpayOrder =
  async (req, res) => {
    try {
      const { orderId } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          orderId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID.",
        });
      }

      const order =
        await Order.findOne({
          _id: orderId,
          user: req.user._id,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        order.paymentMethod !==
        "RAZORPAY"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This is not a Razorpay order.",
        });
      }

      if (
        order.paymentStatus ===
        "paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Paid online order cannot be cancelled here.",
        });
      }

      if (
        order.orderStatus ===
        "cancelled"
      ) {
        return res.status(200).json({
          success: true,
          message:
            "Payment order is already cancelled.",
          order,
        });
      }

      await cancelPendingRazorpayOrderInternal(
        order
      );

      const updatedOrder =
        await Order.findById(
          order._id
        );

      return res.status(200).json({
        success: true,
        message:
          "Online payment cancelled. Cart and stock restored.",
        order: updatedOrder,
      });
    } catch (error) {
      console.error(
        "Cancel Razorpay Order Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to cancel online payment order.",
      });
    }
  };
