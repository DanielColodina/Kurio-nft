import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.BASE_URL}api`,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = (error as { response?: { status?: number } }).response
      ?.status;
    if (status === 401 && !window.location.pathname.endsWith("/login")) {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const pathname = window.location.pathname.startsWith(base)
        ? window.location.pathname.slice(base.length) || "/"
        : window.location.pathname;
      window.location.assign(
        `${import.meta.env.BASE_URL}login?returnTo=${encodeURIComponent(pathname)}`,
      );
    }
    return Promise.reject(error);
  },
);
