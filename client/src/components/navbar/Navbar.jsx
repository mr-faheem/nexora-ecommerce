import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  Heart,
  ShoppingCart,
  User,
  LogOut,
  Package,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

function Navbar() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const {
    cartCount,
  } = useCart();

  const {
    wishlistCount,
  } = useWishlist();

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const profileRef =
    useRef(null);

  const handleLogout = () => {
    logout();

    setProfileOpen(false);
    setMobileOpen(false);

    navigate("/");
  };

  const closeMenus = () => {
    setProfileOpen(false);
    setMobileOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          profileRef.current &&
          !profileRef.current.contains(
            event.target
          )
        ) {
          setProfileOpen(false);
        }
      };

    const handleScroll = () => {
      setProfileOpen(false);
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );
    };
  }, []);

  const navLinkClass = ({
    isActive,
  }) =>
    `relative py-2 transition-colors duration-300
    after:absolute
    after:left-0
    after:-bottom-1
    after:h-[2px]
    after:bg-black
    after:transition-all
    after:duration-300
    ${
      isActive
        ? "text-black font-semibold after:w-full"
        : "text-gray-600 hover:text-black after:w-0 hover:after:w-full"
    }`;

  const mobileNavLinkClass = ({
    isActive,
  }) =>
    `flex items-center justify-between py-4 text-[15px] border-b border-gray-100 transition-colors
    ${
      isActive
        ? "font-semibold text-black"
        : "text-gray-700"
    }`;

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div
        className="
          max-w-7xl mx-auto
          h-[68px] md:h-20
          px-4 sm:px-5 md:px-6
          flex items-center justify-between
        "
      >
        {/* ================================================= */}
        {/* LOGO */}
        {/* ================================================= */}

        <Link
          to="/"
          onClick={closeMenus}
          className="
            text-[22px]
            sm:text-2xl
            md:text-[26px]
            font-bold
            tracking-[0.09em]
            leading-none
          "
        >
          NEXORA
        </Link>

        {/* ================================================= */}
        {/* DESKTOP NAVIGATION */}
        {/* ================================================= */}

        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            className={
              navLinkClass
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/shop"
            className={
              navLinkClass
            }
          >
            Shop
          </NavLink>

          <NavLink
            to="/categories"
            className={
              navLinkClass
            }
          >
            Categories
          </NavLink>

          <NavLink
            to="/about"
            className={
              navLinkClass
            }
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            className={
              navLinkClass
            }
          >
            Contact
          </NavLink>
        </nav>

        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <div
          className="
            flex items-center
            gap-3
            sm:gap-3.5
            md:gap-5
          "
        >
          {/* ================================================= */}
          {/* PROFILE */}
          {/* ================================================= */}

          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() => {
                setProfileOpen(
                  (
                    previous
                  ) =>
                    !previous
                );

                setMobileOpen(false);
              }}
              className="
                flex items-center gap-1
                hover:text-gray-500
                transition
                p-1
              "
              aria-label="Account"
            >
              <User
                size={21}
                className="md:w-[22px] md:h-[22px]"
              />

              <ChevronDown
                size={14}
                className="hidden lg:block"
              />
            </button>

            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-11
                  w-[calc(100vw-32px)]
                  max-w-[240px]
                  bg-white
                  border border-gray-200
                  rounded-2xl
                  shadow-[0_18px_45px_rgba(0,0,0,0.12)]
                  overflow-hidden
                  z-[60]
                "
              >
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-4 border-b">
                      <p className="font-semibold truncate">
                        {user?.name ||
                          "User"}
                      </p>

                      <p className="text-xs text-gray-500 truncate mt-1">
                        {
                          user?.email
                        }
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={
                        closeMenus
                      }
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                    >
                      <User
                        size={18}
                      />

                      Profile
                    </Link>

                    <Link
                      to="/orders"
                      onClick={
                        closeMenus
                      }
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                    >
                      <Package
                        size={18}
                      />

                      My Orders
                    </Link>

                    {user?.role ===
                      "admin" && (
                      <Link
                        to="/admin"
                        onClick={
                          closeMenus
                        }
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                      >
                        <LayoutDashboard
                          size={18}
                        />

                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="
                        w-full
                        flex items-center gap-3
                        px-4 py-3
                        text-left
                        text-red-600
                        border-t
                        hover:bg-red-50
                        transition
                      "
                    >
                      <LogOut
                        size={18}
                      />

                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={
                        closeMenus
                      }
                      className="block px-4 py-3 hover:bg-gray-50 transition"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={
                        closeMenus
                      }
                      className="block px-4 py-3 border-t hover:bg-gray-50 transition"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* WISHLIST */}
          {/* ================================================= */}

          <Link
            to="/wishlist"
            onClick={() =>
              setMobileOpen(false)
            }
            className="
              relative
              flex items-center justify-center
              p-1
              hover:text-gray-500
              transition
            "
            aria-label="Wishlist"
          >
            <Heart
              size={21}
              className="md:w-[22px] md:h-[22px]"
            />

            {wishlistCount >
              0 && (
              <span
                className="
                  absolute
                  -top-1.5
                  -right-1.5
                  min-w-[17px]
                  h-[17px]
                  px-1
                  bg-black
                  !text-white
                  text-[10px]
                  font-semibold
                  rounded-full
                  flex items-center justify-center
                  leading-none
                "
              >
                {
                  wishlistCount
                }
              </span>
            )}
          </Link>

          {/* ================================================= */}
          {/* CART */}
          {/* ================================================= */}

          <Link
            to="/cart"
            onClick={() =>
              setMobileOpen(false)
            }
            className="
              relative
              flex items-center justify-center
              p-1
              hover:text-gray-500
              transition
            "
            aria-label="Cart"
          >
            <ShoppingCart
              size={21}
              className="md:w-[22px] md:h-[22px]"
            />

            {cartCount > 0 && (
              <span
                className="
                  absolute
                  -top-1.5
                  -right-1.5
                  min-w-[17px]
                  h-[17px]
                  px-1
                  bg-black
                  !text-white
                  text-[10px]
                  font-semibold
                  rounded-full
                  flex items-center justify-center
                  leading-none
                "
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* ================================================= */}
          {/* MOBILE MENU */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() => {
              setMobileOpen(
                (
                  previous
                ) =>
                  !previous
              );

              setProfileOpen(false);
            }}
            className="
              md:hidden
              flex items-center justify-center
              p-1
              ml-0.5
            "
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* MOBILE NAVIGATION */}
      {/* ================================================= */}

      {mobileOpen && (
        <div
          className="
            md:hidden
            border-t
            bg-white
            shadow-[0_16px_30px_rgba(0,0,0,0.06)]
          "
        >
          <nav className="px-5 pb-5">
            <NavLink
              to="/"
              onClick={
                closeMenus
              }
              className={
                mobileNavLinkClass
              }
            >
              <span>
                Home
              </span>

              <ArrowRight
                size={16}
                className="text-gray-400"
              />
            </NavLink>

            <NavLink
              to="/shop"
              onClick={
                closeMenus
              }
              className={
                mobileNavLinkClass
              }
            >
              <span>
                Shop
              </span>

              <ArrowRight
                size={16}
                className="text-gray-400"
              />
            </NavLink>

            <NavLink
              to="/categories"
              onClick={
                closeMenus
              }
              className={
                mobileNavLinkClass
              }
            >
              <span>
                Categories
              </span>

              <ArrowRight
                size={16}
                className="text-gray-400"
              />
            </NavLink>

            <NavLink
              to="/about"
              onClick={
                closeMenus
              }
              className={
                mobileNavLinkClass
              }
            >
              <span>
                About Us
              </span>

              <ArrowRight
                size={16}
                className="text-gray-400"
              />
            </NavLink>

            <NavLink
              to="/contact"
              onClick={
                closeMenus
              }
              className="
                flex items-center
                justify-between
                py-4
                text-[15px]
                text-gray-700
              "
            >
              <span>
                Contact Us
              </span>

              <ArrowRight
                size={16}
                className="text-gray-400"
              />
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;