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

function About() {
  return (
    <div className="bg-white">
      {/* Hero */}

      <section className="bg-neutral-100 border-b">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
            About Nexora
          </p>

          <h1 className="text-4xl md:text-7xl font-bold mt-4 max-w-4xl leading-[1.05]">
            Fashion designed
            around modern life.
          </h1>

          <p className="text-gray-600 mt-7 max-w-2xl text-lg leading-8">
            Nexora brings
            together modern
            design, everyday
            comfort and effortless
            style for men, women
            and kids.
          </p>
        </div>
      </section>

      {/* Story */}

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
              Our Story
            </p>

            <h2 className="text-3xl md:text-5xl font-bold mt-4 leading-tight">
              Simple fashion.
              Strong confidence.
            </h2>

            <p className="mt-6 text-gray-600 leading-8">
              We believe great
              clothing should feel
              comfortable, look
              effortless and fit
              naturally into
              everyday life.
            </p>

            <p className="mt-5 text-gray-600 leading-8">
              Nexora is built
              around clean
              silhouettes,
              versatile pieces and
              accessible fashion
              for different
              generations.
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 mt-8 bg-black !text-white px-6 py-3.5 rounded-lg hover:bg-gray-800 transition"
            >
              Explore Collection

              <ArrowRight
                size={18}
              />
            </Link>
          </div>

          <div className="min-h-[450px] rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-400 flex items-center justify-center overflow-hidden">
            <div className="text-center !text-white">
              <p className="tracking-[0.4em] text-sm text-white/60">
                NEXORA
              </p>

              <h3 className="text-5xl md:text-6xl font-bold mt-5">
                Everyday
                <br />
                Fashion
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}

      <section className="bg-neutral-100">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
              What We Believe
            </p>

            <h2 className="text-3xl md:text-5xl font-bold mt-4">
              Built around
              better shopping.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="bg-white rounded-2xl p-7">
              <Sparkles
                size={27}
              />

              <h3 className="font-bold text-xl mt-5">
                Modern Style
              </h3>

              <p className="text-gray-500 text-sm leading-6 mt-3">
                Contemporary
                clothing made for
                everyday use.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7">
              <ShieldCheck
                size={27}
              />

              <h3 className="font-bold text-xl mt-5">
                Quality First
              </h3>

              <p className="text-gray-500 text-sm leading-6 mt-3">
                Products selected
                with comfort and
                quality in mind.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7">
              <Heart
                size={27}
              />

              <h3 className="font-bold text-xl mt-5">
                Easy Shopping
              </h3>

              <p className="text-gray-500 text-sm leading-6 mt-3">
                Simple discovery,
                wishlist, cart and
                checkout.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7">
              <Truck
                size={27}
              />

              <h3 className="font-bold text-xl mt-5">
                Reliable Delivery
              </h3>

              <p className="text-gray-500 text-sm leading-6 mt-3">
                Clear order status
                from confirmation
                to delivery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;