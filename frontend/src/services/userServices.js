
import API from "./api";

// Get all users
export const getUsers = async () => {
      const res = await API.get("/users");
      return res.data;
  
};

// Get user by ID
export const getUserById = async (id) => {
  if(!id) throw new Error("User ID is required");
    const res = await API.get(`/users/${id}`);
    return res.data;
};

// Update user
export const updateUser = async (id, userData) => {
    if(!id) throw new Error("User ID is required");
      const res = await API.put(`/users/${id}`, userData);
    return res.data;
};

// Delete user
export const deleteUser = async (id) => {
   if(!id) throw new Error("User ID is required");
    const res = await API.delete(`/users/${id}`);
    return res.data;
};