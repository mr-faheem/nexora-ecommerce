import { Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
} from "lucide-react";

import useCart from "../../hooks/useCart";

function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const items = cart?.items || [];

  const handleIncrease = async (item) => {
    const product = item.product;

    if (!product) return;

    if (item.quantity >= product.stock) {
      return;
    }

    try {
      await updateQuantity(
        product._id,
        item.quantity + 1
      );
    } catch (error) {
      console.error(
        "Increase Cart Quantity Error:",
        error
      );
    }
  };

  const handleDecrease = async (item) => {
    const product = item.product;

    if (!product) return;

    if (item.quantity <= 1) {
      return;
    }

    try {
      await updateQuantity(
        product._id,
        item.quantity - 1
      );
    } catch (error) {
      console.error(
        "Decrease Cart Quantity Error:",
        error
      );
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId);
    } catch (error) {
      console.error(
        "Remove Cart Item Error:",
        error
      );
    }
  };

  const handleClearCart = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your cart?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await clearCart();
    } catch (error) {
      console.error(
        "Clear Cart Error:",
        error
      );
    }
  };

  const subtotal = items.reduce(
    (total, item) => {
      const product = item.product;

      if (!product) {
        return total;
      }

      const price =
        product.discountPrice &&
        product.discountPrice > 0
          ? product.discountPrice
          : product.price;

      return (
        total +
        price * item.quantity
      );
    },
    0
  );

  const shippingCharge =
    subtotal >= 999 || subtotal === 0
      ? 0
      : 99;

  const totalAmount =
    subtotal + shippingCharge;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500">
          Loading cart...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 text-center">
        <ShoppingBag
          size={70}
          strokeWidth={1.5}
        />

        <h1 className="text-3xl md:text-4xl font-bold mt-6">
          Your cart is empty
        </h1>

        <p className="text-gray-500 mt-3">
          Add products to your cart and
          they will appear here.
        </p>

        <Link
          to="/shop"
          className="mt-7 bg-black text-white! px-7 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
              Shopping Cart
            </p>

            <h1 className="text-4xl font-bold mt-3">
              Your Cart
            </h1>

            <p className="text-gray-500 mt-2">
              {items.length} product
              {items.length !== 1
                ? "s"
                : ""}{" "}
              in your cart
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearCart}
            className="text-sm text-red-600 hover:underline"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 mt-10">
          {/* Cart Items */}
          <div className="space-y-5">
            {items.map((item) => {
              const product =
                item.product;

              if (!product) {
                return null;
              }

              const finalPrice =
                product.discountPrice &&
                product.discountPrice > 0
                  ? product.discountPrice
                  : product.price;

              const itemTotal =
                finalPrice *
                item.quantity;

              return (
                <div
                  key={product._id}
                  className="border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-5"
                >
                  {/* Image */}
                  <Link
                    to={`/products/${product._id}`}
                    className="w-full sm:w-32 h-40 sm:h-36 bg-neutral-100 rounded-xl overflow-hidden shrink-0"
                  >
                    {product.images?.length >
                    0 ? (
                      <img
                        src={
                          product.images[0]
                            .url
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          to={`/products/${product._id}`}
                          className="text-xl font-semibold hover:underline"
                        >
                          {product.name}
                        </Link>

                        {product.brand && (
                          <p className="text-sm text-gray-500 mt-1">
                            {
                              product.brand
                            }
                          </p>
                        )}

                        <p className="font-semibold mt-3">
                          ₹{finalPrice}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(
                            product._id
                          )
                        }
                        className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
                        aria-label="Remove product"
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                      {/* Quantity */}
                      <div className="inline-flex items-center border border-gray-300 rounded-lg">
                        <button
                          type="button"
                          onClick={() =>
                            handleDecrease(
                              item
                            )
                          }
                          disabled={
                            item.quantity <=
                            1
                          }
                          className="w-10 h-10 flex items-center justify-center disabled:opacity-30"
                        >
                          <Minus
                            size={17}
                          />
                        </button>

                        <span className="w-10 text-center font-medium">
                          {
                            item.quantity
                          }
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleIncrease(
                              item
                            )
                          }
                          disabled={
                            item.quantity >=
                            product.stock
                          }
                          className="w-10 h-10 flex items-center justify-center disabled:opacity-30"
                        >
                          <Plus
                            size={17}
                          />
                        </button>
                      </div>

                      <p className="font-semibold text-lg">
                        ₹{itemTotal}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div>
            <div className="border border-gray-200 rounded-2xl p-6 sticky top-28">
              <h2 className="text-2xl font-bold">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium">
                    ₹{subtotal}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="font-medium">
                    {shippingCharge === 0
                      ? "Free"
                      : `₹${shippingCharge}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 my-6" />

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  ₹{totalAmount}
                </span>
              </div>

              {subtotal < 999 && (
                <p className="text-xs text-gray-500 mt-3">
                  Add ₹
                  {999 - subtotal} more
                  for free shipping.
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  navigate("/checkout")
                }
                className="mt-6 w-full bg-black text-white! py-4 rounded-lg font-medium hover:bg-gray-800 transition"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/shop"
                className="mt-3 w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center hover:border-black transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;