import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Users,
  Package,
  ShoppingBag,
  IndianRupee,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserRound,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

import api from "../../../api/axios";

function Dashboard() {
  const [
    stats,
    setStats,
  ] = useState(null);

  const [
    lowStockProducts,
    setLowStockProducts,
  ] = useState([]);

  const [
    recentOrders,
    setRecentOrders,
  ] = useState([]);

  const [
    recentUsers,
    setRecentUsers,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ======================================================
  // FETCH DASHBOARD
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardStats =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/dashboard/stats"
            );

          if (cancelled) {
            return;
          }

          setStats(
            response.data
              .stats || null
          );

          setLowStockProducts(
            response.data
              .lowStockProducts || []
          );

          setRecentOrders(
            response.data
              .recentOrders || []
          );

          setRecentUsers(
            response.data
              .recentUsers || []
          );
        } catch (error) {
          console.error(
            "Dashboard Stats Error:",
            error
          );

          if (!cancelled) {
            setError(
              error.response?.data
                ?.message ||
                "Unable to load dashboard data."
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    fetchDashboardStats();

    return () => {
      cancelled = true;
    };
  }, []);

  // ======================================================
  // HELPERS
  // ======================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const statusClass = (
    status
  ) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "shipped":
        return "bg-purple-100 text-purple-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="bg-white border border-red-200 rounded-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600">
            Dashboard Error
          </h2>

          <p className="text-gray-600 mt-3">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ================================================= */}
        {/* HEADING */}
        {/* ================================================= */}

        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
            Nexora Admin
          </p>

          <h1 className="text-4xl font-bold mt-3">
            Admin Dashboard
          </h1>

          <p className="text-gray-600 mt-3">
            Overview of users,
            products, orders and
            revenue.
          </p>
        </div>

        {/* ================================================= */}
        {/* MAIN STATS */}
        {/* ================================================= */}

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* USERS */}

          <Link
            to="/admin/users"
            className="group bg-white rounded-xl border p-6 hover:border-black hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Users
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {stats?.totalUsers ??
                    0}
                </h2>
              </div>

              <div className="flex flex-col items-end gap-4">
                <Users
                  size={30}
                />

                <ArrowUpRight
                  size={17}
                  className="text-gray-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
                />
              </div>
            </div>
          </Link>

          {/* PRODUCTS */}

          <Link
            to="/admin/products"
            className="group bg-white rounded-xl border p-6 hover:border-black hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Products
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {stats?.totalProducts ??
                    0}
                </h2>
              </div>

              <div className="flex flex-col items-end gap-4">
                <Package
                  size={30}
                />

                <ArrowUpRight
                  size={17}
                  className="text-gray-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
                />
              </div>
            </div>
          </Link>

          {/* ORDERS */}

          <Link
            to="/admin/orders"
            className="group bg-white rounded-xl border p-6 hover:border-black hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Orders
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {stats?.totalOrders ??
                    0}
                </h2>
              </div>

              <div className="flex flex-col items-end gap-4">
                <ShoppingBag
                  size={30}
                />

                <ArrowUpRight
                  size={17}
                  className="text-gray-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
                />
              </div>
            </div>
          </Link>

          {/* REVENUE */}

          <Link
            to="/admin/orders"
            className="group bg-white rounded-xl border p-6 hover:border-black hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Revenue
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  ₹
                  {Number(
                    stats?.totalRevenue ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </h2>
              </div>

              <div className="flex flex-col items-end gap-4">
                <IndianRupee
                  size={30}
                />

                <ArrowUpRight
                  size={17}
                  className="text-gray-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
                />
              </div>
            </div>
          </Link>
        </div>

        {/* ================================================= */}
        {/* ORDER STATUS */}
        {/* ================================================= */}

        <div className="mt-10">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-2xl font-bold">
              Order Status
            </h2>

            <Link
              to="/admin/orders"
              className="text-sm font-medium flex items-center gap-1 hover:underline"
            >
              View all orders

              <ArrowUpRight
                size={16}
              />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">

            {/* PENDING */}

            <Link
              to="/admin/orders?status=pending"
              className="group bg-white border rounded-xl p-5 hover:border-black hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between">
                <Clock
                  size={24}
                />

                <ArrowUpRight
                  size={16}
                  className="text-gray-400 group-hover:text-black transition"
                />
              </div>

              <p className="text-gray-500 text-sm mt-4">
                Pending
              </p>

              <h3 className="text-2xl font-bold mt-1">
                {stats?.orders
                  ?.pending ?? 0}
              </h3>
            </Link>

            {/* PROCESSING */}

            <Link
              to="/admin/orders?status=processing"
              className="group bg-white border rounded-xl p-5 hover:border-black hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between">
                <Package
                  size={24}
                />

                <ArrowUpRight
                  size={16}
                  className="text-gray-400 group-hover:text-black transition"
                />
              </div>

              <p className="text-gray-500 text-sm mt-4">
                Processing
              </p>

              <h3 className="text-2xl font-bold mt-1">
                {stats?.orders
                  ?.processing ?? 0}
              </h3>
            </Link>

            {/* SHIPPED */}

            <Link
              to="/admin/orders?status=shipped"
              className="group bg-white border rounded-xl p-5 hover:border-black hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between">
                <Truck
                  size={24}
                />

                <ArrowUpRight
                  size={16}
                  className="text-gray-400 group-hover:text-black transition"
                />
              </div>

              <p className="text-gray-500 text-sm mt-4">
                Shipped
              </p>

              <h3 className="text-2xl font-bold mt-1">
                {stats?.orders
                  ?.shipped ?? 0}
              </h3>
            </Link>

            {/* DELIVERED */}

            <Link
              to="/admin/orders?status=delivered"
              className="group bg-white border rounded-xl p-5 hover:border-black hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between">
                <CheckCircle2
                  size={24}
                />

                <ArrowUpRight
                  size={16}
                  className="text-gray-400 group-hover:text-black transition"
                />
              </div>

              <p className="text-gray-500 text-sm mt-4">
                Delivered
              </p>

              <h3 className="text-2xl font-bold mt-1">
                {stats?.orders
                  ?.delivered ?? 0}
              </h3>
            </Link>

            {/* CANCELLED */}

            <Link
              to="/admin/orders?status=cancelled"
              className="group bg-white border rounded-xl p-5 hover:border-black hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between">
                <XCircle
                  size={24}
                />

                <ArrowUpRight
                  size={16}
                  className="text-gray-400 group-hover:text-black transition"
                />
              </div>

              <p className="text-gray-500 text-sm mt-4">
                Cancelled
              </p>

              <h3 className="text-2xl font-bold mt-1">
                {stats?.orders
                  ?.cancelled ?? 0}
              </h3>
            </Link>
          </div>
        </div>

        {/* ================================================= */}
        {/* RECENT ORDERS + RECENT USERS */}
        {/* ================================================= */}

        <div className="grid xl:grid-cols-2 gap-8 mt-10">

          {/* RECENT ORDERS */}

          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Recent Orders
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Latest customer
                  orders.
                </p>
              </div>

              <Link
                to="/admin/orders"
                className="text-sm font-medium flex items-center gap-1 hover:underline"
              >
                View All

                <ArrowUpRight
                  size={15}
                />
              </Link>
            </div>

            {recentOrders.length ===
            0 ? (
              <div className="p-8 text-gray-500">
                No recent orders.
              </div>
            ) : (
              <div className="divide-y">
                {recentOrders.map(
                  (order) => (
                    <div
                      key={
                        order._id
                      }
                      className="p-5 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">
                            {order.user
                              ?.name ||
                              "User"}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            {order.user
                              ?.email ||
                              "-"}
                          </p>
                        </div>

                        <span
                          className={`text-xs px-3 py-1.5 rounded-full capitalize ${statusClass(
                            order.orderStatus
                          )}`}
                        >
                          {
                            order.orderStatus
                          }
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <span className="font-bold">
                          ₹
                          {Number(
                            order.finalAmount ??
                              order.totalAmount ??
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <CalendarDays
                            size={14}
                          />

                          {formatDate(
                            order.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* RECENT USERS */}

          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Recent Users
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Recently registered
                  customers.
                </p>
              </div>

              <Link
                to="/admin/users"
                className="text-sm font-medium flex items-center gap-1 hover:underline"
              >
                View All

                <ArrowUpRight
                  size={15}
                />
              </Link>
            </div>

            {recentUsers.length ===
            0 ? (
              <div className="p-8 text-gray-500">
                No recent users.
              </div>
            ) : (
              <div className="divide-y">
                {recentUsers.map(
                  (user) => (
                    <div
                      key={
                        user._id
                      }
                      className="p-5 flex items-center gap-4 hover:bg-gray-50 transition"
                    >
                      <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {user.avatar ? (
                          <img
                            src={
                              user.avatar
                            }
                            alt={
                              user.name
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserRound
                            size={19}
                            className="text-gray-500"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {
                            user.name
                          }
                        </p>

                        <p className="text-sm text-gray-500 truncate mt-1">
                          {
                            user.email
                          }
                        </p>
                      </div>

                      <span className="text-xs text-gray-500">
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* LOW STOCK */}
        {/* ================================================= */}

        <div className="mt-10">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <AlertTriangle
                size={24}
              />

              <h2 className="text-2xl font-bold">
                Low Stock Products
              </h2>
            </div>

            <Link
              to="/admin/products"
              className="text-sm font-medium flex items-center gap-1 hover:underline"
            >
              Manage Products

              <ArrowUpRight
                size={15}
              />
            </Link>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden">
            {lowStockProducts.length ===
            0 ? (
              <div className="p-8 text-center text-gray-500">
                No low stock
                products.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm">
                        Product
                      </th>

                      <th className="text-left px-6 py-4 text-sm">
                        Price
                      </th>

                      <th className="text-left px-6 py-4 text-sm">
                        Stock
                      </th>

                      <th className="text-left px-6 py-4 text-sm">
                        Brand
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {lowStockProducts.map(
                      (
                        product
                      ) => (
                        <tr
                          key={
                            product._id
                          }
                          className="border-b last:border-b-0 hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                {product
                                  .images
                                  ?.length >
                                0 ? (
                                  <img
                                    src={
                                      product
                                        .images[0]
                                        .url
                                    }
                                    alt={
                                      product.name
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                    No Image
                                  </div>
                                )}
                              </div>

                              <span className="font-medium">
                                {
                                  product.name
                                }
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            ₹
                            {product.discountPrice >
                            0
                              ? product.discountPrice
                              : product.price}
                          </td>

                          <td className="px-6 py-4">
                            <span className="font-semibold text-red-600">
                              {
                                product.stock
                              }
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {product.brand ||
                              "-"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;