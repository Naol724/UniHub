const { body } = require("express-validator");
const { validate } = require("../middleware/validate.middleware");

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Min 6 chars password"),
  ],
  validate,
  registerUser
);