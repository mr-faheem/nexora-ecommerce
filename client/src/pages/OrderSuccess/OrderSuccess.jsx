import {
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  CheckCircle2,
  PackageCheck,
  CreditCard,
  Banknote,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

function OrderSuccess() {
  const location = useLocation();

  const order =
    location.state?.order || null;

  const paymentMethod =
    location.state?.paymentMethod ||
    order?.paymentMethod ||
    "";

  const paymentStatus =
    location.state?.paymentStatus ||
    order?.paymentStatus ||
    "";

  /*
   * Agar koi manually /order-success URL
   * open kare aur order data available na ho
   * to My Orders par bhej do.
   */
  if (!order?._id) {
    return (
      <Navigate
        to="/orders"
        replace
      />
    );
  }

  const isRazorpay =
    paymentMethod === "RAZORPAY";

  const isPaid =
    paymentStatus === "paid";

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

  return (
    <div className="bg-gray-50 min-h-[85vh]">
      <div className="max-w-4xl mx-auto px-6 py-14">
        {/* Success Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2
              size={44}
              strokeWidth={1.8}
            />
          </div>

          <p className="text-sm uppercase tracking-[0.25em] text-gray-500 mt-6">
            Nexora
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Order Confirmed!
          </h1>

          <p className="text-gray-600 mt-4 max-w-xl mx-auto leading-7">
            Thank you for your purchase.
            Your order has been placed
            successfully and we&apos;ll
            notify you when it is shipped.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-2xl mt-10 overflow-hidden">
          {/* Top */}
          <div className="p-6 md:p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <p className="text-sm text-gray-500">
                  Order ID
                </p>

                <p className="font-bold mt-1 break-all">
                  {order._id}
                </p>
              </div>

              <div className="md:text-right">
                <p className="text-sm text-gray-500">
                  Order Date
                </p>

                <p className="font-medium mt-1">
                  {formatDate(
                    order.createdAt
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="grid md:grid-cols-3">
            {/* Order */}
            <div className="p-6 md:p-7 border-b md:border-b-0 md:border-r border-gray-200">
              <div className="flex items-center gap-3">
                <PackageCheck
                  size={23}
                />

                <h2 className="font-bold">
                  Order Status
                </h2>
              </div>

              <p className="mt-4 text-green-700 font-semibold">
                Confirmed
              </p>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                Your order has been
                received by Nexora.
              </p>
            </div>

            {/* Payment */}
            <div className="p-6 md:p-7 border-b md:border-b-0 md:border-r border-gray-200">
              <div className="flex items-center gap-3">
                {isRazorpay ? (
                  <CreditCard
                    size={23}
                  />
                ) : (
                  <Banknote
                    size={23}
                  />
                )}

                <h2 className="font-bold">
                  Payment
                </h2>
              </div>

              <p className="mt-4 font-semibold">
                {isRazorpay
                  ? "Online Payment"
                  : "Cash on Delivery"}
              </p>

              <p
                className={`text-sm mt-2 font-medium ${
                  isPaid
                    ? "text-green-700"
                    : "text-yellow-700"
                }`}
              >
                {isPaid
                  ? "Payment successful"
                  : "Payment due on delivery"}
              </p>
            </div>

            {/* Total */}
            <div className="p-6 md:p-7">
              <div className="flex items-center gap-3">
                <ShoppingBag
                  size={23}
                />

                <h2 className="font-bold">
                  Order Total
                </h2>
              </div>

              <p className="text-2xl font-bold mt-4">
                ₹
                {order.finalAmount ??
                  order.totalAmount ??
                  0}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Including applicable
                shipping charges.
              </p>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-white border border-gray-200 rounded-2xl mt-6 p-6 md:p-8">
          <h2 className="text-xl font-bold">
            What happens next?
          </h2>

          <div className="mt-6 grid sm:grid-cols-3 gap-6">
            <div>
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                1
              </div>

              <h3 className="font-semibold mt-3">
                Order confirmed
              </h3>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                We have received your
                order successfully.
              </p>
            </div>

            <div>
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                2
              </div>

              <h3 className="font-semibold mt-3">
                Processing
              </h3>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                Our team will prepare
                your products for
                dispatch.
              </p>
            </div>

            <div>
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                3
              </div>

              <h3 className="font-semibold mt-3">
                Shipped
              </h3>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                You&apos;ll be able to
                track the latest order
                status from My Orders.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Link
            to="/orders"
            className="bg-black !text-white px-7 py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition"
          >
            View My Orders

            <ArrowRight
              size={18}
            />
          </Link>

          <Link
            to="/shop"
            className="border border-black text-black px-7 py-3.5 rounded-lg font-medium flex items-center justify-center hover:bg-black hover:!text-white transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;