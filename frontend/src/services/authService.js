import API from "./api";
import { setLocal, removeLocal, getLocal } from "../utils/storage";

// Mock user data for demo
const MOCK_USERS = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "demo@unihub.com",
    password: "demo123",
    role: "student",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "admin@unihub.com", 
    password: "admin123",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
  }
];

//  Login
export const login = async (credentials) => {
  const { email, password } = credentials;
  
  // Mock authentication for demo
  const mockUser = MOCK_USERS.find(
    user => user.email === email?.trim() && user.password === password
  );
  
  if (mockUser) {
    const token = `mock-token-${mockUser.id}-${Date.now()}`;
    const user = { ...mockUser };
    delete user.password; // Don't store password in user object
    
    setLocal("token", token);
    setLocal("user", user);
    
    return { token, user };
  }
  
  // If no mock user found, try real API
  try {
    const res = await API.post("/auth/login", {
      email: email?.trim(),
      password,
    });

    setLocal("token", res.data.token);
    setLocal("user", res.data.user);

    return res.data;
  } catch (error) {
    throw new Error("Invalid email or password");
  }
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
  // First try to get from localStorage (for mock auth)
  const localUser = getLocal("user");
  if (localUser) {
    return { user: localUser };
  }
  
  // If no local user, try API
  try {
    const res = await API.get("/auth/me");
    return res.data;
  } catch (error) {
    throw new Error("User not found");
  }
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