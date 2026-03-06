import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ((window as any).__TAURI_INTERNALS__ ? 'http://localhost:8000' : `http://${window.location.hostname}:8000`),
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add access token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const currentToken = localStorage.getItem("access_token");
        if (!currentToken) throw new Error("No token available");

        const response = await axios.post(`${(window as any).__TAURI_INTERNALS__ ? 'http://localhost:8000' : `http://${window.location.hostname}:8000`}/v1/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });

        const { access_token } = response.data;
        localStorage.setItem("access_token", access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear auth and redirect to login if refresh fails
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
