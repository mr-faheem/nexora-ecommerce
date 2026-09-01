import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  MapPin,
  ShoppingBag,
  Truck,
  Banknote,
  CreditCard,
} from "lucide-react";

import api from "../../api/axios";

import useCart from "../../hooks/useCart";

import {
  createOrder,
  createRazorpayPaymentOrder,
  verifyRazorpayPayment,
  cancelPendingRazorpayPayment,
} from "../../services/orderService";

// ======================================================
// Load Razorpay Checkout Script
// ======================================================

const loadRazorpayScript = () => {
  return new Promise(
    (resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true)
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false)
        );

        return;
      }

      const script =
        document.createElement(
          "script"
        );

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(
        script
      );
    }
  );
};

// ======================================================
// Checkout
// ======================================================

function Checkout() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const {
    cart,
    fetchCart,
  } = useCart();

  // ======================================================
  // Buy Now Mode
  // ======================================================

  const isBuyNow =
    searchParams.get(
      "buyNow"
    ) === "1";

  const [
    buyNowProduct,
    setBuyNowProduct,
  ] = useState(null);

  const [
    buyNowQuantity,
    setBuyNowQuantity,
  ] = useState(1);

  const [
    buyNowLoading,
    setBuyNowLoading,
  ] = useState(
    isBuyNow
  );

  // ======================================================
  // Form
  // ======================================================

  const [
    formData,
    setFormData,
  ] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    couponCode: "",
    paymentMethod: "COD",
  });

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  // ======================================================
  // Protect Checkout
  // ======================================================

  useEffect(() => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      navigate(
        "/login",
        {
          replace: true,
        }
      );
    }
  }, [navigate]);

  // ======================================================
  // Load Buy Now Product
  // ======================================================

  useEffect(() => {
    if (!isBuyNow) {
      setBuyNowLoading(
        false
      );

      return;
    }

    let cancelled = false;

    const loadBuyNowProduct =
      async () => {
        try {
          setBuyNowLoading(
            true
          );

          setError("");

          const stored =
            sessionStorage.getItem(
              "nexoraBuyNow"
            );

          if (!stored) {
            if (!cancelled) {
              setError(
                "Buy Now product was not found. Please select the product again."
              );
            }

            return;
          }

          let buyNowData;

          try {
            buyNowData =
              JSON.parse(
                stored
              );
          } catch {
            sessionStorage.removeItem(
              "nexoraBuyNow"
            );

            if (!cancelled) {
              setError(
                "Invalid Buy Now data. Please select the product again."
              );
            }

            return;
          }

          if (
            !buyNowData
              ?.productId
          ) {
            if (!cancelled) {
              setError(
                "Buy Now product was not found."
              );
            }

            return;
          }

          const response =
            await api.get(
              `/products/${buyNowData.productId}`
            );

          const product =
            response.data
              ?.product;

          if (!product) {
            if (!cancelled) {
              setError(
                "Product could not be found."
              );
            }

            return;
          }

          if (
            product.isActive ===
            false
          ) {
            if (!cancelled) {
              setError(
                "This product is currently unavailable."
              );
            }

            return;
          }

          if (
            Number(
              product.stock ||
                0
            ) <= 0
          ) {
            if (!cancelled) {
              setError(
                "This product is out of stock."
              );
            }

            return;
          }

          const requestedQuantity =
            Number(
              buyNowData.quantity ||
                1
            );

          const safeQuantity =
            Math.max(
              1,
              Math.min(
                Number.isFinite(
                  requestedQuantity
                )
                  ? requestedQuantity
                  : 1,

                Number(
                  product.stock
                )
              )
            );

          if (!cancelled) {
            setBuyNowProduct(
              product
            );

            setBuyNowQuantity(
              safeQuantity
            );
          }
        } catch (loadError) {
          console.error(
            "Buy Now Product Error:",
            loadError
          );

          if (!cancelled) {
            setError(
              loadError.response
                ?.data?.message ||
                "Unable to load Buy Now product."
            );
          }
        } finally {
          if (!cancelled) {
            setBuyNowLoading(
              false
            );
          }
        }
      };

    loadBuyNowProduct();

    return () => {
      cancelled = true;
    };
  }, [isBuyNow]);

  // ======================================================
  // Checkout Items
  // ======================================================

  const items =
    isBuyNow
      ? buyNowProduct
        ? [
            {
              product:
                buyNowProduct,

              quantity:
                buyNowQuantity,
            },
          ]
        : []
      : cart?.items || [];

  // ======================================================
  // Form Change
  // ======================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,

        [name]:
          value,
      })
    );
  };

  // ======================================================
  // Price Calculation
  // ======================================================

  const subtotal =
    items.reduce(
      (
        total,
        item
      ) => {
        const product =
          item.product;

        if (!product) {
          return total;
        }

        const price =
          product.discountPrice &&
          product.discountPrice >
            0
            ? product.discountPrice
            : product.price;

        return (
          total +
          Number(price) *
            Number(
              item.quantity ||
                1
            )
        );
      },
      0
    );

  const shippingCharge =
    subtotal >= 999 ||
    subtotal === 0
      ? 0
      : 99;

  const estimatedTotal =
    subtotal +
    shippingCharge;

  // ======================================================
  // Build Order Payload
  // ======================================================

  const buildOrderPayload =
    () => {
      const payload = {
        fullName:
          formData.fullName.trim(),

        phone:
          formData.phone.trim(),

        address:
          formData.address.trim(),

        city:
          formData.city.trim(),

        state:
          formData.state.trim(),

        postalCode:
          formData.postalCode.trim(),

        country:
          formData.country.trim() ||
          "India",

        paymentMethod:
          formData.paymentMethod,
      };

      if (
        formData.couponCode.trim()
      ) {
        payload.couponCode =
          formData.couponCode
            .trim()
            .toUpperCase();
      }

      // ================================================
      // Buy Now
      // ================================================

      if (
        isBuyNow &&
        buyNowProduct
      ) {
        payload.buyNow = {
          productId:
            buyNowProduct._id,

          quantity:
            buyNowQuantity,
        };
      }

      return payload;
    };

  // ======================================================
  // Validation
  // ======================================================

  const validateCheckout =
    () => {
      if (
        items.length === 0
      ) {
        setError(
          isBuyNow
            ? "Buy Now product is not available."
            : "Your cart is empty."
        );

        return false;
      }

      if (
        !formData.fullName.trim() ||
        !formData.phone.trim() ||
        !formData.address.trim() ||
        !formData.city.trim() ||
        !formData.state.trim() ||
        !formData.postalCode.trim()
      ) {
        setError(
          "Please complete your shipping address."
        );

        return false;
      }

      return true;
    };

  // ======================================================
  // Clear Buy Now Temporary Data
  // ======================================================

  const clearBuyNowData =
    () => {
      if (!isBuyNow) {
        return;
      }

      sessionStorage.removeItem(
        "nexoraBuyNow"
      );
    };

  // ======================================================
  // COD Order
  // ======================================================

  const handleCodOrder =
    async (
      orderPayload
    ) => {
      const data =
        await createOrder(
          orderPayload
        );

      const createdOrder =
        data.order;

      if (
        !createdOrder?._id
      ) {
        throw new Error(
          "Order was created but order data was not received."
        );
      }

      setSuccess(
        data.message ||
          "Order placed successfully."
      );

      // Normal cart checkout:
      // backend clears cart.
      //
      // Buy Now:
      // backend does NOT clear existing cart.
      await fetchCart();

      clearBuyNowData();

      navigate(
        "/order-success",
        {
          replace: true,

          state: {
            order:
              createdOrder,

            paymentMethod:
              createdOrder
                .paymentMethod ||
              "COD",

            paymentStatus:
              createdOrder
                .paymentStatus ||
              "pending",
          },
        }
      );
    };

  // ======================================================
  // Razorpay Order
  // ======================================================

  const handleRazorpayOrder =
    async (
      orderPayload
    ) => {
      let nexoraOrderId =
        null;

      let paymentCompleted =
        false;

      /*
       * Razorpay success callback milte hi true.
       * Modal close hone par paid order cancel nahi hoga.
       */
      let paymentCallbackReceived =
        false;

      try {
        // ================================================
        // STEP 1
        // Create Nexora Order
        // ================================================

        const orderData =
          await createOrder(
            orderPayload
          );

        nexoraOrderId =
          orderData.order
            ?._id;

        if (
          !nexoraOrderId
        ) {
          throw new Error(
            "Nexora order ID was not received."
          );
        }

        // ================================================
        // STEP 2
        // Create Razorpay Order
        // ================================================

        const paymentOrder =
          await createRazorpayPaymentOrder(
            nexoraOrderId
          );

        // ================================================
        // STEP 3
        // Load Razorpay
        // ================================================

        const scriptLoaded =
          await loadRazorpayScript();

        if (
          !scriptLoaded
        ) {
          throw new Error(
            "Unable to load Razorpay checkout."
          );
        }

        // ================================================
        // STEP 4
        // Razorpay Options
        // ================================================

        const options = {
          key:
            paymentOrder.keyId,

          amount:
            paymentOrder.amount,

          currency:
            paymentOrder.currency ||
            "INR",

          name:
            "Nexora",

          description:
            isBuyNow
              ? "Nexora Buy Now Payment"
              : "Nexora Order Payment",

          order_id:
            paymentOrder
              .razorpayOrderId,

          prefill: {
            name:
              formData.fullName,

            contact:
              formData.phone,
          },

          notes: {
            nexoraOrderId,
          },

          theme: {
            color:
              "#000000",
          },

          // ==============================================
          // Successful Payment
          // ==============================================

          handler:
            async (
              response
            ) => {
              paymentCallbackReceived =
                true;

              try {
                setLoading(
                  true
                );

                setError("");

                const verifyData =
                  await verifyRazorpayPayment(
                    {
                      orderId:
                        nexoraOrderId,

                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_signature:
                        response.razorpay_signature,
                    }
                  );

                paymentCompleted =
                  true;

                setSuccess(
                  verifyData.message ||
                    "Payment successful."
                );

                await fetchCart();

                const paidOrder =
                  verifyData.order;

                if (
                  !paidOrder
                    ?._id
                ) {
                  throw new Error(
                    "Payment verified but updated order data was not received."
                  );
                }

                clearBuyNowData();

                navigate(
                  "/order-success",
                  {
                    replace:
                      true,

                    state: {
                      order:
                        paidOrder,

                      paymentMethod:
                        paidOrder
                          .paymentMethod ||
                        "RAZORPAY",

                      paymentStatus:
                        paidOrder
                          .paymentStatus ||
                        "paid",
                    },
                  }
                );
              } catch (
                verifyError
              ) {
                console.error(
                  "Razorpay Verify Error:",
                  verifyError
                );

                /*
                 * Payment callback aa chuka hai.
                 * Is stage par automatically cancel nahi karna.
                 */

                setError(
                  verifyError
                    .response
                    ?.data
                    ?.message ||
                    verifyError
                      .message ||
                    "Payment was received but verification failed. Please do not retry payment. Contact support with your payment ID."
                );
              } finally {
                setLoading(
                  false
                );
              }
            },

          // ==============================================
          // Razorpay Modal Close
          // ==============================================

          modal: {
            ondismiss:
              async () => {
                if (
                  paymentCompleted ||
                  paymentCallbackReceived ||
                  !nexoraOrderId
                ) {
                  return;
                }

                try {
                  setLoading(
                    true
                  );

                  await cancelPendingRazorpayPayment(
                    nexoraOrderId
                  );

                  /*
                   * Normal cart payment cancel hone par
                   * backend stock/cart restore karta hai.
                   *
                   * Buy Now mode me existing cart ko
                   * disturb nahi karna chahiye.
                   */
                  await fetchCart();

                  setError(
                    isBuyNow
                      ? "Payment cancelled. Product stock has been restored."
                      : "Payment cancelled. Your cart and stock have been restored."
                  );
                } catch (
                  cancelError
                ) {
                  console.error(
                    "Razorpay Cancel Error:",
                    cancelError
                  );

                  setError(
                    cancelError
                      .response
                      ?.data
                      ?.message ||
                      "Payment window was closed. Please refresh and check your order before trying again."
                  );
                } finally {
                  setLoading(
                    false
                  );
                }
              },
          },
        };

        // ================================================
        // STEP 5
        // Open Razorpay
        // ================================================

        const razorpay =
          new window.Razorpay(
            options
          );

        // ================================================
        // Payment Failed
        // ================================================

        razorpay.on(
          "payment.failed",
          async (
            response
          ) => {
            if (
              paymentCompleted ||
              paymentCallbackReceived ||
              !nexoraOrderId
            ) {
              return;
            }

            try {
              await cancelPendingRazorpayPayment(
                nexoraOrderId
              );

              await fetchCart();
            } catch (
              cancelError
            ) {
              console.error(
                "Failed Payment Rollback Error:",
                cancelError
              );
            }

            setError(
              response.error
                ?.description ||
                "Payment failed. Please try again."
            );

            setLoading(
              false
            );
          }
        );

        razorpay.open();
      } catch (
        paymentError
      ) {
        console.error(
          "Razorpay Start Error:",
          paymentError
        );

        /*
         * Order created but payment didn't start:
         * rollback only if success callback not received.
         */

        if (
          nexoraOrderId &&
          !paymentCompleted &&
          !paymentCallbackReceived
        ) {
          try {
            await cancelPendingRazorpayPayment(
              nexoraOrderId
            );

            await fetchCart();
          } catch (
            rollbackError
          ) {
            console.error(
              "Razorpay Rollback Error:",
              rollbackError
            );
          }
        }

        throw paymentError;
      }
    };

  // ======================================================
  // Place Order
  // ======================================================

  const handlePlaceOrder =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !validateCheckout()
      ) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const orderPayload =
          buildOrderPayload();

        if (
          formData.paymentMethod ===
          "RAZORPAY"
        ) {
          await handleRazorpayOrder(
            orderPayload
          );

          return;
        }

        await handleCodOrder(
          orderPayload
        );
      } catch (
        placeOrderError
      ) {
        console.error(
          "Place Order Error:",
          placeOrderError
        );

        setError(
          placeOrderError
            .response
            ?.data
            ?.message ||
            placeOrderError
              .message ||
            "Unable to place order."
        );

        setLoading(false);
      }
    };

  // ======================================================
  // Buy Now Loading
  // ======================================================

  if (
    isBuyNow &&
    buyNowLoading
  ) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 text-center">
        <ShoppingBag
          size={60}
          strokeWidth={
            1.4
          }
        />

        <p className="text-gray-500 mt-5">
          Preparing Buy Now
          checkout...
        </p>
      </div>
    );
  }

  // ======================================================
  // Empty / Invalid Checkout
  // ======================================================

  if (
    items.length === 0
  ) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 text-center">
        <ShoppingBag
          size={70}
          strokeWidth={
            1.4
          }
        />

        <h1 className="text-3xl font-bold mt-6">
          {isBuyNow
            ? "Product unavailable"
            : "Your cart is empty"}
        </h1>

        <p className="text-gray-500 mt-3 max-w-lg">
          {error ||
            (isBuyNow
              ? "Please select the product again."
              : "Add products before proceeding to checkout.")}
        </p>

        <Link
          to="/shop"
          className="mt-7 bg-black !text-white px-7 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  // ======================================================
  // Checkout UI
  // ======================================================

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}

        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
            Secure Checkout
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            {isBuyNow
              ? "Buy Now"
              : "Checkout"}
          </h1>

          <p className="text-gray-500 mt-3">
            {isBuyNow
              ? "Complete your shipping information to purchase this product."
              : "Complete your shipping information and place your order."}
          </p>
        </div>

        {/* Messages */}

        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 text-red-700 px-5 py-4 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 border border-green-200 bg-green-50 text-green-700 px-5 py-4 rounded-xl">
            {success}
          </div>
        )}

        <form
          onSubmit={
            handlePlaceOrder
          }
          className="grid lg:grid-cols-[1fr_420px] gap-10 mt-10"
        >
          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <div className="space-y-6">

            {/* Shipping Address */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3">
                <MapPin
                  size={24}
                />

                <h2 className="text-2xl font-bold">
                  Shipping Address
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5 mt-7">
                <div>
                  <label className="block font-medium mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={
                      formData.fullName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter full name"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter phone number"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-medium mb-2">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={
                      formData.address
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="House number, street, area..."
                    required
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={
                      formData.city
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="City"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={
                      formData.state
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="State"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Postal Code
                  </label>

                  <input
                    type="text"
                    name="postalCode"
                    value={
                      formData.postalCode
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Postal code"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Country
                  </label>

                  <input
                    type="text"
                    name="country"
                    value={
                      formData.country
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3">
                <Banknote
                  size={24}
                />

                <h2 className="text-2xl font-bold">
                  Payment
                </h2>
              </div>

              {/* COD */}

              <label
                className={`mt-6 rounded-xl p-5 flex items-center gap-4 cursor-pointer border-2 ${
                  formData.paymentMethod ===
                  "COD"
                    ? "border-black"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={
                    formData.paymentMethod ===
                    "COD"
                  }
                  onChange={
                    handleChange
                  }
                />

                <Banknote
                  size={22}
                />

                <div>
                  <p className="font-semibold">
                    Cash on Delivery
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Pay when your
                    order is
                    delivered.
                  </p>
                </div>
              </label>

              {/* Razorpay */}

              <label
                className={`mt-4 rounded-xl p-5 flex items-center gap-4 cursor-pointer border-2 ${
                  formData.paymentMethod ===
                  "RAZORPAY"
                    ? "border-black"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={
                    formData.paymentMethod ===
                    "RAZORPAY"
                  }
                  onChange={
                    handleChange
                  }
                />

                <CreditCard
                  size={22}
                />

                <div>
                  <p className="font-semibold">
                    Online Payment
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Pay securely
                    using Razorpay.
                  </p>
                </div>
              </label>
            </div>

            {/* Coupon */}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold">
                Coupon Code
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Optional. Backend
                will verify the
                coupon when you
                place the order.
              </p>

              <input
                type="text"
                name="couponCode"
                value={
                  formData.couponCode
                }
                onChange={
                  handleChange
                }
                placeholder="Enter coupon code"
                className="mt-5 w-full border border-gray-300 rounded-lg px-4 py-3 uppercase outline-none focus:border-black"
              />
            </div>
          </div>

          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-28">

              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">
                  Order Summary
                </h2>

                {isBuyNow && (
                  <span className="bg-black !text-white text-xs px-3 py-1.5 rounded-full">
                    BUY NOW
                  </span>
                )}
              </div>

              <div className="mt-6 space-y-5 max-h-[360px] overflow-y-auto pr-1">
                {items.map(
                  (item) => {
                    const product =
                      item.product;

                    if (!product) {
                      return null;
                    }

                    const finalPrice =
                      product.discountPrice &&
                      product.discountPrice >
                        0
                        ? product.discountPrice
                        : product.price;

                    return (
                      <div
                        key={
                          product._id
                        }
                        className="flex gap-4"
                      >
                        <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold">
                            {
                              product.name
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
                            {Number(
                              finalPrice
                            ) *
                              Number(
                                item.quantity
                              )}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="border-t border-gray-200 my-6" />

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span>
                    ₹{subtotal}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span>
                    {shippingCharge ===
                    0
                      ? "Free"
                      : `₹${shippingCharge}`}
                  </span>
                </div>

                {formData.couponCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Coupon
                    </span>

                    <span className="uppercase">
                      {
                        formData.couponCode
                      }
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 my-6" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  Estimated Total
                </span>

                <span className="text-2xl font-bold">
                  ₹
                  {
                    estimatedTotal
                  }
                </span>
              </div>

              {formData.couponCode && (
                <p className="text-xs text-gray-500 mt-2">
                  Final coupon
                  discount is
                  calculated by the
                  server.
                </p>
              )}

              <button
                type="submit"
                disabled={
                  loading
                }
                className="mt-7 w-full bg-black !text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading
                  ? formData.paymentMethod ===
                    "RAZORPAY"
                    ? "Starting Payment..."
                    : "Placing Order..."
                  : formData.paymentMethod ===
                    "RAZORPAY"
                  ? isBuyNow
                    ? "Pay & Buy Now"
                    : "Pay & Place Order"
                  : isBuyNow
                  ? "Place Buy Now Order"
                  : "Place Order"}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Truck
                  size={15}
                />

                Secure checkout
              </div>

              <Link
                to={
                  isBuyNow
                    ? "/shop"
                    : "/cart"
                }
                className="mt-5 block text-center text-sm hover:underline"
              >
                {isBuyNow
                  ? "← Continue Shopping"
                  : "← Back to Cart"}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;