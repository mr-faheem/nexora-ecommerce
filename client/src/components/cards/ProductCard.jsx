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
    <div className="group flex flex-col h-full">
      {/* ================================================= */}
      {/* PRODUCT IMAGE */}
      {/* ================================================= */}

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
              loading="lazy"
              className="w-full h-full object-cover transition duration-500 md:group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          )}
        </Link>

        {/* Discount Badge */}

        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 md:top-4 md:left-4 bg-black !text-white text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full z-10">
            {discountPercent}% OFF
          </span>
        )}

        {/* Out Of Stock */}

        {!inStock && (
          <span className="absolute bottom-3 left-3 bg-white text-red-600 text-[10px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-full shadow z-10">
            OUT OF STOCK
          </span>
        )}

        {/* Wishlist */}

        <button
          type="button"
          onClick={
            handleWishlist
          }
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 md:top-4 md:right-4 z-30
          w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11
          rounded-full shadow flex items-center justify-center transition ${
            saved
              ? "bg-black !text-white"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          <Heart
            className="w-[17px] h-[17px] sm:w-[19px] sm:h-[19px]"
            fill={
              saved
                ? "currentColor"
                : "none"
            }
          />
        </button>

        {/* Previous */}

        {showPrevious && (
          <button
            type="button"
            onClick={
              previousImage
            }
            aria-label="Previous image"
            className="hidden sm:flex absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/90 shadow items-center justify-center"
          >
            <ChevronLeft
              size={21}
            />
          </button>
        )}

        {/* Next */}

        {showNext && (
          <button
            type="button"
            onClick={
              nextImage
            }
            aria-label="Next image"
            className="hidden sm:flex absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/90 shadow items-center justify-center"
          >
            <ChevronRight
              size={21}
            />
          </button>
        )}

        {/* Counter */}

        {totalImages > 1 && (
          <span className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-10 bg-black/75 !text-white text-[10px] sm:text-xs px-2 py-1 rounded-full">
            {imageIndex + 1}/
            {totalImages}
          </span>
        )}
      </div>

      {/* ================================================= */}
      {/* PRODUCT INFORMATION */}
      {/* ================================================= */}

      <div className="pt-2.5 sm:pt-3 md:pt-3.5 flex flex-col flex-1">
        {/* Product Name */}

        <Link
          to={`/products/${product._id}`}
          title={product.name}
          className="
            font-semibold
            text-[14px]
            sm:text-[15px]
            md:text-[17px]
            lg:text-[18px]
            leading-[1.25]
            hover:underline
            min-h-[35px]
            sm:min-h-[38px]
            md:min-h-[43px]
            overflow-hidden
          "
          style={{
            display:
              "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient:
              "vertical",
          }}
        >
          {product.name}
        </Link>

        {/* Brand */}

        {product.brand && (
          <p
            className="
              text-[11px]
              sm:text-xs
              md:text-sm
              text-gray-500
              mt-1
              truncate
            "
            title={
              product.brand
            }
          >
            {product.brand}
          </p>
        )}

        {/* Price + Stock */}

        <div className="flex items-center justify-between gap-2 mt-1.5 sm:mt-2">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 min-w-0">
            <span className="font-semibold text-sm sm:text-[15px] md:text-base whitespace-nowrap">
              ₹{finalPrice}
            </span>

            {hasDiscount && (
              <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 line-through whitespace-nowrap">
                ₹{product.price}
              </span>
            )}
          </div>

          <span
            className={`text-[10px] sm:text-[11px] md:text-xs font-medium whitespace-nowrap ${
              inStock
                ? "text-green-700"
                : "text-red-600"
            }`}
          >
            {inStock
              ? `In Stock (${product.stock})`
              : "Out of Stock"}
          </span>
        </div>

        {/* Message */}

        {message && (
          <p className="text-[10px] sm:text-xs text-green-700 mt-1">
            {message}
          </p>
        )}

        {/* ================================================= */}
        {/* BUTTONS */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2.5 sm:mt-3">
          <button
            type="button"
            onClick={
              handleAddToCart
            }
            disabled={
              !inStock ||
              adding
            }
            className="
              border border-black
              rounded-lg
              min-h-[40px]
              sm:min-h-[42px]
              md:min-h-[44px]
              px-1.5
              sm:px-2
              md:px-3
              text-[11px]
              sm:text-xs
              md:text-sm
              font-medium
              flex
              items-center
              justify-center
              gap-1
              sm:gap-1.5
              hover:bg-black
              hover:!text-white
              transition
              disabled:border-gray-300
              disabled:text-gray-400
              disabled:cursor-not-allowed
            "
          >
            <ShoppingCart
              className="
                w-[13px]
                h-[13px]
                sm:w-[14px]
                sm:h-[14px]
                md:w-4
                md:h-4
                shrink-0
              "
            />

            <span className="truncate">
              {adding
                ? "Adding..."
                : "Add"}
            </span>
          </button>

          <button
            type="button"
            onClick={
              handleBuyNow
            }
            disabled={
              !inStock
            }
            className="
              bg-black
              !text-white
              rounded-lg
              min-h-[40px]
              sm:min-h-[42px]
              md:min-h-[44px]
              px-1.5
              sm:px-2
              md:px-3
              text-[11px]
              sm:text-xs
              md:text-sm
              font-medium
              flex
              items-center
              justify-center
              gap-1
              sm:gap-1.5
              hover:bg-gray-800
              transition
              disabled:bg-gray-300
              disabled:cursor-not-allowed
            "
          >
            <Zap
              className="
                w-[13px]
                h-[13px]
                sm:w-[14px]
                sm:h-[14px]
                md:w-4
                md:h-4
                shrink-0
              "
            />

            <span className="whitespace-nowrap">
              Buy Now
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;