import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

import api from "../../api/axios";

import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

function ProductDetails() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const {
    addToCart,
  } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const [
    product,
    setProduct,
  ] = useState(null);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    addingToCart,
    setAddingToCart,
  ] = useState(false);

  const [
    cartMessage,
    setCartMessage,
  ] = useState("");

  const [
    wishlistLoading,
    setWishlistLoading,
  ] = useState(false);

  // ======================================================
  // Product
  // ======================================================

  useEffect(() => {
    const fetchProduct =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              `/products/${id}`
            );

          setProduct(
            response.data
              .product
          );

          setSelectedImageIndex(
            0
          );

          setQuantity(1);
        } catch (error) {
          console.error(
            "Product Details Error:",
            error
          );

          setError(
            error.response?.data
              ?.message ||
              "Unable to load product."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchProduct();
  }, [id]);

  const increaseQuantity =
    () => {
      if (
        product &&
        quantity <
          product.stock
      ) {
        setQuantity(
          (previous) =>
            previous + 1
        );
      }
    };

  const decreaseQuantity =
    () => {
      if (quantity > 1) {
        setQuantity(
          (previous) =>
            previous - 1
        );
      }
    };

  const requireLogin =
    () => {
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
  // Add To Cart
  // ======================================================

  const handleAddToCart =
    async () => {
      if (
        !product ||
        product.stock <= 0 ||
        !requireLogin()
      ) {
        return;
      }

      try {
        setAddingToCart(
          true
        );

        setCartMessage("");

        await addToCart(
          product._id,
          quantity
        );

        setCartMessage(
          "Product added to cart successfully."
        );
      } catch (error) {
        console.error(
          "Add To Cart Error:",
          error
        );

        setCartMessage(
          error.response?.data
            ?.message ||
            "Unable to add product to cart."
        );
      } finally {
        setAddingToCart(
          false
        );
      }
    };

  // ======================================================
  // Buy Now
  // ======================================================

  const handleBuyNow = () => {
    if (
      !product ||
      product.stock <= 0 ||
      !requireLogin()
    ) {
      return;
    }

    sessionStorage.setItem(
      "nexoraBuyNow",
      JSON.stringify({
        productId:
          product._id,

        quantity,
      })
    );

    navigate(
      "/checkout?buyNow=1"
    );
  };

  // ======================================================
  // Wishlist
  // ======================================================

  const handleWishlist =
    async () => {
      if (
        !product ||
        !requireLogin()
      ) {
        return;
      }

      try {
        setWishlistLoading(
          true
        );

        await toggleWishlist(
          product._id
        );
      } catch (error) {
        console.error(
          "Wishlist Toggle Error:",
          error
        );
      } finally {
        setWishlistLoading(
          false
        );
      }
    };

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] px-4 sm:px-6 py-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-[4/5] md:aspect-[5/4] lg:aspect-auto lg:min-h-[560px] rounded-2xl bg-neutral-100 animate-pulse" />

          <div className="lg:py-6">
            <div className="h-4 w-28 bg-neutral-100 rounded animate-pulse" />

            <div className="h-12 w-3/4 bg-neutral-100 rounded mt-5 animate-pulse" />

            <div className="h-5 w-32 bg-neutral-100 rounded mt-4 animate-pulse" />

            <div className="h-10 w-40 bg-neutral-100 rounded mt-7 animate-pulse" />

            <div className="h-px bg-neutral-200 my-8" />

            <div className="space-y-3">
              <div className="h-4 bg-neutral-100 rounded animate-pulse" />
              <div className="h-4 bg-neutral-100 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-neutral-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    error ||
    !product
  ) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Product not found
        </h1>

        <p className="text-gray-500 mt-3">
          {error}
        </p>

        <Link
          to="/shop"
          className="mt-6 bg-black !text-white px-6 py-3 rounded-lg"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const saved =
    isInWishlist(
      product._id
    );

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

  const productImages =
    product.images || [];

  const hasMultipleImages =
    productImages.length > 1;

  const showPreviousImage =
    selectedImageIndex > 0;

  const showNextImage =
    selectedImageIndex <
    productImages.length - 1;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">

        {/* ================================================= */}
        {/* Breadcrumb */}
        {/* ================================================= */}

        <div className="text-[12px] sm:text-sm text-gray-500 mb-5 sm:mb-7 md:mb-8 flex items-center flex-wrap gap-y-1">
          <Link
            to="/"
            className="hover:text-black"
          >
            Home
          </Link>

          <span className="mx-2">
            /
          </span>

          <Link
            to="/shop"
            className="hover:text-black"
          >
            Shop
          </Link>

          <span className="mx-2">
            /
          </span>

          <span className="text-black max-w-[180px] sm:max-w-none truncate">
            {product.name}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-7 sm:gap-9 lg:gap-12 xl:gap-16">

          {/* ================================================= */}
          {/* Gallery */}
          {/* ================================================= */}

          <div>
            <div
              className="
                relative
                bg-neutral-100
                rounded-2xl
                md:rounded-3xl
                overflow-hidden
                aspect-[4/5]
                sm:aspect-[1/1]
                md:aspect-[5/4]
                lg:aspect-auto
                lg:min-h-[560px]
                flex
                items-center
                justify-center
              "
            >
              {productImages.length >
              0 ? (
                <>
                  <img
                    src={
                      productImages[
                        selectedImageIndex
                      ].url
                    }
                    alt={
                      product.name
                    }
                    className="
                      w-full
                      h-full
                      lg:h-[560px]
                      object-cover
                    "
                  />

                  {showPreviousImage && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(
                          (
                            current
                          ) =>
                            Math.max(
                              current -
                                1,
                              0
                            )
                        )
                      }
                      className="
                        absolute
                        left-3
                        sm:left-4
                        top-1/2
                        -translate-y-1/2
                        w-10
                        h-10
                        sm:w-12
                        sm:h-12
                        rounded-full
                        bg-white/95
                        shadow-md
                        flex
                        items-center
                        justify-center
                        hover:bg-white
                        transition
                      "
                    >
                      <ChevronLeft
                        size={24}
                      />
                    </button>
                  )}

                  {showNextImage && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(
                          (
                            current
                          ) =>
                            Math.min(
                              current +
                                1,
                              productImages.length -
                                1
                            )
                        )
                      }
                      className="
                        absolute
                        right-3
                        sm:right-4
                        top-1/2
                        -translate-y-1/2
                        w-10
                        h-10
                        sm:w-12
                        sm:h-12
                        rounded-full
                        bg-white/95
                        shadow-md
                        flex
                        items-center
                        justify-center
                        hover:bg-white
                        transition
                      "
                    >
                      <ChevronRight
                        size={24}
                      />
                    </button>
                  )}

                  {hasMultipleImages && (
                    <span className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/75 !text-white text-[11px] sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      {selectedImageIndex +
                        1}
                      /
                      {
                        productImages.length
                      }
                    </span>
                  )}
                </>
              ) : (
                <div className="text-gray-400">
                  No Image Available
                </div>
              )}
            </div>

            {/* Thumbnails */}

            {productImages.length >
              1 && (
              <div className="mt-3 sm:mt-4 flex gap-2.5 sm:gap-3 overflow-x-auto pb-2">
                {productImages.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      key={
                        image._id ||
                        image.publicId ||
                        index
                      }
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(
                          index
                        )
                      }
                      className={`
                        w-[72px]
                        h-[86px]
                        sm:w-20
                        sm:h-24
                        md:w-24
                        md:h-28
                        shrink-0
                        rounded-lg
                        sm:rounded-xl
                        overflow-hidden
                        border-2
                        transition
                        ${
                          selectedImageIndex ===
                          index
                            ? "border-black"
                            : "border-transparent hover:border-gray-400"
                        }
                      `}
                    >
                      <img
                        src={
                          image.url
                        }
                        alt={`${product.name} ${
                          index + 1
                        }`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* Product Info */}
          {/* ================================================= */}

          <div className="lg:py-3 xl:py-6">

            {product.category
              ?.name && (
              <p className="text-[11px] sm:text-sm uppercase tracking-[0.22em] sm:tracking-[0.25em] text-gray-500">
                {
                  product.category
                    .name
                }
              </p>
            )}

            <h1
              className="
                text-[30px]
                sm:text-4xl
                md:text-5xl
                font-bold
                mt-2
                sm:mt-3
                leading-[1.08]
                break-words
              "
            >
              {product.name}
            </h1>

            {product.brand && (
              <p className="text-gray-500 mt-2 sm:mt-3 text-sm sm:text-base">
                Brand:{" "}
                <span className="text-gray-700">
                  {product.brand}
                </span>
              </p>
            )}

            {/* Price + Stock */}

            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center flex-wrap gap-2.5 sm:gap-4">
                <span className="text-2xl sm:text-3xl font-bold">
                  ₹{finalPrice}
                </span>

                {hasDiscount && (
                  <>
                    <span className="text-base sm:text-xl text-gray-400 line-through">
                      ₹
                      {
                        product.price
                      }
                    </span>

                    <span className="bg-black !text-white text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      {discountPercent}%
                      OFF
                    </span>
                  </>
                )}
              </div>

              <div>
                {product.stock >
                0 ? (
                  <p className="text-green-700 text-sm font-medium">
                    In Stock (
                    {product.stock})
                  </p>
                ) : (
                  <p className="text-red-600 text-sm font-medium">
                    Out of Stock
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 my-6 sm:my-8" />

            {/* Description */}

            <p className="text-gray-600 leading-7 sm:leading-8 text-sm sm:text-base">
              {product.description ||
                "No description available for this product."}
            </p>

            {/* Quantity */}

            {product.stock >
              0 && (
              <div className="mt-6 sm:mt-8">
                <p className="font-semibold mb-3 text-sm sm:text-base">
                  Quantity
                </p>

                <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center disabled:opacity-30 hover:bg-neutral-100 transition"
                  >
                    <Minus
                      size={17}
                    />
                  </button>

                  <span className="w-11 sm:w-12 text-center font-medium">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                      product.stock
                    }
                    className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center disabled:opacity-30 hover:bg-neutral-100 transition"
                  >
                    <Plus
                      size={17}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* Buttons */}
            {/* ================================================= */}

            <div
              className="
                mt-6
                sm:mt-8
                grid
                grid-cols-[1fr_1fr_52px]
                sm:grid-cols-[1fr_1fr_56px]
                gap-2
                sm:gap-3
              "
            >
              <button
                type="button"
                onClick={
                  handleAddToCart
                }
                disabled={
                  product.stock <=
                    0 ||
                  addingToCart
                }
                className="
                  bg-white
                  text-black
                  border
                  border-black
                  px-2
                  sm:px-5
                  py-3
                  sm:py-4
                  rounded-lg
                  text-[12px]
                  sm:text-base
                  font-medium
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  sm:gap-2
                  hover:bg-black
                  hover:!text-white
                  transition
                  disabled:border-gray-300
                  disabled:text-gray-400
                  disabled:cursor-not-allowed
                "
              >
                <ShoppingCart
                  size={17}
                  className="shrink-0"
                />

                <span className="whitespace-nowrap">
                  {addingToCart
                    ? "Adding..."
                    : "Add to Cart"}
                </span>
              </button>

              <button
                type="button"
                onClick={
                  handleBuyNow
                }
                disabled={
                  product.stock <=
                  0
                }
                className="
                  bg-black
                  !text-white
                  px-2
                  sm:px-5
                  py-3
                  sm:py-4
                  rounded-lg
                  text-[12px]
                  sm:text-base
                  font-medium
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  sm:gap-2
                  hover:bg-gray-800
                  transition
                  disabled:bg-gray-300
                  disabled:cursor-not-allowed
                "
              >
                <Zap
                  size={17}
                  className="shrink-0"
                />

                <span className="whitespace-nowrap">
                  Buy Now
                </span>
              </button>

              <button
                type="button"
                onClick={
                  handleWishlist
                }
                disabled={
                  wishlistLoading
                }
                aria-label="Toggle wishlist"
                className={`
                  rounded-lg
                  min-h-[48px]
                  sm:min-h-[56px]
                  flex
                  items-center
                  justify-center
                  transition
                  ${
                    saved
                      ? "bg-black !text-white border border-black"
                      : "bg-white text-black border border-gray-300 hover:border-black"
                  }
                `}
              >
                <Heart
                  size={21}
                  fill={
                    saved
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>

            {cartMessage && (
              <p className="mt-3 sm:mt-4 text-sm text-green-700">
                {cartMessage}
              </p>
            )}

            {/* ================================================= */}
            {/* Extra Product Information */}
            {/* ================================================= */}

            <div className="mt-8 sm:mt-10 border-t border-gray-200 pt-5 sm:pt-6 text-xs sm:text-sm text-gray-600 space-y-2.5 sm:space-y-3">
              {product.category
                ?.name && (
                <p>
                  <span className="font-semibold text-black">
                    Category:
                  </span>{" "}
                  {
                    product.category
                      .name
                  }
                </p>
              )}

              {product.slug && (
                <p className="break-all">
                  <span className="font-semibold text-black">
                    Slug:
                  </span>{" "}
                  {product.slug}
                </p>
              )}

              <p className="break-all">
                <span className="font-semibold text-black">
                  Product ID:
                </span>{" "}
                {product._id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;