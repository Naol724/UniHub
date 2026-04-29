// backend/utils/jwt.js

import jwt from "jsonwebtoken";

// 🔐 Generate Token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🔍 Verify Token (safe reusable function)
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export {
  generateToken,
  verifyToken,
};