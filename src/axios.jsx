import axios from "axios";

// Prefer VITE_API_URL for API calls
// Fallback to VITE_BASE_URL only if it doesn't end with /api
const rawApi = import.meta.env.VITE_API_URL;
const rawBase = import.meta.env.VITE_BASE_URL;

// Normalizer: remove trailing slashes
const clean = (v) => v?.replace(/\/+$/, "");

// Compute final base URL
let baseURL;

if (rawApi) {
  baseURL = clean(rawApi); // expected: https://backend/api
} else if (rawBase) {
  baseURL = clean(rawBase) + "/api"; // build /api when base given
} else {
  // ONLY dev fallback (updated to use Render backend for deployed frontend)
  baseURL = "https://springteleecom.onrender.com/api";
}

const api = axios.create({
  baseURL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally - clear invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired - clear it
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("isAdmin");
      // Optionally redirect to login
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
