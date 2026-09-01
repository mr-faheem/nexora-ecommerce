import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Heart,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Zap,
} from "lucide-react";

import useWishlist from "../../hooks/useWishlist";
import useCart from "../../hooks/useCart";

function ProductCard({
  product,
}) {
  const navigate =
    useNavigate();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const {
    addToCart,
  } = useCart();

  const saved =
    isInWishlist(
      product._id
    );

  const [
    imageIndex,
    setImageIndex,
  ] = useState(0);

  const [
    adding,
    setAdding,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const images =
    product.images || [];

  const totalImages =
    images.length;

  const finalPrice =
    product.discountPrice &&
    product.discountPrice > 0
      ? product.discountPrice
      : product.price;

  const hasDiscount =
    product.discountPrice &&
    product.discountPrice > 0 &&
    product.discountPrice <
      product.price;

  const discountPercent =
    hasDiscount
      ? Math.round(
          ((product.price -
            product.discountPrice) /
            product.price) *
            100
        )
      : 0;

  const inStock =
    Number(
      product.stock || 0
    ) > 0;

  const showPrevious =
    totalImages > 1 &&
    imageIndex > 0;

  const showNext =
    totalImages > 1 &&
    imageIndex <
      totalImages - 1;

  const previousImage = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setImageIndex(
      (current) =>
        Math.max(
          current - 1,
          0
        )
    );
  };

  const nextImage = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setImageIndex(
      (current) =>
        Math.min(
          current + 1,
          totalImages - 1
        )
    );
  };

  const requireLogin = () => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      navigate("/login");

      return false;
    }

    return true;
  };

  // ======================================================
  // Wishlist
  // ======================================================

  const handleWishlist =
    async (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!requireLogin()) {
        return;
      }

      try {
        await toggleWishlist(
          product._id
        );
      } catch (error) {
        console.error(
          "Wishlist Toggle Error:",
          error
        );
      }
    };

  // ======================================================
  // Add To Cart
  // ======================================================

  const handleAddToCart =
    async () => {
      if (
        !requireLogin() ||
        !inStock
      ) {
        return;
      }

      try {
        setAdding(true);
        setMessage("");

        await addToCart(
          product._id,
          1
        );

        setMessage(
          "Added to cart"
        );

        setTimeout(() => {
          setMessage("");
        }, 1800);
      } catch (error) {
        console.error(
          "Add To Cart Error:",
          error
        );

        setMessage(
          error.response?.data
            ?.message ||
            "Unable to add"
        );
      } finally {
        setAdding(false);
      }
    };

  // ======================================================
  // Buy Now
  // ======================================================

  const handleBuyNow = () => {
    if (
      !requireLogin() ||
      !inStock
    ) {
      return;
    }

    sessionStorage.setItem(
      "nexoraBuyNow",
      JSON.stringify({
        productId:
          product._id,

        quantity: 1,
      })
    );

    navigate(
      "/checkout?buyNow=1"
    );
  };

  return (
    <div className="group flex flex-col">
      {/* Image */}

      <div className="relative bg-neutral-100 rounded-xl overflow-hidden aspect-[4/5]">
        <Link
          to={`/products/${product._id}`}
          className="block w-full h-full"
        >
          {totalImages > 0 ? (
            <img
              src={
                images[
                  imageIndex
                ].url
              }
              alt={
                product.name
              }
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </Link>

        {/* Discount */}

        {hasDiscount && (
          <span className="absolute top-4 left-4 bg-black !text-white text-xs px-3 py-1.5 rounded-full z-10">
            {discountPercent}% OFF
          </span>
        )}

        {!inStock && (
          <span className="absolute bottom-4 left-4 bg-white text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow z-10">
            OUT OF STOCK
          </span>
        )}

        {/* Wishlist */}

        <button
          type="button"
          onClick={
            handleWishlist
          }
          className={`absolute top-4 right-4 z-30 w-11 h-11 rounded-full shadow flex items-center justify-center transition ${
            saved
              ? "bg-black !text-white"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          <Heart
            size={20}
            fill={
              saved
                ? "currentColor"
                : "none"
            }
          />
        </button>

        {showPrevious && (
          <button
            type="button"
            onClick={
              previousImage
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center"
          >
            <ChevronLeft
              size={23}
            />
          </button>
        )}

        {showNext && (
          <button
            type="button"
            onClick={
              nextImage
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center"
          >
            <ChevronRight
              size={23}
            />
          </button>
        )}

        {totalImages > 1 && (
          <span className="absolute bottom-3 right-3 z-10 bg-black/75 !text-white text-xs px-2.5 py-1 rounded-full">
            {imageIndex + 1}/
            {totalImages}
          </span>
        )}
      </div>

      {/* Info */}

      <div className="pt-4 flex flex-col flex-1">
        <Link
          to={`/products/${product._id}`}
          className="font-semibold text-lg hover:underline"
        >
          {product.name}
        </Link>

        {product.brand && (
          <p className="text-sm text-gray-500 mt-1">
            {product.brand}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <span className="font-semibold">
            ₹{finalPrice}
          </span>

          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.price}
            </span>
          )}
        </div>

        <p
          className={`text-xs font-medium mt-2 ${
            inStock
              ? "text-green-700"
              : "text-red-600"
          }`}
        >
          {inStock
            ? `In Stock (${product.stock})`
            : "Out of Stock"}
        </p>

        {message && (
          <p className="text-xs text-green-700 mt-2">
            {message}
          </p>
        )}

        {/* Buttons */}

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={
              handleAddToCart
            }
            disabled={
              !inStock ||
              adding
            }
            className="border border-black rounded-lg px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-black hover:!text-white transition disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <ShoppingCart
              size={16}
            />

            {adding
              ? "Adding..."
              : "Add"}
          </button>

          <button
            type="button"
            onClick={
              handleBuyNow
            }
            disabled={
              !inStock
            }
            className="bg-black !text-white rounded-lg px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Zap
              size={16}
            />

            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;