export const validateEmail = (value) => {
  if (!value || !value.trim()) return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return "Please enter a valid email address.";
  return "";
};

export const validatePassword = (value) => {
  if (!value) return "Password is required.";
  if (value.length < 6) return "Password must be at least 6 characters.";
  return "";
};

export const validateName = (value, fieldLabel = "Name") => {
  if (!value || !value.trim()) return `${fieldLabel} is required.`;
  if (value.trim().length < 2) return `${fieldLabel} must be at least 2 characters.`;
  return "";
};

export const validateConfirmPassword = (value, password) => {
  if (!value) return "Please confirm your password.";
  if (value !== password) return "Passwords do not match.";
  return "";
};
