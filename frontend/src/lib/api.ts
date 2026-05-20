
import axios from "axios";
import { getToken } from "./auth";

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

export default api;
