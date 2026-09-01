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

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
        {/* Logo */}

        <Link
          to="/"
          onClick={closeMenus}
          className="text-2xl md:text-[26px] font-bold tracking-[0.08em]"
        >
          NEXORA
        </Link>

        {/* Desktop Navigation */}

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

        {/* Right Side */}

        <div className="flex items-center gap-4 md:gap-5">
          {/* Profile */}

          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (
                    previous
                  ) =>
                    !previous
                )
              }
              className="flex items-center gap-1 hover:text-gray-500 transition"
              aria-label="Account"
            >
              <User size={22} />

              <ChevronDown
                size={14}
                className="hidden lg:block"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-10 w-60 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
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
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
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
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
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
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
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
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 border-t hover:bg-red-50 transition"
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
                      className="block px-4 py-3 hover:bg-gray-100 transition"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={
                        closeMenus
                      }
                      className="block px-4 py-3 border-t hover:bg-gray-100 transition"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Wishlist */}

          <Link
            to="/wishlist"
            className="relative flex items-center justify-center hover:text-gray-500 transition"
            aria-label="Wishlist"
          >
            <Heart size={22} />

            {wishlistCount >
              0 && (
              <span className="absolute -top-3 -right-3 min-w-5 h-5 px-1 bg-black !text-white text-xs rounded-full flex items-center justify-center">
                {
                  wishlistCount
                }
              </span>
            )}
          </Link>

          {/* Cart */}

          <Link
            to="/cart"
            className="relative flex items-center justify-center hover:text-gray-500 transition"
            aria-label="Cart"
          >
            <ShoppingCart
              size={22}
            />

            {cartCount > 0 && (
              <span className="absolute -top-3 -right-3 min-w-5 h-5 px-1 bg-black !text-white text-xs rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (
                  previous
                ) =>
                  !previous
              )
            }
            className="md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X size={24} />
            ) : (
              <Menu
                size={24}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}

      {mobileOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="px-6 py-5 flex flex-col">
            <Link
              to="/"
              onClick={
                closeMenus
              }
              className="py-3 border-b"
            >
              Home
            </Link>

            <Link
              to="/shop"
              onClick={
                closeMenus
              }
              className="py-3 border-b"
            >
              Shop
            </Link>

            <Link
              to="/categories"
              onClick={
                closeMenus
              }
              className="py-3 border-b"
            >
              Categories
            </Link>

            <Link
              to="/about"
              onClick={
                closeMenus
              }
              className="py-3 border-b"
            >
              About Us
            </Link>

            <Link
              to="/contact"
              onClick={
                closeMenus
              }
              className="py-3"
            >
              Contact Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;