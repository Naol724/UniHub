

// STRING HELPERS
export const capitalize = (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
export const toUpper = (text) => text ? text.toUpperCase() : "";
export const toLower = (text) => text ? text.toLowerCase() : "";

// ARRAY HELPERS
export const uniqueArray = (arr) => [...new Set(arr)];
export const sortNumbersAsc = (arr) => arr.slice().sort((a, b) => a - b);
export const sortNumbersDesc = (arr) => arr.slice().sort((a, b) => b - a);

// RANDOM & MISC
export const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const randomString = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));