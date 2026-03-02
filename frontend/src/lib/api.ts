/**
 * Client HTTP gọi API backend (Spring Boot).
 * Base URL: http://localhost:8080/api
 * Mỗi request tự gắn header Authorization: Bearer <token> nếu đã đăng nhập.
 */
import axios from "axios";
import { getToken } from "./auth";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
