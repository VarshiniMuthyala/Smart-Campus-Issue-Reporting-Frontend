import axios from "axios";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://smart-campus-issue-reporting-backend.onrender.com";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`,
    timeout: 30000
});

// =========================================================
// ADD JWT TOKEN TO EVERY REQUEST
// =========================================================

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// =========================================================
// HANDLE UNAUTHORIZED RESPONSES
// =========================================================

api.interceptors.response.use(
    (response) => {
        return response;
    },

    (error) => {

        if (error.response?.status === 401) {

            /*
             * Token is invalid or expired.
             *
             * Clear authentication information and
             * return the user to the login page.
             */
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default api;