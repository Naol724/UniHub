/**
 * handleError.js
 * Converts Axios or JS errors into user-friendly messages
 */
export const handleError = (error) => {
  // Server responded with a status code
  if (error?.response) {
    const { status, data } = error.response;
    if (data?.message) return data.message;

    switch (status) {
      case 400:
        return "Bad request. Please check your input.";
      case 401:
        return "Unauthorized. Please login again.";
      case 403:
        return "Access denied.";
      case 404:
        return "Resource not found.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  // No response from server (network error)
  if (error?.request) {
    return "Network error. Please check your internet connection.";
  }

  // JavaScript error
  if (error?.message) return error.message;

  // Fallback
  return "An unexpected error occurred.";
};