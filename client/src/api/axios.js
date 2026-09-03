import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api",

  timeout: 20000,
});

// ======================================================
// SIMPLE GET CACHE
// ======================================================

const requestCache = new Map();

const CACHE_TIME = 60 * 1000; // 1 minute

function getCacheKey(config) {
  const params =
    config.params
      ? JSON.stringify(config.params)
      : "";

  return `${config.url}?${params}`;
}

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // FormData ho to browser ko
    // Content-Type khud set karne do
    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      delete config.headers[
        "Content-Type"
      ];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// CACHED GET
// Public listing APIs ke liye
// ======================================================

export const cachedGet = async (
  url,
  config = {},
  cacheTime = CACHE_TIME
) => {
  const cacheKey =
    getCacheKey({
      url,
      ...config,
    });

  const cached =
    requestCache.get(cacheKey);

  if (
    cached &&
    Date.now() - cached.time <
      cacheTime
  ) {
    return cached.response;
  }

  const response =
    await api.get(
      url,
      config
    );

  requestCache.set(
    cacheKey,
    {
      response,
      time: Date.now(),
    }
  );

  return response;
};

// ======================================================
// CLEAR CACHE
// Product/category create/update/delete ke baad use kar sakte ho
// ======================================================

export const clearApiCache = () => {
  requestCache.clear();
};

export default api;