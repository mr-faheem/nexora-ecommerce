import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Package,
  MapPin,
  CreditCard,
  CalendarDays,
  XCircle,
} from "lucide-react";

import {
  getMyOrders,
  cancelMyOrder,
} from "../../services/orderService";

function Orders() {
  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [
    cancellingOrderId,
    setCancellingOrderId,
  ] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getMyOrders();

      setOrders(
        data.orders || []
      );
    } catch (error) {
      console.error(
        "Fetch My Orders Error:",
        error
      );

      setError(
        error.response?.data
          ?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder =
    async (orderId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this order?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setCancellingOrderId(
          orderId
        );

        setError("");
        setMessage("");

        const data =
          await cancelMyOrder(
            orderId
          );

        setMessage(
          data.message ||
            "Order cancelled successfully."
        );

        await fetchOrders();
      } catch (error) {
        console.error(
          "Cancel Order Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to cancel order."
        );
      } finally {
        setCancellingOrderId(
          null
        );
      }
    };

  const formatDate = (date) => {
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500">
          Loading orders...
        </p>
      </div>
    );
  }

  if (
    !loading &&
    orders.length === 0
  ) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 text-center">
        <Package
          size={72}
          strokeWidth={1.4}
        />

        <h1 className="text-3xl md:text-4xl font-bold mt-6">
          No orders yet
        </h1>

        <p className="text-gray-500 mt-3">
          Your placed orders will
          appear here.
        </p>

        <Link
          to="/shop"
          className="mt-7 bg-black !text-white px-7 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
            Your Account
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            My Orders
          </h1>

          <p className="text-gray-500 mt-3">
            Track and manage your
            recent orders.
          </p>
        </div>

        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 text-red-700 px-5 py-4 rounded-xl">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 border border-green-200 bg-green-50 text-green-700 px-5 py-4 rounded-xl">
            {message}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {orders.map(
            (order) => {
              const canCancel =
                order.orderStatus ===
                  "pending" ||
                order.orderStatus ===
                  "processing";

              return (
                <div
                  key={order._id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-5 md:p-6 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order ID
                      </p>

                      <p className="font-semibold mt-1 break-all">
                        {order._id}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${statusClass(
                          order.orderStatus
                        )}`}
                      >
                        {
                          order.orderStatus
                        }
                      </span>

                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <CalendarDays
                          size={16}
                        />

                        {formatDate(
                          order.createdAt
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="grid lg:grid-cols-[1fr_360px]">
                    {/* Products */}
                    <div className="p-5 md:p-6">
                      <h2 className="text-xl font-bold">
                        Products
                      </h2>

                      <div className="mt-5 space-y-5">
                        {order.items?.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={`${order._id}-${index}`}
                              className="flex gap-4"
                            >
                              <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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

                              <div className="flex-1">
                                <p className="font-semibold">
                                  {
                                    item.name
                                  }
                                </p>

                                <p className="text-sm text-gray-500 mt-1">
                                  Qty:{" "}
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

                    {/* Details */}
                    <div className="border-t lg:border-t-0 lg:border-l border-gray-200 p-5 md:p-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <CreditCard
                            size={19}
                          />

                          <h3 className="font-bold">
                            Payment
                          </h3>
                        </div>

                        <div className="mt-3 text-sm space-y-2">
                          <p>
                            Method:{" "}
                            <span className="font-medium">
                              {
                                order.paymentMethod
                              }
                            </span>
                          </p>

                          <p>
                            Status:{" "}
                            <span className="font-medium capitalize">
                              {
                                order.paymentStatus
                              }
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 my-5" />

                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={19}
                          />

                          <h3 className="font-bold">
                            Shipping Address
                          </h3>
                        </div>

                        <div className="text-sm text-gray-600 mt-3 leading-6">
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
                      </div>

                      <div className="border-t border-gray-200 my-5" />

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Subtotal
                          </span>

                          <span>
                            ₹
                            {
                              order.subtotal
                            }
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

                            <span className="text-green-700">
                              -₹
                              {
                                order.discountAmount
                              }
                            </span>
                          </div>
                        )}

                        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                          <span className="font-semibold text-base">
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

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCancelOrder(
                              order._id
                            )
                          }
                          disabled={
                            cancellingOrderId ===
                            order._id
                          }
                          className="mt-6 w-full border border-red-300 text-red-600 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition disabled:opacity-50"
                        >
                          <XCircle
                            size={18}
                          />

                          {cancellingOrderId ===
                          order._id
                            ? "Cancelling..."
                            : "Cancel Order"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;