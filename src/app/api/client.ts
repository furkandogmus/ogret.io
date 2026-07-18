import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (original && error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await axios.post("/api/v1/auth/refresh", undefined, { withCredentials: true });
        return api(original);
      } catch {
        if (window.location.pathname !== "/giris") {
          window.dispatchEvent(new Event("auth:expired"));
        }
        window.location.href = "/giris";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
