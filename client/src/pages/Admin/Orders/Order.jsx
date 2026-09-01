import {
  useEffect,
  useState,
} from "react";

import {
  Package,
  MapPin,
  CreditCard,
  CalendarDays,
} from "lucide-react";

import api from "../../../api/axios";

function Order() {
  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/orders/admin/all"
      );

      setOrders(
        response.data.orders || []
      );
    } catch (error) {
      console.error(
        "Admin Orders Fetch Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          "/orders/admin/all"
        );

        if (!cancelled) {
          setOrders(
            response.data.orders || []
          );
        }
      } catch (error) {
        console.error(
          "Admin Orders Fetch Error:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data
              ?.message ||
              "Unable to load orders."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleStatusChange =
    async (orderId, status) => {
      try {
        setUpdatingId(orderId);
        setError("");
        setMessage("");

        const response =
          await api.put(
            `/orders/${orderId}/status`,
            {
              status: status,
            }
          );

        setMessage(
          response.data.message ||
            "Order status updated successfully."
        );

        setOrders((current) =>
          current.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  orderStatus:
                    response.data
                      .order
                      ?.orderStatus ||
                    status,
                }
              : order
          )
        );
      } catch (error) {
        console.error(
          "Update Order Status Error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to update order status."
        );
      } finally {
        setUpdatingId(null);
      }
    };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusClass = (status) => {
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

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl">
        <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
          Store Management
        </p>

        <h1 className="text-4xl font-bold mt-3">
          Orders
        </h1>

        <p className="text-gray-600 mt-3">
          Manage customer orders and
          delivery status.
        </p>

        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 border border-green-200 bg-green-50 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="mt-8 bg-white border rounded-xl p-8 text-gray-500">
            No orders found.
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border rounded-2xl overflow-hidden"
              >
                <div className="p-5 border-b flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      Order ID
                    </p>

                    <p className="font-semibold mt-1 break-all">
                      {order._id}
                    </p>

                    {order.user && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium text-black">
                          Customer:
                        </span>{" "}
                        {order.user.name ||
                          "User"}

                        {order.user.email && (
                          <>
                            {" "}
                            •{" "}
                            {
                              order.user
                                .email
                            }
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full capitalize ${statusClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>

                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays
                        size={16}
                      />

                      {formatDate(
                        order.createdAt
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid xl:grid-cols-[1fr_380px]">
                  <div className="p-5">
                    <h2 className="font-bold text-xl">
                      Products
                    </h2>

                    <div className="mt-5 space-y-4">
                      {order.items?.map(
                        (item, index) => (
                          <div
                            key={`${order._id}-${index}`}
                            className="flex items-center gap-4"
                          >
                            <div className="w-20 h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                              {item.image ? (
                                <img
                                  src={
                                    item.image
                                  }
                                  alt={
                                    item.name
                                  }
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-semibold">
                                {
                                  item.name
                                }
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                Quantity:{" "}
                                {
                                  item.quantity
                                }
                              </p>

                              <p className="font-medium mt-2">
                                ₹
                                {item.price *
                                  item.quantity}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="border-t xl:border-t-0 xl:border-l p-5">
                    <div className="flex items-center gap-2">
                      <CreditCard
                        size={18}
                      />

                      <h3 className="font-bold">
                        Payment
                      </h3>
                    </div>

                    <div className="text-sm mt-3 space-y-2">
                      <p>
                        Method:{" "}
                        <span className="font-medium">
                          {
                            order.paymentMethod
                          }
                        </span>
                      </p>

                      <p>
                        Payment Status:{" "}
                        <span className="font-medium capitalize">
                          {
                            order.paymentStatus
                          }
                        </span>
                      </p>
                    </div>

                    <div className="border-t my-5" />

                    <div className="flex items-center gap-2">
                      <MapPin
                        size={18}
                      />

                      <h3 className="font-bold">
                        Shipping Address
                      </h3>
                    </div>

                    <div className="mt-3 text-sm text-gray-600 leading-6">
                      <p className="font-medium text-black">
                        {
                          order
                            .shippingAddress
                            ?.fullName
                        }
                      </p>

                      <p>
                        {
                          order
                            .shippingAddress
                            ?.address
                        }
                      </p>

                      <p>
                        {
                          order
                            .shippingAddress
                            ?.city
                        }
                        ,{" "}
                        {
                          order
                            .shippingAddress
                            ?.state
                        }
                      </p>

                      <p>
                        {
                          order
                            .shippingAddress
                            ?.postalCode
                        }
                      </p>

                      <p>
                        {
                          order
                            .shippingAddress
                            ?.country
                        }
                      </p>

                      <p className="mt-2">
                        Phone:{" "}
                        {
                          order
                            .shippingAddress
                            ?.phone
                        }
                      </p>
                    </div>

                    <div className="border-t my-5" />

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Subtotal
                        </span>

                        <span>
                          ₹{order.subtotal}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Shipping
                        </span>

                        <span>
                          {order.shippingCharge ===
                          0
                            ? "Free"
                            : `₹${order.shippingCharge}`}
                        </span>
                      </div>

                      {order.discountAmount >
                        0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Discount
                          </span>

                          <span className="text-green-600">
                            -₹
                            {
                              order.discountAmount
                            }
                          </span>
                        </div>
                      )}

                      <div className="border-t pt-4 flex items-center justify-between">
                        <span className="font-semibold">
                          Total
                        </span>

                        <span className="text-xl font-bold">
                          ₹
                          {
                            order.finalAmount
                          }
                        </span>
                      </div>
                    </div>

                    <div className="border-t my-5" />

                    <label className="block font-medium mb-2">
                      Update Order Status
                    </label>

                    <select
                      value={
                        order.orderStatus
                      }
                      disabled={
                        updatingId ===
                        order._id
                      }
                      onChange={(event) =>
                        handleStatusChange(
                          order._id,
                          event.target.value
                        )
                      }
                      className="w-full border rounded-lg px-4 py-3 bg-white outline-none"
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="processing">
                        Processing
                      </option>

                      <option value="shipped">
                        Shipped
                      </option>

                      <option value="delivered">
                        Delivered
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>

                    {updatingId ===
                      order._id && (
                      <p className="text-sm text-gray-500 mt-2">
                        Updating...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Order;