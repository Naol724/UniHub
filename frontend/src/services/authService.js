import API from "./api";
import { setLocal, removeLocal, getLocal } from "../utils/storage";

export const login = async (credentials) => {
  const { email, password } = credentials;
  const res = await API.post("/auth/login", { email: email?.trim(), password });
  // Strip "Bearer " prefix before storing
  const token = res.data.token?.replace("Bearer ", "") || res.data.token;
  setLocal("token", token);
  setLocal("user", res.data.user);
  return res.data;
};

export const register = async (userData) => {
  const { confirmPassword, ...rest } = userData;
  const res = await API.post("/auth/register", { ...rest, email: userData.email.trim() });
  const token = res.data.token?.replace("Bearer ", "") || res.data.token;
  setLocal("token", token);
  setLocal("user", res.data.user);
  return res.data;
};

export const logout = () => {
  removeLocal("token");
  removeLocal("user");
  window.location.href = "/login";
};

export const getCurrentUser = async () => {
  const localUser = getLocal("user");
  if (localUser) return { user: localUser };
  const res = await API.get("/auth/me");
  return res.data;
};

export const getLocalUser = () => getLocal("user");

export const updateProfile = async (userData) => {
  const res = await API.put("/auth/profile", userData);
  setLocal("user", res.data.user);
  return res.data;
};

export const changePassword = async (passwordData) => {
  const res = await API.put("/auth/change-password", passwordData);
  return res.data;
};
