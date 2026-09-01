import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowRight,
} from "lucide-react";

import api from "../../api/axios";

function AllCategories() {
  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ======================================================
  // Category Order
  // Men -> Women -> Kids -> Remaining
  // ======================================================

  const sortCategories = (
    categoryList
  ) => {
    const priority = {
      men: 1,
      women: 2,
      kids: 3,
    };

    return [
      ...categoryList,
    ].sort((a, b) => {
      const aSlug =
        a.slug?.toLowerCase();

      const bSlug =
        b.slug?.toLowerCase();

      const aPriority =
        priority[aSlug] ?? 999;

      const bPriority =
        priority[bSlug] ?? 999;

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
  };

  // ======================================================
  // Fetch Active Categories
  // ======================================================

  useEffect(() => {
    const fetchCategories =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/categories?active=true"
            );

          setCategories(
            sortCategories(
              response.data
                .categories || []
            )
          );
        } catch (error) {
          console.error(
            "All Categories Error:",
            error
          );

          setError(
            error.response?.data
              ?.message ||
              "Unable to load categories."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}

      <section className="bg-neutral-100 border-b">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-14">
          <p className="text-sm uppercase tracking-[0.32em] text-gray-500">
            Nexora Collections
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-3">
            Shop by Category
          </h1>

          <p className="text-gray-600 mt-5 max-w-2xl leading-7">
            Explore our collections
            and discover styles made
            for every occasion.
          </p>
        </div>
      </section>

      {/* ================================================= */}
      {/* Categories */}
      {/* ================================================= */}

      <section className="max-w-7xl mx-auto px-6 py-14 md:py-16">
        {error && (
          <div className="border border-red-200 bg-red-50 text-red-700 px-5 py-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[
              1,
              2,
              3,
              4,
              5,
              6,
            ].map(
              (item) => (
                <div
                  key={item}
                  className="bg-neutral-100 rounded-2xl min-h-[420px] animate-pulse"
                />
              )
            )}
          </div>
        ) : categories.length ===
          0 ? (
          <div className="py-20 text-center border rounded-2xl">
            <h2 className="text-2xl font-bold">
              No collections
              available
            </h2>

            <p className="text-gray-500 mt-3">
              Please check back
              later.
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 mt-6 bg-black !text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Browse Products

              <ArrowRight
                size={18}
              />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {categories.map(
                (
                  category
                ) => (
                  <Link
                    key={
                      category._id
                    }
                    to={`/shop?category=${category.slug}`}
                    className="group relative min-h-[430px] overflow-hidden rounded-2xl bg-neutral-100 shadow-sm hover:shadow-xl transition-shadow duration-500"
                  >
                    {/* Image */}

                    {category.image ? (
                      <img
                        src={
                          category.image
                        }
                        alt={
                          category.name
                        }
                        className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300" />
                    )}

                    {/* Base Overlay */}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Hover Overlay */}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-500" />

                    {/* Content */}

                    <div className="relative z-10 min-h-[430px] p-7 md:p-8 flex flex-col justify-end">
                      <p className="text-gray-200 text-sm">
                        Collection
                      </p>

                      <div className="flex items-end justify-between gap-5 mt-2">
                        <div className="min-w-0">
                          <h2 className="text-3xl md:text-[34px] font-bold !text-white leading-tight">
                            {
                              category.name
                            }
                          </h2>

                          {category.description && (
                            <p className="!text-gray-200 text-sm mt-4 leading-6 line-clamp-2 max-w-[85%]">
                              {
                                category.description
                              }
                            </p>
                          )}
                        </div>

                        <span className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transition duration-300 group-hover:translate-x-1 group-hover:scale-105">
                          <ArrowRight
                            size={20}
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>

            {/* ============================================= */}
            {/* Browse All */}
            {/* ============================================= */}

            <div className="mt-14 md:mt-16 border-t pt-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
                  All Products
                </p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2">
                  Want to explore
                  everything?
                </h2>

                <p className="text-gray-500 mt-2">
                  Browse products
                  across all active
                  collections.
                </p>
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 bg-black !text-white px-7 py-3.5 rounded-lg font-medium hover:bg-gray-800 transition"
              >
                View All Products

                <ArrowRight
                  size={18}
                />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default AllCategories;