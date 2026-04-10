/**
 * validation.js
 * Reusable form validation helpers
 */

// Check if value is empty
export const isEmpty = (value) => !value || value.trim() === "";

// Validate email format
export const isEmailValid = (email) => {
  if (isEmpty(email)) return false;
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
};

// Validate password strength
export const isPasswordStrong = (password) => !isEmpty(password) && password.length >= 6;

// Check if two values match
export const isMatch = (value1, value2) => value1 === value2;

// Validate register form
export const validateRegisterForm = (data) => {
  const errors = {};
  if (isEmpty(data.name)) errors.name = "Name is required";
  if (!isEmailValid(data.email)) errors.email = "Invalid email address";
  if (!isPasswordStrong(data.password)) errors.password = "Password must be at least 6 characters";
  if (!isMatch(data.password, data.confirmPassword)) errors.confirmPassword = "Passwords do not match";
  return errors;
};

// Validate login form
export const validateLoginForm = (data) => {
  const errors = {};
  if (!isEmailValid(data.email)) errors.email = "Invalid email";
  if (isEmpty(data.password)) errors.password = "Password is required";
  return errors;
};