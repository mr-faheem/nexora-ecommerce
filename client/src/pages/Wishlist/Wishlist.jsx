import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Heart,
  Trash2,
} from "lucide-react";

import useWishlist from "../../hooks/useWishlist";

function Wishlist() {
  const navigate =
    useNavigate();

  const {
    wishlist,
    loading,
    removeProduct,
    clearAll,
  } = useWishlist();

  const products =
    wishlist?.products || [];

  const handleRemove =
    async (productId) => {
      try {
        await removeProduct(
          productId
        );
      } catch (error) {
        console.error(
          "Remove Wishlist Error:",
          error
        );
      }
    };

  const handleClear =
    async () => {
      const confirmed =
        window.confirm(
          "Clear your entire wishlist?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await clearAll();
      } catch (error) {
        console.error(
          "Clear Wishlist Error:",
          error
        );
      }
    };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500">
          Loading wishlist...
        </p>
      </div>
    );
  }

  if (
    products.length === 0
  ) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <Heart size={48} />

        <h1 className="text-3xl font-bold mt-5">
          Your wishlist is empty
        </h1>

        <p className="text-gray-500 mt-3">
          Save products you like
          and come back to them
          later.
        </p>

          <Link
      to="/shop"
      className="mt-6 bg-black text-white! px-7 py-3 rounded-lg hover:bg-gray-800 transition"
    >
      Explore Products
    </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
            Nexora
          </p>

          <h1 className="text-4xl font-bold mt-2">
            My Wishlist
          </h1>

          <p className="text-gray-500 mt-2">
            {products.length} saved{" "}
            {products.length === 1
              ? "product"
              : "products"}
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleClear
          }
          className="border border-black px-5 py-2.5 rounded-lg hover:bg-black hover:text-white transition"
        >
          Clear Wishlist
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 mt-10">
        {products.map(
          (product) => {
            const finalPrice =
              product.discountPrice &&
              product.discountPrice >
                0
                ? product.discountPrice
                : product.price;

            const hasDiscount =
              product.discountPrice &&
              product.discountPrice >
                0 &&
              product.discountPrice <
                product.price;

            return (
              <div
                key={
                  product._id
                }
                className="group"
              >
                <div className="relative bg-neutral-100 aspect-[4/5] rounded-xl overflow-hidden">
                  <Link
                    to={`/products/${product._id}`}
                    className="block w-full h-full"
                  >
                    {product.images
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
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemove(
                        product._id
                      )
                    }
                    className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition"
                    title="Remove from wishlist"
                  >
                    <Trash2
                      size={19}
                    />
                  </button>
                </div>

                <div className="pt-4">
                  <Link
                    to={`/products/${product._id}`}
                    className="font-semibold text-lg hover:underline"
                  >
                    {
                      product.name
                    }
                  </Link>

                  {product.brand && (
                    <p className="text-sm text-gray-500 mt-1">
                      {
                        product.brand
                      }
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-semibold">
                      ₹
                      {
                        finalPrice
                      }
                    </span>

                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹
                        {
                          product.price
                        }
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/products/${product._id}`
                      )
                    }
                    className="mt-4 w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
                  >
                    View Product
                  </button>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

export default Wishlist;