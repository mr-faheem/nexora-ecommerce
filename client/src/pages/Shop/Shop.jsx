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
  X,
} from "lucide-react";

import api, {
  cachedGet,
} from "../../api/axios";

import ProductCard from "../../components/cards/ProductCard";

function Shop() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const viewMode =
    searchParams.get("view") || "";

  const isAllView =
    viewMode === "all";

  // ======================================================
  // DATA
  // ======================================================

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

  // ======================================================
  // LOADING
  // ======================================================

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

  // ======================================================
  // MOBILE FILTER
  // ======================================================

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false);

  // ======================================================
  // SEARCH
  // searchInput = user jo type kar raha hai
  // search = API ko jo value send hogi
  // ======================================================

  const [
    searchInput,
    setSearchInput,
  ] = useState(
    searchParams.get("search") || ""
  );

  const [
    search,
    setSearch,
  ] = useState(
    searchParams.get("search") || ""
  );

  // ======================================================
  // FILTERS
  // ======================================================

  const [
    category,
    setCategory,
  ] = useState(
    searchParams.get("category") || ""
  );

  const [
    minPrice,
    setMinPrice,
  ] = useState(
    searchParams.get("minPrice") || ""
  );

  const [
    maxPrice,
    setMaxPrice,
  ] = useState(
    searchParams.get("maxPrice") || ""
  );

  const [
    sort,
    setSort,
  ] = useState(
    searchParams.get("sort") ||
      "newest"
  );

  const [
    page,
    setPage,
  ] = useState(
    Number(
      searchParams.get("page")
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
  // SEARCH DEBOUNCE
  // 400ms rukne ke baad hi API request
  // ======================================================

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setSearch(
          searchInput.trim()
        );

        setPage(1);
      }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  // ======================================================
  // MOBILE DRAWER BODY LOCK
  // ======================================================

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return;
    }

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, [mobileFiltersOpen]);

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
      ].sort((a, b) => {
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
      });
    }, [categories]);

  // ======================================================
  // FETCH ACTIVE CATEGORIES
  // Cached for faster page switching
  // ======================================================

  useEffect(() => {
    const controller =
      new AbortController();

    const fetchCategories =
      async () => {
        try {
          setLoadingCategories(
            true
          );

          const response =
            await cachedGet(
              "/categories?active=true",
              {
                signal:
                  controller.signal,
              }
            );

          setCategories(
            response.data
              .categories || []
          );
        } catch (error) {
          if (
            error.name ===
              "CanceledError" ||
            error.code ===
              "ERR_CANCELED"
          ) {
            return;
          }

          console.error(
            "Shop Categories Error:",
            error
          );

          setCategories([]);
        } finally {
          if (
            !controller.signal
              .aborted
          ) {
            setLoadingCategories(
              false
            );
          }
        }
      };

    fetchCategories();

    return () => {
      controller.abort();
    };
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
          item.slug === category
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
  // Debounced + cached + cancel old request
  // ======================================================

  useEffect(() => {
    if (isAllView) {
      return;
    }

    const controller =
      new AbortController();

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
            await cachedGet(
              `/products?${params.toString()}`,
              {
                signal:
                  controller.signal,
              }
            );

          if (
            controller.signal.aborted
          ) {
            return;
          }

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
          if (
            error.name ===
              "CanceledError" ||
            error.code ===
              "ERR_CANCELED"
          ) {
            return;
          }

          console.error(
            "Shop Products Error:",
            error
          );

          setProducts([]);
          setTotalProducts(0);
        } finally {
          if (
            !controller.signal
              .aborted
          ) {
            setLoading(false);
          }
        }
      };

    fetchProducts();

    return () => {
      controller.abort();
    };
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
  // GROUPED BY CATEGORY
  // ======================================================

  useEffect(() => {
    if (
      !isAllView ||
      loadingCategories
    ) {
      return;
    }

    const controller =
      new AbortController();

    const fetchGroupedProducts =
      async () => {
        try {
          setLoadingGrouped(true);

          const results =
            await Promise.all(
              sortedCategories.map(
                async (item) => {
                  try {
                    const response =
                      await cachedGet(
                        `/products?category=${encodeURIComponent(
                          item.slug
                        )}&sort=newest&page=1&limit=1000`,
                        {
                          signal:
                            controller
                              .signal,
                        }
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
                    if (
                      error.name ===
                        "CanceledError" ||
                      error.code ===
                        "ERR_CANCELED"
                    ) {
                      return {
                        category:
                          item,

                        products: [],
                      };
                    }

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

          if (
            controller.signal.aborted
          ) {
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
          if (
            !controller.signal
              .aborted
          ) {
            setLoadingGrouped(
              false
            );
          }
        }
      };

    fetchGroupedProducts();

    return () => {
      controller.abort();
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
    setSearchInput("");
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
        item.slug === category
    );

  // ======================================================
  // PRODUCT SKELETON
  // ======================================================

  const ProductSkeleton = () => {
    return (
      <div className="animate-pulse">
        <div className="aspect-[4/5] bg-neutral-100 rounded-xl" />

        <div className="pt-3">
          <div className="h-4 bg-neutral-100 rounded w-[88%]" />

          <div className="h-4 bg-neutral-100 rounded w-[65%] mt-2" />

          <div className="h-3 bg-neutral-100 rounded w-[40%] mt-2" />

          <div className="flex items-center justify-between mt-3">
            <div className="h-4 bg-neutral-100 rounded w-14" />

            <div className="h-3 bg-neutral-100 rounded w-16" />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="h-10 bg-neutral-100 rounded-lg" />

            <div className="h-10 bg-neutral-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  };

  // ======================================================
  // FILTER CONTENT
  // ======================================================

  const FilterContent = ({
    mobile = false,
  }) => {
    return (
      <>
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={19}
            />

            <h2 className="font-bold text-lg">
              Filters
            </h2>
          </div>

          <div className="flex items-center gap-3">
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

            {mobile && (
              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(
                    false
                  )
                }
                className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-5 mt-5">

          {/* SEARCH */}

          <div>
            <label className="block text-sm font-semibold mb-2">
              Search
            </label>

            <input
              type="text"
              value={
                searchInput
              }
              onChange={(
                event
              ) => {
                setSearchInput(
                  event.target.value
                );
              }}
              placeholder="Search products..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition"
            />
          </div>

          {/* CATEGORY */}

          <div>
            <label className="block text-sm font-semibold mb-2">
              Category
            </label>

            <select
              value={category}
              disabled={
                loadingCategories
              }
              onChange={(
                event
              ) => {
                setCategory(
                  event.target.value
                );

                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:border-black transition"
            >
              <option value="">
                {loadingCategories
                  ? "Loading..."
                  : "All Categories"}
              </option>

              {sortedCategories.map(
                (item) => (
                  <option
                    key={
                      item._id
                    }
                    value={
                      item.slug
                    }
                  >
                    {item.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* PRICE */}

          <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
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
                    event.target
                      .value
                  );

                  setPage(1);
                }}
                placeholder="₹0"
                className="w-full min-w-0 border border-gray-300 rounded-xl px-3.5 py-3 outline-none focus:border-black transition"
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
                    event.target
                      .value
                  );

                  setPage(1);
                }}
                placeholder="₹5000"
                className="w-full min-w-0 border border-gray-300 rounded-xl px-3.5 py-3 outline-none focus:border-black transition"
              />
            </div>
          </div>

          {mobile ? (
            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(
                  false
                )
              }
              className="w-full bg-black !text-white rounded-xl px-4 py-3.5 font-medium hover:bg-gray-800 transition"
            >
              View {totalProducts}{" "}
              Product
              {totalProducts !== 1
                ? "s"
                : ""}
            </button>
          ) : (
            <button
              type="button"
              onClick={
                resetFilters
              }
              className="w-full border border-black rounded-xl px-4 py-3 font-medium hover:bg-black hover:!text-white transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      </>
    );
  };

  // ======================================================
  // VIEW ALL MODE
  // ======================================================

  if (isAllView) {
    return (
      <div className="bg-white min-h-screen">

        {/* HEADER */}

        <section className="border-b bg-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gray-500">
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
            <section className="border-b bg-white sticky top-[68px] md:top-20 z-30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3 overflow-x-auto">
                {sortedCategories.map(
                  (item) => (
                    <a
                      key={
                        item._id
                      }
                      href={`#collection-${item.slug}`}
                      className="flex-shrink-0 border border-gray-300 rounded-full px-4 md:px-5 py-2 text-sm font-medium hover:bg-black hover:!text-white hover:border-black transition"
                    >
                      {item.name}
                    </a>
                  )
                )}
              </div>
            </section>
          )}

        {/* PRODUCTS */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          {loadingCategories ||
          loadingGrouped ? (
            <div className="space-y-14">
              {[1, 2].map(
                (section) => (
                  <div
                    key={
                      section
                    }
                  >
                    <div className="animate-pulse">
                      <div className="h-4 bg-neutral-100 rounded w-24" />

                      <div className="h-8 bg-neutral-100 rounded w-40 mt-3" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-5 lg:gap-x-6 gap-y-8 mt-7">
                      {[1, 2, 3, 4].map(
                        (
                          item
                        ) => (
                          <ProductSkeleton
                            key={
                              item
                            }
                          />
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : groupedProducts.length ===
            0 ? (
            <div className="border rounded-2xl py-20 px-6 text-center">
              <h2 className="text-2xl font-bold">
                No products available
              </h2>

              <p className="text-gray-500 mt-3">
                Products will appear
                here when they are
                available.
              </p>
            </div>
          ) : (
            <div className="space-y-14 md:space-y-20">
              {groupedProducts.map(
                (group) => (
                  <section
                    key={
                      group.category
                        ._id
                    }
                    id={`collection-${group.category.slug}`}
                    className="scroll-mt-32 md:scroll-mt-40"
                  >
                    {/* CATEGORY HEADER */}

                    <div className="flex items-end justify-between gap-4 mb-6 md:mb-8 pb-4 md:pb-5 border-b">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500">
                          Collection
                        </p>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2">
                          {
                            group
                              .category
                              .name
                          }
                        </h2>

                        {group
                          .category
                          .description && (
                          <p className="hidden sm:block text-gray-500 mt-2 max-w-xl">
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
                        className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-2.5 transition-all"
                      >
                        View

                        <span className="hidden sm:inline">
                          {" "}
                          {
                            group
                              .category
                              .name
                          }
                        </span>

                        <ArrowRight
                          size={17}
                        />
                      </Link>
                    </div>

                    {/* PRODUCTS */}

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-5 lg:gap-x-6 gap-y-8 md:gap-y-10">
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

      {/* ================================================= */}
      {/* SHOP HEADER */}
      {/* ================================================= */}

      <section className="border-b bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-9 sm:py-11 md:py-14">
          <p className="text-[11px] sm:text-sm uppercase tracking-[0.3em] text-gray-500">
            Nexora Collection
          </p>

          <h1 className="text-[38px] sm:text-4xl md:text-5xl font-bold mt-2 sm:mt-3 leading-tight">
            {selectedCategory
              ? selectedCategory.name
              : "Shop"}
          </h1>

          <p className="text-gray-600 mt-3 sm:mt-4 max-w-2xl text-[15px] sm:text-base leading-6 sm:leading-7">
            {selectedCategory
              ?.description ||
              "Explore modern fashion, everyday essentials and new arrivals from Nexora."}
          </p>
        </div>
      </section>

      {/* ================================================= */}
      {/* SHOP CONTENT */}
      {/* ================================================= */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">

        {/* ================================================= */}
        {/* MOBILE TOP BAR */}
        {/* ================================================= */}

        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm sm:text-base text-gray-600 whitespace-nowrap">
              <span className="font-semibold text-black">
                {loading
                  ? "..."
                  : totalProducts}
              </span>{" "}
              product
              {!loading &&
              totalProducts !== 1
                ? "s"
                : ""}
            </p>

            <select
              value={sort}
              onChange={(
                event
              ) => {
                setSort(
                  event.target.value
                );

                setPage(1);
              }}
              className="min-w-0 max-w-[150px] border border-gray-300 rounded-xl px-3 py-2.5 bg-white outline-none text-sm focus:border-black"
            >
              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price: Low
              </option>

              <option value="price-high">
                Price: High
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileFiltersOpen(
                true
              )
            }
            className="
              mt-4
              w-full
              h-12
              border border-black
              rounded-xl
              flex items-center
              justify-center
              gap-2
              font-medium
              bg-white
              active:bg-neutral-100
              transition
            "
          >
            <SlidersHorizontal
              size={18}
            />

            Filters

            {(search ||
              category ||
              minPrice ||
              maxPrice) && (
              <span className="ml-1 w-2 h-2 rounded-full bg-black" />
            )}
          </button>

          {selectedCategory && (
            <p className="text-xs text-gray-500 mt-3">
              Showing{" "}
              {
                selectedCategory.name
              }{" "}
              collection
            </p>
          )}
        </div>

        {/* ================================================= */}
        {/* DESKTOP TOP BAR */}
        {/* ================================================= */}

        <div className="hidden lg:flex lg:items-center justify-between gap-4 mb-7">
          <div>
            <p className="text-gray-600">
              <span className="font-semibold text-black">
                {loading
                  ? "..."
                  : totalProducts}
              </span>{" "}
              product
              {!loading &&
              totalProducts !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

            {selectedCategory && (
              <p className="text-sm text-gray-500 mt-1">
                Showing{" "}
                {
                  selectedCategory.name
                }{" "}
                collection
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Sort by
            </span>

            <select
              value={sort}
              onChange={(
                event
              ) => {
                setSort(
                  event.target.value
                );

                setPage(1);
              }}
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none min-w-[180px] focus:border-black"
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

        {/* ================================================= */}
        {/* DESKTOP + PRODUCTS */}
        {/* ================================================= */}

        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] lg:gap-7 xl:gap-8 items-start">

          {/* ================================================= */}
          {/* DESKTOP FILTER */}
          {/* ================================================= */}

          <aside className="hidden lg:block border border-gray-200 rounded-2xl p-5 xl:p-6 bg-white h-fit sticky top-[105px]">
            <FilterContent />
          </aside>

          {/* ================================================= */}
          {/* PRODUCTS AREA */}
          {/* ================================================= */}

          <div className="min-w-0">

            {loading ? (
              <div
                className="
                  grid
                  grid-cols-2
                  md:grid-cols-3
                  xl:grid-cols-3
                  gap-x-3
                  sm:gap-x-5
                  xl:gap-x-6
                  gap-y-7
                  sm:gap-y-9
                "
              >
                {[
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                ].map(
                  (item) => (
                    <ProductSkeleton
                      key={
                        item
                      }
                    />
                  )
                )}
              </div>
            ) : products.length ===
              0 ? (
              <div className="min-h-[350px] border border-gray-200 rounded-2xl flex items-center justify-center text-center px-6">
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
                    className="mt-6 bg-black !text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="
                  grid
                  grid-cols-2
                  md:grid-cols-3
                  xl:grid-cols-3
                  gap-x-3
                  sm:gap-x-5
                  xl:gap-x-6
                  gap-y-7
                  sm:gap-y-9
                "
              >
                {products.map(
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
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* PAGINATION */}
        {/* ================================================= */}

        {!loading &&
          products.length >
            0 &&
          totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-10 md:mt-14">
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
                className="border border-gray-300 px-3.5 sm:px-5 py-2.5 rounded-xl text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed hover:border-black transition"
              >
                Previous
              </button>

              <span className="px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
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
                className="border border-gray-300 px-3.5 sm:px-5 py-2.5 rounded-xl text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed hover:border-black transition"
              >
                Next
              </button>
            </div>
          )}
      </section>

      {/* ================================================= */}
      {/* MOBILE FILTER DRAWER */}
      {/* ================================================= */}

      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]">

          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close filters"
            onClick={() =>
              setMobileFiltersOpen(
                false
              )
            }
            className="absolute inset-0 w-full h-full bg-black/45 backdrop-blur-[1px]"
          />

          {/* DRAWER */}

          <div
            className="
              absolute
              bottom-0
              left-0
              right-0
              bg-white
              rounded-t-[24px]
              max-h-[88vh]
              overflow-y-auto
              px-5
              pt-5
              pb-[calc(20px+env(safe-area-inset-bottom))]
              shadow-[0_-20px_60px_rgba(0,0,0,0.18)]
            "
          >
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-5" />

            <FilterContent
              mobile
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;