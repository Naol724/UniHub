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

//  Get current user from API
export const getCurrentUser = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};

//  Get current user from localStorage
export const getLocalUser = () => {
  return getLocal("user");
};

//  Update user profile
export const updateProfile = async (userData) => {
  const res = await API.put("/auth/profile", userData);
  
  // Update localStorage
  setLocal("user", res.data.user);
  
  return res.data;
};

//  Change password
export const changePassword = async (passwordData) => {
  const res = await API.put("/auth/change-password", passwordData);
  return res.data;
};