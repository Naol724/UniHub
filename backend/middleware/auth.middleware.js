// backend/middleware/auth.middleware.js

const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

// 🔐 Authentication Middleware (PROTECT ROUTES)
const protect = (req, res, next) => {
  let token;

  // Check Authorization header
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  // No token found
  if (!token) {
    return next(new ApiError(401, "Not authorized, token missing"));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request
    req.user = decoded;

    next();
  } catch (error) {
    return next(new ApiError(401, "Not authorized, token invalid"));
  }
};

module.exports = { protect };