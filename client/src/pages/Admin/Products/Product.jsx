import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Pencil,
  Trash2,
  Plus,
  Search,
  RefreshCw,
} from "lucide-react";

import {
  getAdminProducts,
  deleteProduct,
} from "../../../services/productService";

function Product() {
  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("all");

  // ======================================================
  // FETCH ADMIN PRODUCTS
  // Active + Inactive
  // ======================================================

  const fetchProducts =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminProducts({
            page: 1,
            limit: 100,
            search:
              search.trim(),
            status,
          });

        setProducts(
          data.products || []
        );
      } catch (error) {
        console.error(
          "Fetch Admin Products Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    };

  // ======================================================
  // INITIAL / FILTER FETCH
  // ======================================================

  useEffect(() => {
    const timer =
      setTimeout(() => {
        fetchProducts();
      }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [
    search,
    status,
  ]);

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete =
    async (
      productId
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to permanently delete this product?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setMessage("");

        const data =
          await deleteProduct(
            productId
          );

        setMessage(
          data.message ||
            "Product deleted successfully."
        );

        setProducts(
          (
            currentProducts
          ) =>
            currentProducts.filter(
              (
                product
              ) =>
                product._id !==
                productId
            )
        );
      } catch (error) {
        console.error(
          "Delete Product Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Unable to delete product."
        );
      }
    };

  return (
    <div className="p-8">
      <div className="max-w-7xl">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
              Store Management
            </p>

            <h1 className="text-4xl font-bold mt-3">
              Products
            </h1>

            <p className="text-gray-600 mt-3">
              Manage active,
              inactive and future
              products in the
              Nexora store.
            </p>
          </div>

          <Link
            to="/admin/products/add"
            className="bg-black px-5 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition shrink-0"
            style={{
              color:
                "#ffffff",
            }}
          >
            <Plus
              size={18}
            />

            <span>
              Add Product
            </span>
          </Link>
        </div>

        {/* ================================================= */}
        {/* MESSAGES */}
        {/* ================================================= */}

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

        {/* ================================================= */}
        {/* FILTER BAR */}
        {/* ================================================= */}

        <div className="mt-8 bg-white border rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search */}

          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search products..."
              className="w-full border rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* All */}

            <button
              type="button"
              onClick={() =>
                setStatus(
                  "all"
                )
              }
              className={`px-5 py-2.5 rounded-lg border transition ${
                status ===
                "all"
                  ? "bg-black !text-white border-black"
                  : "bg-white text-black hover:border-black"
              }`}
            >
              All
            </button>

            {/* Active */}

            <button
              type="button"
              onClick={() =>
                setStatus(
                  "active"
                )
              }
              className={`px-5 py-2.5 rounded-lg border transition ${
                status ===
                "active"
                  ? "bg-black !text-white border-black"
                  : "bg-white text-black hover:border-black"
              }`}
            >
              Active
            </button>

            {/* Inactive */}

            <button
              type="button"
              onClick={() =>
                setStatus(
                  "inactive"
                )
              }
              className={`px-5 py-2.5 rounded-lg border transition ${
                status ===
                "inactive"
                  ? "bg-black !text-white border-black"
                  : "bg-white text-black hover:border-black"
              }`}
            >
              Inactive
            </button>

            <button
              type="button"
              onClick={
                fetchProducts
              }
              className="w-11 h-11 border rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
              title="Refresh products"
            >
              <RefreshCw
                size={18}
              />
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* PRODUCT TABLE */}
        {/* ================================================= */}

        <div className="mt-5 bg-white border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-gray-500">
              Loading products...
            </div>
          ) : products.length ===
            0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold text-lg">
                No products found
              </p>

              <p className="text-gray-500 mt-2">
                Try changing the
                search or status
                filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-5 py-4">
                      Product
                    </th>

                    <th className="px-5 py-4">
                      Category
                    </th>

                    <th className="px-5 py-4">
                      Price
                    </th>

                    <th className="px-5 py-4">
                      Stock
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {products.map(
                    (
                      product
                    ) => {
                      const finalPrice =
                        product.discountPrice &&
                        product.discountPrice >
                          0
                          ? product.discountPrice
                          : product.price;

                      return (
                        <tr
                          key={
                            product._id
                          }
                          className={`transition ${
                            product.isActive
                              ? "hover:bg-gray-50"
                              : "bg-gray-50/70 hover:bg-gray-100"
                          }`}
                        >
                          {/* Product */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
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
                                  <span className="text-xs text-gray-400">
                                    No Image
                                  </span>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">
                                    {
                                      product.name
                                    }
                                  </p>

                                  {!product.isActive && (
                                    <span className="text-[10px] uppercase tracking-wide bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                      Hidden
                                    </span>
                                  )}
                                </div>

                                <p className="text-sm text-gray-500 mt-1">
                                  {product.brand ||
                                    "No brand"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}

                          <td className="px-5 py-4">
                            {product
                              .category
                              ?.name ||
                              "-"}
                          </td>

                          {/* Price */}

                          <td className="px-5 py-4">
                            <div>
                              <span className="font-semibold">
                                ₹
                                {
                                  finalPrice
                                }
                              </span>

                              {product.discountPrice >
                                0 &&
                                product.discountPrice <
                                  product.price && (
                                  <span className="ml-2 text-sm text-gray-400 line-through">
                                    ₹
                                    {
                                      product.price
                                    }
                                  </span>
                                )}
                            </div>
                          </td>

                          {/* Stock */}

                          <td className="px-5 py-4">
                            {
                              product.stock
                            }
                          </td>

                          {/* Status */}

                          <td className="px-5 py-4">
                            <span
                              className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                                product.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {product.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          {/* Actions */}

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <Link
                                to={`/admin/products/${product._id}/edit`}
                                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                                title="Edit product"
                              >
                                <Pencil
                                  size={17}
                                />
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    product._id
                                  )
                                }
                                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                title="Delete product permanently"
                              >
                                <Trash2
                                  size={17}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Product;