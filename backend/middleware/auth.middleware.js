// backend/middleware/auth.middleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

// 🔐 Authentication Middleware (PROTECT ROUTES)
const protect = async (req, res, next) => {
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

    // Get user from database
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return next(new ApiError(401, "Not authorized, user not found"));
    }

    // Attach user data to request
    req.user = user;

    next();
  } catch (error) {
    return next(new ApiError(401, "Not authorized, token invalid"));
  }
};

// Authorization Middleware (RESTRICT BY ROLE)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Not authorized, user not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Not authorized, insufficient permissions"));
    }

    next();
  };
};

// Optional Authentication Middleware (ATTACH USER IF LOGGED IN)
const optionalAuth = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't throw an error for optional auth
      console.log('Optional auth: Invalid token');
    }
  }

  next();
};

// Check if user is team member
const isTeamMember = (req, res, next) => {
  // This would be implemented after we have the Team model
  // For now, we'll just pass through
  next();
};

// Check if user is team leader
const isTeamLeader = (req, res, next) => {
  // This would be implemented after we have the Team model
  // For now, we'll just pass through
  next();
};

module.exports = { 
  protect, 
  restrictTo, 
  optionalAuth, 
  isTeamMember, 
  isTeamLeader 
};