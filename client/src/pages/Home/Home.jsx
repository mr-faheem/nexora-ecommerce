import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Heart,
  CreditCard,
} from "lucide-react";

import api from "../../api/axios";
import ProductCard from "../../components/cards/ProductCard";

import bannerMen from "../../assets/banners/banner-men.png";
import bannerWomen from "../../assets/banners/banner-women.png";
import bannerKids from "../../assets/banners/banner-kids.png";

import newCollectionImage from "../../assets/promos/new-collection.png";

function Home() {
  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    loadingProducts,
    setLoadingProducts,
  ] = useState(true);

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(true);

  const [
    currentSlide,
    setCurrentSlide,
  ] = useState(0);

  // ======================================================
  // HERO SLIDES
  // ======================================================

  const heroSlides = [
    {
      id: 1,
      eyebrow: "NEXORA / MEN",
      title: "Modern essentials.",
      secondLine: "Made for everyday.",
      description:
        "Clean silhouettes, effortless layers and everyday pieces designed for modern wardrobes.",
      buttonText: "Shop Men",
      link: "/shop?category=men",
      image: bannerMen,
      number: "01",
    },

    {
      id: 2,
      eyebrow: "NEXORA / WOMEN",
      title: "Confidence",
      secondLine: "in every look.",
      description:
        "Contemporary fashion designed around elegance, comfort and effortless everyday style.",
      buttonText: "Shop Women",
      link: "/shop?category=women",
      image: bannerWomen,
      number: "02",
    },

    {
      id: 3,
      eyebrow: "NEXORA / KIDS",
      title: "Made for",
      secondLine: "little explorers.",
      description:
        "Comfortable everyday styles made for movement, play and all-day adventures.",
      buttonText: "Shop Kids",
      link: "/shop?category=kids",
      image: bannerKids,
      number: "03",
    },
  ];

  // ======================================================
  // HERO AUTO SLIDER
  // ======================================================

  useEffect(() => {
    const slider =
      setInterval(() => {
        setCurrentSlide(
          (previous) =>
            previous ===
            heroSlides.length - 1
              ? 0
              : previous + 1
        );
      }, 5000);

    return () => {
      clearInterval(slider);
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide(
      (previous) =>
        previous ===
        heroSlides.length - 1
          ? 0
          : previous + 1
    );
  };

  const previousSlide = () => {
    setCurrentSlide(
      (previous) =>
        previous === 0
          ? heroSlides.length - 1
          : previous - 1
    );
  };

  // ======================================================
  // CATEGORY SORTING
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

      const aDate =
        new Date(
          a.createdAt || 0
        ).getTime();

      const bDate =
        new Date(
          b.createdAt || 0
        ).getTime();

      return aDate - bDate;
    });
  };

  // ======================================================
  // FETCH NEW PRODUCTS
  // ======================================================

  useEffect(() => {
    const fetchProducts =
      async () => {
        try {
          const response =
            await api.get(
              "/products?sort=newest&limit=4"
            );

          setProducts(
            response.data
              .products || []
          );
        } catch (error) {
          console.error(
            "Home Products Error:",
            error
          );

          setProducts([]);
        } finally {
          setLoadingProducts(
            false
          );
        }
      };

    fetchProducts();
  }, []);

  // ======================================================
  // FETCH ACTIVE CATEGORIES
  // ======================================================

  useEffect(() => {
    const fetchCategories =
      async () => {
        try {
          const response =
            await api.get(
              "/categories?active=true"
            );

          const activeCategories =
            response.data
              .categories || [];

          setCategories(
            sortCategories(
              activeCategories
            )
          );
        } catch (error) {
          console.error(
            "Home Categories Error:",
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

  const homeCategories =
    categories.slice(0, 3);

  const activeHero =
    heroSlides[currentSlide];

  return (
    <div className="bg-white text-black">

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">

          <div className="
            grid
            lg:grid-cols-[0.82fr_1.18fr]
            bg-white
            rounded-2xl
            sm:rounded-[28px]
            overflow-hidden
          ">

            {/* HERO LEFT */}

            <div className="
              relative
              px-6
              sm:px-8
              md:px-10
              lg:px-12
              pt-14
              pb-8
              sm:py-10
              lg:py-10
              flex
              flex-col
              justify-center
              min-h-[390px]
              sm:min-h-[420px]
              lg:min-h-[500px]
              lg:h-[500px]
            ">

              <div className="
                absolute
                top-6
                left-6
                sm:left-8
                md:left-10
                lg:left-12
                text-[10px]
                sm:text-[11px]
                font-semibold
                tracking-[0.28em]
                sm:tracking-[0.3em]
                text-gray-400
              ">
                NEXORA / 2026
              </div>

              <div
                key={`content-${currentSlide}`}
                className="animate-[fadeIn_0.5s_ease]"
              >
                <p className="
                  text-[11px]
                  sm:text-xs
                  md:text-sm
                  font-semibold
                  tracking-[0.28em]
                  sm:tracking-[0.3em]
                  uppercase
                  text-gray-500
                  mb-3
                ">
                  {activeHero.eyebrow}
                </p>

                <h1 className="
                  text-[34px]
                  sm:text-4xl
                  md:text-5xl
                  xl:text-[54px]
                  font-bold
                  leading-[1.05]
                  tracking-tight
                ">
                  {activeHero.title}

                  <br />

                  {activeHero.secondLine}
                </h1>

                <p className="
                  mt-4
                  sm:mt-5
                  text-[15px]
                  sm:text-base
                  text-gray-600
                  max-w-md
                  leading-6
                  sm:leading-7
                ">
                  {activeHero.description}
                </p>

                <div className="
                  mt-6
                  flex
                  flex-wrap
                  gap-3
                ">
                  <Link
                    to={activeHero.link}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-3
                      bg-black
                      !text-white
                      px-5
                      sm:px-6
                      py-3
                      rounded-md
                      font-medium
                      hover:bg-neutral-800
                      transition
                      w-fit
                      text-sm
                      sm:text-base
                    "
                  >
                    {activeHero.buttonText}

                    <ArrowRight
                      size={18}
                    />
                  </Link>

                  <Link
                    to="/categories"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-3
                      border
                      border-black
                      !text-black
                      px-5
                      sm:px-6
                      py-3
                      rounded-md
                      font-medium
                      hover:bg-black
                      hover:!text-white
                      transition
                      w-fit
                      text-sm
                      sm:text-base
                    "
                  >
                    Explore Collection
                  </Link>
                </div>
              </div>

              {/* SLIDER DOTS */}

              <div className="mt-7 flex items-center gap-3">
                {heroSlides.map(
                  (
                    slide,
                    index
                  ) => (
                    <button
                      key={
                        slide.id
                      }
                      type="button"
                      onClick={() =>
                        setCurrentSlide(
                          index
                        )
                      }
                      className={`h-[3px] rounded-full transition-all duration-500 ${
                        currentSlide ===
                        index
                          ? "w-12 bg-black"
                          : "w-6 bg-gray-300 hover:bg-gray-500"
                      }`}
                      aria-label={`Go to slide ${
                        index + 1
                      }`}
                    />
                  )
                )}
              </div>
            </div>

            {/* HERO IMAGE */}

            <div
              key={`visual-${currentSlide}`}
              className="
                relative
                overflow-hidden
                bg-neutral-900
                aspect-[4/3]
                sm:aspect-[16/10]
                md:aspect-[16/9]
                lg:aspect-auto
                lg:h-[500px]
              "
            >
              <img
                src={
                  activeHero.image
                }
                alt={`${activeHero.eyebrow} fashion banner`}
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-cover
                  object-center
                  select-none
                "
              />

              <div className="
                absolute
                top-4
                left-4
                sm:top-5
                sm:left-5
                flex
                gap-2
                z-20
              ">

                <button
                  type="button"
                  onClick={
                    previousSlide
                  }
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-white/95
                    text-black
                    flex
                    items-center
                    justify-center
                    hover:bg-white
                    transition
                    shadow
                  "
                  aria-label="Previous slide"
                >
                  <ArrowLeft
                    size={18}
                  />
                </button>

                <button
                  type="button"
                  onClick={
                    nextSlide
                  }
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-white/95
                    text-black
                    flex
                    items-center
                    justify-center
                    hover:bg-white
                    transition
                    shadow
                  "
                  aria-label="Next slide"
                >
                  <ChevronRight
                    size={19}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* SHOP BY CATEGORY */}
      {/* ================================================= */}

      <section
        id="shop-by-category"
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          py-12
          sm:py-14
          md:py-20
        "
      >
        <div className="
          flex
          items-end
          justify-between
          gap-4
          mb-6
          sm:mb-8
          md:mb-10
        ">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500">
              Collections
            </p>

            <h2 className="
              text-[30px]
              sm:text-3xl
              md:text-4xl
              font-bold
              mt-2
              leading-tight
            ">
              Shop by Category
            </h2>
          </div>

          <Link
            to="/categories"
            className="text-sm font-medium underline underline-offset-4 shrink-0"
          >
            View All
          </Link>
        </div>

        {loadingCategories ? (
          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-5
            md:gap-6
          ">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="
                    bg-neutral-100
                    min-h-[390px]
                    rounded-2xl
                    animate-pulse
                  "
                />
              )
            )}
          </div>
        ) : homeCategories.length ===
          0 ? (
          <div className="border rounded-xl px-6 py-14 text-center text-gray-500">
            No active categories available.
          </div>
        ) : (
          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-5
            md:gap-6
          ">
            {homeCategories.map(
              (category) => (
                <Link
                  key={
                    category._id
                  }
                  to={`/shop?category=${category.slug}`}
                  className="
                    group
                    relative
                    min-h-[390px]
                    sm:min-h-[400px]
                    lg:min-h-[390px]
                    rounded-2xl
                    overflow-hidden
                    bg-neutral-100
                  "
                >
                  {category.image ? (
                    <img
                      src={
                        category.image
                      }
                      alt={
                        category.name
                      }
                      loading="lazy"
                      decoding="async"
                      className="
                        absolute
                        inset-0
                        w-full
                        h-full
                        object-cover
                        transition
                        duration-700
                        group-hover:scale-105
                      "
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-300" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  <div className="
                    relative
                    z-10
                    min-h-[390px]
                    sm:min-h-[400px]
                    lg:min-h-[390px]
                    p-6
                    sm:p-7
                    flex
                    flex-col
                    justify-end
                    text-white
                  ">
                    <p className="text-sm text-gray-200">
                      Collection
                    </p>

                    <div className="flex items-end justify-between gap-4 mt-2">
                      <h3 className="text-3xl font-bold">
                        {category.name}
                      </h3>

                      <span className="
                        w-10
                        h-10
                        rounded-full
                        bg-white
                        text-black
                        flex
                        items-center
                        justify-center
                        transition
                        group-hover:translate-x-1
                        shrink-0
                      ">
                        <ArrowRight
                          size={18}
                        />
                      </span>
                    </div>

                    {category.description && (
                      <p className="
                        text-sm
                        text-gray-200
                        mt-3
                        line-clamp-2
                      ">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </section>

      {/* ================================================= */}
      {/* NEW ARRIVALS */}
      {/* ================================================= */}

      <section className="
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        py-12
        sm:py-14
        md:py-20
        border-t
      ">

        <div className="
          flex
          items-end
          justify-between
          gap-4
          mb-7
          md:mb-10
        ">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500">
              Latest Collection
            </p>

            <h2 className="
              text-[30px]
              sm:text-3xl
              md:text-4xl
              font-bold
              mt-2
              leading-tight
            ">
              New Arrivals
            </h2>
          </div>

          <Link
            to="/shop?view=all"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              underline
              underline-offset-4
              shrink-0
            "
          >
            View All

            <ArrowRight
              size={16}
            />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="
            grid
            grid-cols-2
            lg:grid-cols-4
            gap-x-3
            sm:gap-x-5
            lg:gap-x-6
            gap-y-8
          ">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse"
                >
                  <div className="aspect-[4/5] bg-neutral-100 rounded-xl" />

                  <div className="h-4 bg-neutral-100 rounded mt-3 w-4/5" />

                  <div className="h-3 bg-neutral-100 rounded mt-2 w-1/2" />

                  <div className="h-4 bg-neutral-100 rounded mt-3 w-2/5" />
                </div>
              )
            )}
          </div>
        ) : products.length ===
          0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500">
              No products available.
            </p>
          </div>
        ) : (
          <div className="
            grid
            grid-cols-2
            lg:grid-cols-4
            gap-x-3
            sm:gap-x-5
            lg:gap-x-6
            gap-y-8
            md:gap-y-10
          ">
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
      </section>

      {/* ================================================= */}
      {/* NEW COLLECTION PROMO */}
      {/* ================================================= */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="bg-neutral-100 rounded-2xl md:rounded-3xl overflow-hidden grid md:grid-cols-2">

          {/* LEFT CONTENT */}

          <div className="px-6 py-9 sm:p-10 md:p-14 lg:p-16 flex flex-col justify-center">
            <p className="text-[11px] sm:text-sm uppercase tracking-[0.28em] md:tracking-[0.3em] text-gray-500">
              Everyday Style
            </p>

            <h2 className="text-[30px] sm:text-4xl md:text-5xl font-bold mt-3 md:mt-4 leading-[1.08] md:leading-tight">
              Build your wardrobe

              <br className="hidden sm:block" />

              <span className="sm:hidden">
                {" "}
              </span>

              with confidence.
            </h2>

            <p className="text-gray-600 mt-4 md:mt-5 text-[15px] sm:text-base leading-6 md:leading-7 max-w-lg">
              Discover versatile styles designed for work, weekends and everything between.
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 mt-6 md:mt-7 bg-black !text-white px-5 sm:px-6 py-3 rounded-md hover:bg-gray-800 transition w-fit text-sm sm:text-base"
            >
              Explore Now

              <ArrowRight
                size={18}
              />
            </Link>
          </div>

          {/* RIGHT PROMO IMAGE */}

          <Link
            to="/shop"
            className="
              group
              relative
              overflow-hidden
              aspect-[16/11]
              sm:aspect-[16/10]
              md:aspect-auto
              md:min-h-[430px]
            "
          >
            <img
              src={
                newCollectionImage
              }
              alt="Nexora New Collection"
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
                object-center
                transition
                duration-700
                md:group-hover:scale-[1.025]
              "
            />

            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
          </Link>
        </div>
      </section>

      {/* ================================================= */}
      {/* BRAND STATEMENT */}
      {/* ================================================= */}

      <section className="
        bg-black
        text-white
        mt-6
        md:mt-10
      ">
        <div className="
          max-w-5xl
          mx-auto
          px-5
          sm:px-6
          py-16
          sm:py-20
          md:py-24
          text-center
        ">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gray-400">
            Nexora
          </p>

          <h2 className="
            text-[32px]
            sm:text-4xl
            md:text-5xl
            font-bold
            mt-4
            md:mt-5
            leading-[1.1]
          ">
            Everyday fashion.

            <br />

            Designed with confidence.
          </h2>

          <p className="
            text-gray-400
            max-w-2xl
            mx-auto
            mt-5
            sm:mt-6
            text-sm
            sm:text-base
            leading-6
            sm:leading-7
          ">
            Contemporary clothing built around simplicity, versatility and everyday comfort.
          </p>
        </div>
      </section>

      {/* ================================================= */}
      {/* FEATURES */}
      {/* ================================================= */}

      <section className="
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        py-14
        md:py-20
      ">

        <div className="
          grid
          grid-cols-2
          lg:grid-cols-4
          gap-x-5
          gap-y-10
          sm:gap-8
          lg:gap-10
        ">

          <div>
            <ShieldCheck
              size={26}
            />

            <h3 className="
              font-bold
              text-base
              sm:text-lg
              mt-4
              sm:mt-5
            ">
              Premium Quality
            </h3>

            <p className="
              text-gray-500
              mt-2
              text-xs
              sm:text-sm
              leading-5
              sm:leading-6
            ">
              Carefully selected products focused on quality and comfort.
            </p>
          </div>

          <div>
            <CreditCard
              size={26}
            />

            <h3 className="
              font-bold
              text-base
              sm:text-lg
              mt-4
              sm:mt-5
            ">
              Secure Payments
            </h3>

            <p className="
              text-gray-500
              mt-2
              text-xs
              sm:text-sm
              leading-5
              sm:leading-6
            ">
              Secure checkout with COD and Razorpay online payments.
            </p>
          </div>

          <div>
            <Heart
              size={26}
            />

            <h3 className="
              font-bold
              text-base
              sm:text-lg
              mt-4
              sm:mt-5
            ">
              Easy Shopping
            </h3>

            <p className="
              text-gray-500
              mt-2
              text-xs
              sm:text-sm
              leading-5
              sm:leading-6
            ">
              Wishlist, cart and simple product discovery.
            </p>
          </div>

          <div>
            <Truck
              size={26}
            />

            <h3 className="
              font-bold
              text-base
              sm:text-lg
              mt-4
              sm:mt-5
            ">
              Fast Delivery
            </h3>

            <p className="
              text-gray-500
              mt-2
              text-xs
              sm:text-sm
              leading-5
              sm:leading-6
            ">
              Simple order tracking from confirmation to delivery.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;