/**
 * api.js
 * Axios instance with baseURL, token, and global error handling
 */
import axios from "axios";
import { getLocal } from "../utils/storage";
import { handleError } from "../utils/handleError";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // change to your backend URL
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = getLocal("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Global response error handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.data || err.message);
    return Promise.reject(handleError(err));
  }
);

export default API;