import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api",

  // Render cold start ke liye 20 sec kam pad sakta hai
  timeout: 60000,
});

// ======================================================
// SIMPLE GET CACHE
// ======================================================

const requestCache = new Map();

const CACHE_TIME =
  60 * 1000; // 1 minute

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

    if (
      typeof FormData !==
        "undefined" &&
      config.data instanceof
        FormData
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
// RETRY GET REQUEST
// Render cold start / temporary network errors
// ======================================================

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

export const getWithRetry =
  async (
    url,
    config = {},
    retries = 2
  ) => {
    let lastError;

    for (
      let attempt = 0;
      attempt <= retries;
      attempt++
    ) {
      try {
        return await api.get(
          url,
          config
        );
      } catch (error) {
        lastError = error;

        const status =
          error.response?.status;

        const retryable =
          error.code ===
            "ECONNABORTED" ||
          !error.response ||
          (status >= 500 &&
            status < 600);

        if (
          !retryable ||
          attempt === retries
        ) {
          throw error;
        }

        // 1.5s -> 3s
        await sleep(
          1500 *
            (attempt + 1)
        );
      }
    }

    throw lastError;
  };

// ======================================================
// CACHED GET
// ======================================================

export const cachedGet =
  async (
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
      requestCache.get(
        cacheKey
      );

    if (
      cached &&
      Date.now() -
        cached.time <
        cacheTime
    ) {
      return cached.response;
    }

    // Direct api.get ki jagah
    // retry enabled GET
    const response =
      await getWithRetry(
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
// ======================================================

export const clearApiCache =
  () => {
    requestCache.clear();
  };

export default api;