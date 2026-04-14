
// Validation utilities for authentication forms (email, password, name, confirm password)/**
 * Validates an email address.
 * @param {string} value
 * @returns {string} error message or empty string
 */
export const validateEmail = (value) => {
  if (!value || !value.trim()) return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return "Please enter a valid email address.";
  return "";
};

/**
 * Validates a password.
 * @param {string} value
 * @returns {string} error message or empty string
 */
export const validatePassword = (value) => {
  if (!value) return "Password is required.";
  if (value.length < 6) return "Password must be at least 6 characters.";
  return "";
};

/**
 * Validates a name (first or last).
 * @param {string} value
 * @param {string} [fieldLabel="Name"] - label used in the error message
 * @returns {string} error message or empty string
 */
export const validateName = (value, fieldLabel = "Name") => {
  if (!value || !value.trim()) return `${fieldLabel} is required.`;
  if (value.trim().length < 2) return `${fieldLabel} must be at least 2 characters.`;
  return "";
};

/**
 * Validates that the confirm password matches the original password.
 * @param {string} value - confirm password value
 * @param {string} password - original password to match against
 * @returns {string} error message or empty string
 */
export const validateConfirmPassword = (value, password) => {
  if (!value) return "Please confirm your password.";
  if (value !== password) return "Passwords do not match.";
  return "";
};
