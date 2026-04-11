// backend/middleware/role.middleware.js

const ApiError = require("../utils/ApiError");

// 🛡️ Authorization Middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Not authenticated"));
    }

    const userRole = req.user.role;

    if (!userRole) {
      return next(new ApiError(403, "Role not found"));
    }

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ApiError(403, "Access denied: insufficient permissions")
      );
    }

    next();
  };
};

module.exports = { authorize };