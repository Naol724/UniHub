// backend/middleware/validate.middleware.js

const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ApiError(400, `Validation failed: ${errorMessages.join(', ')}`));
  }
  
  next();
};

// Common validation rules
const validationRules = {
  // User validation
  register: [
    require("express-validator").body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    
    require("express-validator").body("lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    
    require("express-validator").body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    
    require("express-validator").body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
  ],

  login: [
    require("express-validator").body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    
    require("express-validator").body("password")
      .notEmpty()
      .withMessage("Password is required")
  ]
};

module.exports = {
  validate,
  validationRules
};
