import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import useAuth from "../hooks/useAuth";

import {
  getWishlist,
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
  clearWishlist as clearWishlistApi,
} from "../services/wishlistService";

export const WishlistContext =
  createContext(null);

export function WishlistProvider({
  children,
}) {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [wishlist, setWishlist] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const fetchWishlist =
    useCallback(async () => {
      if (!isAuthenticated) {
        setWishlist(null);
        return null;
      }

      try {
        setLoading(true);

        const data =
          await getWishlist();

        setWishlist(
          data.wishlist || null
        );

        return data;
      } catch (error) {
        console.error(
          "Fetch Wishlist Error:",
          error
        );

        setWishlist(null);

        throw error;
      } finally {
        setLoading(false);
      }
    }, [isAuthenticated]);

  const addProduct = async (
    productId
  ) => {
    const data =
      await addToWishlistApi(
        productId
      );

    setWishlist(
      data.wishlist || null
    );

    return data;
  };

  const removeProduct = async (
    productId
  ) => {
    const data =
      await removeFromWishlistApi(
        productId
      );

    setWishlist(
      data.wishlist || null
    );

    return data;
  };

  const clearAll = async () => {
    const data =
      await clearWishlistApi();

    setWishlist(
      data.wishlist || null
    );

    return data;
  };

  const resetWishlist = () => {
    setWishlist(null);
    setLoading(false);
  };

  const isInWishlist = (
    productId
  ) => {
    return Boolean(
      wishlist?.products?.some(
        (product) =>
          String(
            product?._id ||
              product
          ) ===
          String(productId)
      )
    );
  };

  const toggleWishlist = async (
    productId
  ) => {
    if (
      isInWishlist(productId)
    ) {
      return removeProduct(
        productId
      );
    }

    return addProduct(
      productId
    );
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setWishlist(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadUserWishlist =
      async () => {
        try {
          setLoading(true);

          // previous user ki wishlist hata do
          setWishlist(null);

          const data =
            await getWishlist();

          if (!cancelled) {
            setWishlist(
              data.wishlist || null
            );
          }
        } catch (error) {
          console.error(
            "User Wishlist Fetch Error:",
            error
          );

          if (!cancelled) {
            setWishlist(null);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadUserWishlist();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    authLoading,
    user?.id,
    user?._id,
  ]);

  const wishlistCount =
    wishlist?.products?.length || 0;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        loading,

        fetchWishlist,
        addProduct,
        removeProduct,
        toggleWishlist,
        isInWishlist,
        clearAll,
        resetWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}