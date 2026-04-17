const { body } = require("express-validator");
const { validate, validationRules } = require("../middleware/validate.middleware");

router.post(
  "/register",
  validationRules.register,
  validate,
  registerUser
);