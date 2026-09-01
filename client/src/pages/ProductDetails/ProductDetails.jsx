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
  const { id } =
    useParams();

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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500">
          Loading product...
        </p>
      </div>
    );
  }

  if (
    error ||
    !product
  ) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl font-bold">
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
    productImages.length >
    1;

  const showPreviousImage =
    selectedImageIndex > 0;

  const showNextImage =
    selectedImageIndex <
    productImages.length - 1;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb */}

        <div className="text-sm text-gray-500 mb-8">
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

          <span className="text-black">
            {product.name}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery */}

          <div>
            <div className="relative bg-neutral-100 rounded-2xl overflow-hidden min-h-[550px] flex items-center justify-center">
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
                    className="w-full h-[550px] object-cover"
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center"
                    >
                      <ChevronLeft
                        size={
                          28
                        }
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center"
                    >
                      <ChevronRight
                        size={
                          28
                        }
                      />
                    </button>
                  )}

                  {hasMultipleImages && (
                    <span className="absolute bottom-4 right-4 bg-black/75 !text-white text-sm px-3 py-1.5 rounded-full">
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

            {productImages.length >
              1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
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
                      className={`w-24 h-28 shrink-0 rounded-xl overflow-hidden border-2 transition ${
                        selectedImageIndex ===
                        index
                          ? "border-black"
                          : "border-transparent hover:border-gray-400"
                      }`}
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

          {/* Product Info */}

          <div className="lg:py-6">
            {product.category
              ?.name && (
              <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
                {
                  product
                    .category
                    .name
                }
              </p>
            )}

            <h1 className="text-4xl md:text-5xl font-bold mt-3">
              {product.name}
            </h1>

            {product.brand && (
              <p className="text-gray-500 mt-3">
                Brand:{" "}
                {product.brand}
              </p>
            )}

            {/* Price */}

            <div className="flex items-center gap-4 mt-6">
              <span className="text-3xl font-bold">
                ₹{finalPrice}
              </span>

              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ₹
                    {
                      product.price
                    }
                  </span>

                  <span className="bg-black !text-white text-xs px-3 py-1.5 rounded-full">
                    {discountPercent}%
                    OFF
                  </span>
                </>
              )}
            </div>

            <div className="mt-6">
              {product.stock >
              0 ? (
                <p className="text-green-700 font-medium">
                  In Stock (
                  {product.stock}{" "}
                  available)
                </p>
              ) : (
                <p className="text-red-600 font-medium">
                  Out of Stock
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 my-8" />

            <p className="text-gray-600 leading-8">
              {product.description ||
                "No description available for this product."}
            </p>

            {/* Quantity */}

            {product.stock >
              0 && (
              <div className="mt-8">
                <p className="font-semibold mb-3">
                  Quantity
                </p>

                <div className="inline-flex items-center border border-gray-300 rounded-lg">
                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    className="w-12 h-12 flex items-center justify-center disabled:opacity-30"
                  >
                    <Minus
                      size={18}
                    />
                  </button>

                  <span className="w-12 text-center font-medium">
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
                    className="w-12 h-12 flex items-center justify-center disabled:opacity-30"
                  >
                    <Plus
                      size={18}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}

            <div className="mt-8 grid sm:grid-cols-[1fr_1fr_56px] gap-3">
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
                className="bg-white text-black border border-black px-5 py-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-black hover:!text-white transition disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <ShoppingCart
                  size={20}
                />

                {addingToCart
                  ? "Adding..."
                  : "Add to Cart"}
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
                className="bg-black !text-white px-5 py-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Zap
                  size={20}
                />

                Buy Now
              </button>

              <button
                type="button"
                onClick={
                  handleWishlist
                }
                disabled={
                  wishlistLoading
                }
                className={`rounded-lg flex items-center justify-center transition ${
                  saved
                    ? "bg-black !text-white border border-black"
                    : "bg-white text-black border border-gray-300 hover:border-black"
                }`}
              >
                <Heart
                  size={22}
                  fill={
                    saved
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>

            {cartMessage && (
              <p className="mt-4 text-sm text-green-700">
                {cartMessage}
              </p>
            )}

            <div className="mt-10 border-t border-gray-200 pt-6 text-sm text-gray-600 space-y-3">
              {product.category
                ?.name && (
                <p>
                  <span className="font-semibold text-black">
                    Category:
                  </span>{" "}
                  {
                    product
                      .category.name
                  }
                </p>
              )}

              {product.slug && (
                <p>
                  <span className="font-semibold text-black">
                    Slug:
                  </span>{" "}
                  {product.slug}
                </p>
              )}

              <p>
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