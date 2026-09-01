import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  getProfile,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const token =
    localStorage.getItem("token");

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(Boolean(token));

  const login = async (
    email,
    password
  ) => {
    const data =
      await loginUser(
        email,
        password
      );

    const receivedToken =
      data.token ||
      data.accessToken;

    if (!receivedToken) {
      throw new Error(
        "Token not received from server."
      );
    }

    localStorage.setItem(
      "token",
      receivedToken
    );

    if (data.user) {
      setUser(data.user);
    } else {
      const profileData =
        await getProfile();

      setUser(
        profileData.user || null
      );
    }

    return data;
  };

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    setUser(null);
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const loadProfile =
      async () => {
        try {
          const data =
            await getProfile();

          if (!cancelled) {
            setUser(
              data.user || null
            );
          }
        } catch (error) {
          console.error(
            "Auth Profile Error:",
            error
          );

          localStorage.removeItem(
            "token"
          );

          if (!cancelled) {
            setUser(null);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;