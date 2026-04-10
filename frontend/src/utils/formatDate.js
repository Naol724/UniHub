/**
 * formatDate.js
 * Reusable date formatting helpers
 */

// Format short date: "Apr 9, 2026"
export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

// Format date + time: "Apr 9, 2026, 10:45 AM"
export const formatDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Format ISO string for backend
export const formatISO = (date) => {
  if (!date) return "";
  return new Date(date).toISOString();
};

// Format custom pattern
export const formatCustom = (date, options = {}) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, options);
};