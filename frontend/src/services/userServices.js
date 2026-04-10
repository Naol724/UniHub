/**
 * userService.js
 * Handles user-related API calls
 */
import API from "./api";
import { handleError } from "../utils/handleError";

// Get all users
export const getUsers = async () => {
  try {
    const res = await API.get("/users");
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const res = await API.get(`/users/${id}`);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

// Update user
export const updateUser = async (id, userData) => {
  try {
    const res = await API.put(`/users/${id}`, userData);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const res = await API.delete(`/users/${id}`);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};