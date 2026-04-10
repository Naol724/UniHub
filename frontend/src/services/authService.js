/**
 * authService.js
 * Handles authentication API calls
 */
import API from "./api";
import { setLocal, removeLocal } from "../utils/storage";
import { handleError } from "../utils/handleError";

// Login
export const login = async (email, password) => {
  try {
    const res = await API.post("/auth/login", { email, password });
    setLocal("token", res.data.token); // Save token
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

// Register
export const register = async (userData) => {
  try {
    const res = await API.post("/auth/register", userData);
    setLocal("token", res.data.token);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

// Logout
export const logout = () => {
  removeLocal("token");
};