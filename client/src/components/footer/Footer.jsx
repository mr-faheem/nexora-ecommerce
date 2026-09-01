import {
  Link,
} from "react-router-dom";

import {
  Mail,
  MapPin,
  Phone,
  ArrowRight,
} from "lucide-react";

function Footer() {
  const year =
    new Date().getFullYear();

  return (
    <footer className="bg-black !text-white">
      {/* ================================================= */}
      {/* NEWSLETTER */}
      {/* ================================================= */}

      <div className="border-b border-white/15">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
              Stay Connected
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mt-3">
              Style updates,
              new arrivals and
              more.
            </h2>
          </div>

          <div className="flex w-full lg:max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 min-w-0 bg-transparent border border-white/30 px-4 py-3.5 outline-none focus:border-white !text-white placeholder:text-gray-500"
            />

            <button
              type="button"
              className="bg-white !text-black px-5 flex items-center justify-center hover:bg-gray-200 transition"
              aria-label="Subscribe"
            >
              <ArrowRight
                size={20}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* MAIN FOOTER */}
      {/* ================================================= */}

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ============================================= */}
          {/* BRAND */}
          {/* ============================================= */}

          <div>
            <Link
              to="/"
              className="text-2xl font-bold tracking-[0.1em] !text-white"
            >
              NEXORA
            </Link>

            <p className="text-gray-400 text-sm leading-7 mt-5 max-w-xs">
              Modern fashion made
              for everyday confidence,
              comfort and effortless
              style.
            </p>

            {/* Social Icons */}

            <div className="flex items-center gap-4 mt-6">

              {/* Instagram */}

              <a
                href="#"
                aria-label="Instagram"
                title="Instagram"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center !text-white hover:bg-white hover:!text-black transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                  />

                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>

              {/* Facebook */}

              <a
                href="#"
                aria-label="Facebook"
                title="Facebook"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center !text-white hover:bg-white hover:!text-black transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13.6 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.5 1.6-1.5H17V4a23 23 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2H8v3h2.6v8h3Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ============================================= */}
          {/* SHOP */}
          {/* ============================================= */}

          <div>
            <h3 className="font-semibold text-lg !text-white">
              Shop
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-gray-400">
              <Link
                to="/shop"
                className="hover:!text-white transition"
              >
                All Products
              </Link>

              <Link
                to="/categories"
                className="hover:!text-white transition"
              >
                Categories
              </Link>

              <Link
                to="/shop?category=men"
                className="hover:!text-white transition"
              >
                Men
              </Link>

              <Link
                to="/shop?category=women"
                className="hover:!text-white transition"
              >
                Women
              </Link>

              <Link
                to="/shop?category=kids"
                className="hover:!text-white transition"
              >
                Kids
              </Link>
            </div>
          </div>

          {/* ============================================= */}
          {/* CUSTOMER CARE */}
          {/* ============================================= */}

          <div>
            <h3 className="font-semibold text-lg !text-white">
              Customer Care
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-gray-400">
              <Link
                to="/profile"
                className="hover:!text-white transition"
              >
                My Account
              </Link>

              <Link
                to="/orders"
                className="hover:!text-white transition"
              >
                My Orders
              </Link>

              <Link
                to="/wishlist"
                className="hover:!text-white transition"
              >
                Wishlist
              </Link>

              <Link
                to="/cart"
                className="hover:!text-white transition"
              >
                Cart
              </Link>

              <Link
                to="/contact"
                className="hover:!text-white transition"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* ============================================= */}
          {/* CONTACT */}
          {/* ============================================= */}

          <div>
            <h3 className="font-semibold text-lg !text-white">
              Contact
            </h3>

            <div className="mt-5 space-y-4 text-sm text-gray-400">

              <div className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  support@nexora.com
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  +91 XXXXX XXXXX
                </span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  India
                </span>
              </div>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 hover:!text-white transition"
              >
                About Nexora

                <ArrowRight
                  size={15}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* BOTTOM FOOTER */}
        {/* ================================================= */}

        <div className="border-t border-white/15 mt-14 pt-7 flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-gray-500">
          <p>
            © {year} Nexora.
            All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>
              Secure Payments
            </span>

            <span>
              Easy Returns
            </span>

            <span>
              Customer Support
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;