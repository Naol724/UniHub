
import axios from "axios";
import { getLocal , removeLocal} from "../utils/storage";
import { handleError } from "../utils/handleError";

const API = axios.create({
baseURL: process.env.REACT_APP_API_URL, // change to your backend URL
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = getLocal("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
},
  (err) => Promise.reject(handleError(err))
);

// Global response error handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
   const message = handleError(err);
console.error("API Error:", message);
 //  Auto logout if unauthorized
 if (err.response?.status === 401) {
      removeLocal("token");
      window.location.href = "/login";
    }
return Promise.reject(message);
  }
);

export default API;