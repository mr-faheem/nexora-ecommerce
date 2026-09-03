import {
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  ShieldCheck,
  Heart,
  Sparkles,
  Truck,
} from "lucide-react";

import aboutEverydayFashion from "../../assets/banners/about-everyday-fashion.png";

function About() {
  return (
    <div className="bg-white">
      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="bg-neutral-100 border-b">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
            About Nexora
          </p>

          <h1 className="text-4xl md:text-7xl font-bold mt-4 max-w-4xl leading-[1.05]">
            Fashion designed around modern life.
          </h1>

          <p className="text-gray-600 mt-6 md:mt-7 max-w-2xl text-base md:text-lg leading-7 md:leading-8">
            Nexora brings together modern design,
            everyday comfort and effortless style
            for men, women and kids.
          </p>
        </div>
      </section>

      {/* ================================================= */}
      {/* STORY */}
      {/* ================================================= */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-14 items-center">

          {/* LEFT CONTENT */}

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
              Our Story
            </p>

            <h2 className="text-3xl md:text-5xl font-bold mt-4 leading-tight">
              Simple fashion.
              <br />
              Strong confidence.
            </h2>

            <p className="mt-6 text-gray-600 leading-7 md:leading-8">
              We believe great clothing should feel
              comfortable, look effortless and fit
              naturally into everyday life.
            </p>

            <p className="mt-4 md:mt-5 text-gray-600 leading-7 md:leading-8">
              Nexora is built around clean silhouettes,
              versatile pieces and accessible fashion
              for different generations.
            </p>

            <Link
              to="/shop"
              className="
                inline-flex items-center gap-2
                mt-7 md:mt-8
                bg-black !text-white
                px-6 py-3.5
                rounded-lg
                hover:bg-gray-800
                transition
              "
            >
              Explore Collection

              <ArrowRight size={18} />
            </Link>
          </div>

          {/* RIGHT IMAGE */}

          <div
            className="
              relative
              overflow-hidden
              rounded-2xl md:rounded-3xl
              bg-neutral-100
              aspect-[4/3]
              sm:aspect-[16/11]
              lg:aspect-auto
              lg:min-h-[500px]
            "
          >
            <img
              src={aboutEverydayFashion}
              alt="Nexora Everyday Fashion"
              className="
                absolute inset-0
                w-full h-full
                object-cover
                object-center
                transition-transform
                duration-700
                hover:scale-[1.015]
              "
            />
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* VALUES */}
      {/* ================================================= */}

      <section className="bg-neutral-100">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
              What We Believe
            </p>

            <h2 className="text-3xl md:text-5xl font-bold mt-4">
              Built around better shopping.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 md:mt-12">
            <div className="bg-white rounded-2xl p-7">
              <Sparkles size={27} />

              <h3 className="font-bold text-xl mt-5">
                Modern Style
              </h3>

              <p className="text-gray-500 text-sm leading-6 mt-3">
                Contemporary clothing made for
                everyday use.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7">
              <ShieldCheck size={27} />

              <h3 className="font-bold text-xl mt-5">
                Quality First
              </h3>

              <p className="text-gray-500 text-sm leading-6 mt-3">
                Products selected with comfort
                and quality in mind.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7">
              <Heart size={27} />

              <h3 className="font-bold text-xl mt-5">
                Easy Shopping
              </h3>

              <p className="text-gray-500 text-sm leading-6 mt-3">
                Simple discovery, wishlist,
                cart and checkout.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7">
              <Truck size={27} />

              <h3 className="font-bold text-xl mt-5">
                Reliable Delivery
              </h3>

              <p className="text-gray-500 text-sm leading-6 mt-3">
                Clear order status from
                confirmation to delivery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;