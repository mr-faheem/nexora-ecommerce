import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  SlidersHorizontal,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

import api from "../../api/axios";

import ProductCard from "../../components/cards/ProductCard";

function Shop() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const viewMode =
    searchParams.get(
      "view"
    ) || "";

  const isAllView =
    viewMode === "all";

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    groupedProducts,
    setGroupedProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(true);

  const [
    loadingGrouped,
    setLoadingGrouped,
  ] = useState(false);

  const [search, setSearch] =
    useState(
      searchParams.get(
        "search"
      ) || ""
    );

  const [
    category,
    setCategory,
  ] = useState(
    searchParams.get(
      "category"
    ) || ""
  );

  const [
    minPrice,
    setMinPrice,
  ] = useState(
    searchParams.get(
      "minPrice"
    ) || ""
  );

  const [
    maxPrice,
    setMaxPrice,
  ] = useState(
    searchParams.get(
      "maxPrice"
    ) || ""
  );

  const [sort, setSort] =
    useState(
      searchParams.get(
        "sort"
      ) || "newest"
    );

  const [page, setPage] =
    useState(
      Number(
        searchParams.get(
          "page"
        )
      ) || 1
    );

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    totalProducts,
    setTotalProducts,
  ] = useState(0);

  // ======================================================
  // CATEGORY ORDER
  // ======================================================

  const sortedCategories =
    useMemo(() => {
      const priority = {
        men: 1,
        women: 2,
        kids: 3,
      };

      return [
        ...categories,
      ].sort(
        (a, b) => {
          const aPriority =
            priority[
              a.slug?.toLowerCase()
            ] ?? 999;

          const bPriority =
            priority[
              b.slug?.toLowerCase()
            ] ?? 999;

          if (
            aPriority !==
            bPriority
          ) {
            return (
              aPriority -
              bPriority
            );
          }

          return (
            new Date(
              a.createdAt || 0
            ).getTime() -
            new Date(
              b.createdAt || 0
            ).getTime()
          );
        }
      );
    }, [categories]);

  // ======================================================
  // FETCH ACTIVE CATEGORIES
  // ======================================================

  useEffect(() => {
    const fetchCategories =
      async () => {
        try {
          setLoadingCategories(
            true
          );

          const response =
            await api.get(
              "/categories?active=true"
            );

          setCategories(
            response.data
              .categories || []
          );
        } catch (error) {
          console.error(
            "Shop Categories Error:",
            error
          );

          setCategories([]);
        } finally {
          setLoadingCategories(
            false
          );
        }
      };

    fetchCategories();
  }, []);

  // ======================================================
  // INVALID / INACTIVE CATEGORY RESET
  // ======================================================

  useEffect(() => {
    if (
      isAllView ||
      loadingCategories ||
      !category
    ) {
      return;
    }

    const stillActive =
      categories.some(
        (item) =>
          item.slug ===
          category
      );

    if (!stillActive) {
      setCategory("");
      setPage(1);
    }
  }, [
    categories,
    category,
    loadingCategories,
    isAllView,
  ]);

  // ======================================================
  // NORMAL SHOP PRODUCTS
  // ======================================================

  useEffect(() => {
    if (isAllView) {
      return;
    }

    const fetchProducts =
      async () => {
        try {
          setLoading(true);

          const params =
            new URLSearchParams();

          if (search) {
            params.set(
              "search",
              search
            );
          }

          if (category) {
            params.set(
              "category",
              category
            );
          }

          if (minPrice) {
            params.set(
              "minPrice",
              minPrice
            );
          }

          if (maxPrice) {
            params.set(
              "maxPrice",
              maxPrice
            );
          }

          if (sort) {
            params.set(
              "sort",
              sort
            );
          }

          params.set(
            "page",
            page
          );

          params.set(
            "limit",
            8
          );

          setSearchParams(
            params,
            {
              replace: true,
            }
          );

          const response =
            await api.get(
              `/products?${params.toString()}`
            );

          setProducts(
            response.data
              .products || []
          );

          setTotalPages(
            response.data
              .totalPages || 1
          );

          setTotalProducts(
            response.data
              .totalProducts || 0
          );
        } catch (error) {
          console.error(
            "Shop Products Error:",
            error
          );

          setProducts([]);
          setTotalProducts(0);
        } finally {
          setLoading(false);
        }
      };

    fetchProducts();
  }, [
    search,
    category,
    minPrice,
    maxPrice,
    sort,
    page,
    setSearchParams,
    isAllView,
  ]);

  // ======================================================
  // VIEW ALL PRODUCTS
  // Grouped by category
  // ======================================================

  useEffect(() => {
    if (
      !isAllView ||
      loadingCategories
    ) {
      return;
    }

    let cancelled = false;

    const fetchGroupedProducts =
      async () => {
        try {
          setLoadingGrouped(
            true
          );

          const results =
            await Promise.all(
              sortedCategories.map(
                async (
                  item
                ) => {
                  try {
                    const response =
                      await api.get(
                        `/products?category=${encodeURIComponent(
                          item.slug
                        )}&sort=newest&page=1&limit=1000`
                      );

                    return {
                      category:
                        item,
                      products:
                        response.data
                          .products ||
                        [],
                    };
                  } catch (
                    error
                  ) {
                    console.error(
                      `Products for ${item.name} Error:`,
                      error
                    );

                    return {
                      category:
                        item,
                      products: [],
                    };
                  }
                }
              )
            );

          if (cancelled) {
            return;
          }

          setGroupedProducts(
            results.filter(
              (group) =>
                group.products
                  .length > 0
            )
          );
        } finally {
          if (!cancelled) {
            setLoadingGrouped(
              false
            );
          }
        }
      };

    fetchGroupedProducts();

    return () => {
      cancelled = true;
    };
  }, [
    isAllView,
    loadingCategories,
    sortedCategories,
  ]);

  // ======================================================
  // RESET FILTERS
  // ======================================================

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  };

  const selectedCategory =
    sortedCategories.find(
      (item) =>
        item.slug ===
        category
    );

  // ======================================================
  // VIEW ALL MODE
  // ======================================================

  if (isAllView) {
    return (
      <div className="bg-white min-h-screen">
        {/* HEADER */}

        <section className="border-b bg-neutral-100">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-14">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
              Nexora Collection
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-3">
              All Products
            </h1>

            <p className="text-gray-600 mt-4 max-w-2xl leading-7">
              Explore the complete
              Nexora collection,
              organised by category
              for easier shopping.
            </p>
          </div>
        </section>

        {/* CATEGORY QUICK NAV */}

        {!loadingCategories &&
          sortedCategories.length >
            0 && (
            <section className="border-b bg-white sticky top-20 z-30">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3 overflow-x-auto">
                {sortedCategories.map(
                  (
                    item
                  ) => (
                    <a
                      key={
                        item._id
                      }
                      href={`#collection-${item.slug}`}
                      className="flex-shrink-0 border border-gray-300 rounded-full px-5 py-2 text-sm font-medium hover:bg-black hover:!text-white hover:border-black transition"
                    >
                      {
                        item.name
                      }
                    </a>
                  )
                )}
              </div>
            </section>
          )}

        {/* PRODUCTS */}

        <section className="max-w-7xl mx-auto px-6 py-14">
          {loadingCategories ||
          loadingGrouped ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <p className="text-gray-500">
                Loading complete
                collection...
              </p>
            </div>
          ) : groupedProducts
              .length ===
            0 ? (
            <div className="border rounded-2xl py-20 px-6 text-center">
              <h2 className="text-2xl font-bold">
                No products
                available
              </h2>

              <p className="text-gray-500 mt-3">
                Products will appear
                here when they are
                available.
              </p>
            </div>
          ) : (
            <div className="space-y-20">
              {groupedProducts.map(
                (
                  group
                ) => (
                  <section
                    key={
                      group
                        .category
                        ._id
                    }
                    id={`collection-${group.category.slug}`}
                    className="scroll-mt-40"
                  >
                    {/* CATEGORY HEADER */}

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 pb-5 border-b">
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
                          Collection
                        </p>

                        <h2 className="text-3xl md:text-4xl font-bold mt-2">
                          {
                            group
                              .category
                              .name
                          }
                        </h2>

                        {group
                          .category
                          .description && (
                          <p className="text-gray-500 mt-2 max-w-xl">
                            {
                              group
                                .category
                                .description
                            }
                          </p>
                        )}
                      </div>

                      <Link
                        to={`/shop?category=${group.category.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                      >
                        View{" "}
                        {
                          group
                            .category
                            .name
                        }

                        <ArrowRight
                          size={
                            17
                          }
                        />
                      </Link>
                    </div>

                    {/* CATEGORY PRODUCTS */}

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                      {group.products.map(
                        (
                          product
                        ) => (
                          <ProductCard
                            key={
                              product._id
                            }
                            product={
                              product
                            }
                          />
                        )
                      )}
                    </div>
                  </section>
                )
              )}
            </div>
          )}
        </section>
      </div>
    );
  }

  // ======================================================
  // NORMAL SHOP MODE
  // ======================================================

  return (
    <div className="bg-white min-h-screen">
      {/* SHOP HEADER */}

      <section className="border-b bg-neutral-100">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-14">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
            Nexora Collection
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            {selectedCategory
              ? selectedCategory.name
              : "Shop"}
          </h1>

          <p className="text-gray-600 mt-4 max-w-2xl leading-7">
            {selectedCategory
              ?.description ||
              "Explore modern fashion, everyday essentials and new arrivals from Nexora."}
          </p>
        </div>
      </section>

      {/* SHOP CONTENT */}

      <section className="max-w-7xl mx-auto px-6 py-10">
        {/* TOP BAR */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <p className="text-gray-600">
              <span className="font-semibold text-black">
                {totalProducts}
              </span>{" "}
              product
              {totalProducts !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

            {selectedCategory && (
              <p className="text-sm text-gray-500 mt-1">
                Showing{" "}
                {selectedCategory.name}{" "}
                collection
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500">
              Sort by
            </span>

            <select
              value={sort}
              onChange={(event) => {
                setSort(
                  event.target.value
                );

                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none min-w-[180px] focus:border-black"
            >
              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>
            </select>
          </div>
        </div>

        {/* FILTER + PRODUCTS GRID */}

        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center border rounded-2xl">
            <p className="text-gray-500">
              Loading products...
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              gap-x-7
              gap-y-10
              items-start
            "
          >
            {/* FILTER CARD */}

            <aside className="border border-gray-200 rounded-2xl p-5 md:p-6 bg-white h-fit">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal
                    size={19}
                  />

                  <h2 className="font-bold text-lg">
                    Filters
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="text-sm text-gray-500 hover:text-black flex items-center gap-1.5 transition"
                >
                  <RotateCcw
                    size={15}
                  />

                  Reset
                </button>
              </div>

              <div className="space-y-5 mt-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Search
                  </label>

                  <input
                    type="text"
                    value={search}
                    onChange={(
                      event
                    ) => {
                      setSearch(
                        event.target
                          .value
                      );

                      setPage(1);
                    }}
                    placeholder="Search products..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Category
                  </label>

                  <select
                    value={
                      category
                    }
                    disabled={
                      loadingCategories
                    }
                    onChange={(
                      event
                    ) => {
                      setCategory(
                        event.target
                          .value
                      );

                      setPage(1);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-black"
                  >
                    <option value="">
                      {loadingCategories
                        ? "Loading..."
                        : "All Categories"}
                    </option>

                    {sortedCategories.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item._id
                          }
                          value={
                            item.slug
                          }
                        >
                          {
                            item.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Min Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        minPrice
                      }
                      onChange={(
                        event
                      ) => {
                        setMinPrice(
                          event
                            .target
                            .value
                        );

                        setPage(1);
                      }}
                      placeholder="₹0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Max Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        maxPrice
                      }
                      onChange={(
                        event
                      ) => {
                        setMaxPrice(
                          event
                            .target
                            .value
                        );

                        setPage(1);
                      }}
                      placeholder="₹5000"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="w-full border border-black rounded-lg px-4 py-3 font-medium hover:bg-black hover:!text-white transition"
                >
                  Reset Filters
                </button>
              </div>
            </aside>

            {/* PRODUCTS */}

            {products.length ===
            0 ? (
              <div className="sm:col-span-1 lg:col-span-2 xl:col-span-3 min-h-[350px] border rounded-2xl flex items-center justify-center text-center px-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    No products found
                  </h2>

                  <p className="text-gray-500 mt-3">
                    Try changing your
                    search or filters.
                  </p>

                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="mt-6 bg-black !text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              products.map(
                (product) => (
                  <ProductCard
                    key={
                      product._id
                    }
                    product={
                      product
                    }
                  />
                )
              )
            )}
          </div>
        )}

        {/* PAGINATION */}

        {!loading &&
          products.length >
            0 &&
          totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-14">
              <button
                type="button"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage(
                    (
                      previous
                    ) =>
                      previous -
                      1
                  )
                }
                className="border border-gray-300 px-5 py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-black transition"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-sm">
                Page {page} of{" "}
                {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (
                      previous
                    ) =>
                      previous +
                      1
                  )
                }
                className="border border-gray-300 px-5 py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-black transition"
              >
                Next
              </button>
            </div>
          )}
      </section>
    </div>
  );
}

export default Shop;