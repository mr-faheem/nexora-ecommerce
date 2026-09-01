import {
  useEffect,
  useState,
} from "react";

import CartContext from "./CartContext";

import useAuth from "../hooks/useAuth";

import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartApi,
} from "../services/cartService";

export function CartProvider({
  children,
}) {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [cart, setCart] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  // ==============================
  // Fetch Cart
  // ==============================

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);

      return null;
    }

    try {
      setLoading(true);

      const data =
        await getCart();

      setCart(
        data.cart || null
      );

      return data;
    } catch (error) {
      console.error(
        "Fetch Cart Error:",
        error
      );

      setCart(null);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Add Product
  // ==============================

  const addToCart = async (
    productId,
    quantity = 1
  ) => {
    const data =
      await addToCartApi(
        productId,
        quantity
      );

    setCart(
      data.cart || null
    );

    return data;
  };

  // ==============================
  // Update Quantity
  // ==============================

  const updateQuantity = async (
    productId,
    quantity
  ) => {
    const data =
      await updateCartItem(
        productId,
        quantity
      );

    setCart(
      data.cart || null
    );

    return data;
  };

  // ==============================
  // Remove Product
  // ==============================

  const removeItem = async (
    productId
  ) => {
    const data =
      await removeCartItem(
        productId
      );

    setCart(
      data.cart || null
    );

    return data;
  };

  // ==============================
  // Clear Cart
  // ==============================

  const clearCart = async () => {
    const data =
      await clearCartApi();

    setCart(
      data.cart || null
    );

    return data;
  };

  // ==============================
  // Reset Local Cart
  // ==============================

  const resetCart = () => {
    setCart(null);
    setLoading(false);
  };

  // ==============================
  // Sync Cart With Logged-in User
  // ==============================

  useEffect(() => {
    // Auth abhi check ho raha hai
    if (authLoading) {
      return;
    }

    // Logout / guest
    if (!isAuthenticated) {
      setCart(null);
      setLoading(false);

      return;
    }

    let cancelled = false;

    const loadUserCart =
      async () => {
        try {
          setLoading(true);

          // Important:
          // previous user's cart hata do
          setCart(null);

          const data =
            await getCart();

          if (!cancelled) {
            setCart(
              data.cart || null
            );
          }
        } catch (error) {
          console.error(
            "User Cart Fetch Error:",
            error
          );

          if (!cancelled) {
            setCart(null);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadUserCart();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    authLoading,
    user?.id,
    user?._id,
  ]);

  // ==============================
  // Cart Count
  // ==============================

  const cartCount =
    cart?.items?.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    ) || 0;

  // ==============================
  // Total Unique Products
  // ==============================

  const cartItemsCount =
    cart?.items?.length || 0;

  return (
    <CartContext.Provider
      value={{
        cart,

        cartCount,
        cartItemsCount,

        loading,

        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        resetCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}