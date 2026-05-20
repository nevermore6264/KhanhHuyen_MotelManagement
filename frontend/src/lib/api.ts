
import axios from "axios";
import { clearAuth, getToken } from "./auth";

export const API_ORIGIN = "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (!path.includes("dang-nhap") && !path.includes("quen-mat-khau")) {
        clearAuth();
        window.location.replace("/dang-nhap");
      }
    }
    return Promise.reject(err);
  },
);

export default api;
