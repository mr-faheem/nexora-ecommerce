import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ======================================================
// Admin Dashboard Stats
// ======================================================

export const getDashboardStats = async (req, res) => {
  try {
    // -----------------------------------------------
    // Basic Counts
    // -----------------------------------------------

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.countDocuments({ orderStatus: "processing" }),
      Order.countDocuments({ orderStatus: "shipped" }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Order.countDocuments({ orderStatus: "cancelled" }),
    ]);

    // -----------------------------------------------
    // Revenue
    // Only delivered orders
    // -----------------------------------------------

    const revenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $ifNull: ["$finalAmount", "$totalAmount"],
            },
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    // -----------------------------------------------
    // Low Stock Products
    // -----------------------------------------------

    const lowStockProducts = await Product.find({
      stock: {
        $lte: 5,
      },
      isActive: true,
    })
      .select(
        "name slug stock price discountPrice images brand"
      )
      .sort({
        stock: 1,
      })
      .limit(10);

    // -----------------------------------------------
    // Recent Orders
    // -----------------------------------------------

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .select(
        "user finalAmount totalAmount orderStatus paymentStatus createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5);

    // -----------------------------------------------
    // Recent Users
    // -----------------------------------------------

    const recentUsers = await User.find({
      role: "user",
    })
      .select("name email avatar createdAt")
      .sort({
        createdAt: -1,
      })
      .limit(5);

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    return res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,

        orders: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
      },

      lowStockProducts,

      recentOrders,

      recentUsers,
    });
  } catch (error) {
    console.error(
      "Dashboard Stats Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching dashboard stats.",
    });
  }
};