// backend/middleware/role.middleware.js

import ApiError from "../utils/ApiError.js";

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

export { authorize };