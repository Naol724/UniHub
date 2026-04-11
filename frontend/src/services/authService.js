import API from "./api";
import { setLocal, removeLocal, getLocal } from "../utils/storage";

//  Login
export const login = async (email, password) => {
  const res = await API.post("/auth/login", {
   email: email?.trim(),
    password,
  });

  setLocal("token", res.data.token);
  setLocal("user", res.data.user);

  return res.data;
};

// Register
export const register = async (userData) => {
  const res = await API.post("/auth/register", {
    ...userData,
    email: userData.email.trim(),
  });

  setLocal("token", res.data.token);
  setLocal("user", res.data.user);

  return res.data;
};

//  Logout
export const logout = () => {
  removeLocal("token");
  removeLocal("user");
  window.location.href = "/login";
};

//  Get current user
export const getCurrentUser = () => {
  return getLocal("user");
};