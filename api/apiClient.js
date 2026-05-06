// src/api/apiClient.js
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore'; // Tera Zustand store

// 1. Create the base Axios instance
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    // Hum withCredentials hata rahe hain kyunki hum tokens body/headers mein bhej rahe hain, cookies mein nahi.
});

// --- QUEUE SYSTEM FOR CONCURRENT REFRESHES ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};
// ---------------------------------------------

// 2. Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Response Interceptor: Handle 401 & Silent Token Refresh
apiClient.interceptors.response.use(
    (response) => response, // Agar sab sahi hai, toh direct response de do
    async (error) => {
        const originalRequest = error.config;

        // Agar error 401 (Unauthorized) hai aur humne abhi tak retry nahi kiya hai
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Agar pehle se koi aur request token refresh kar rahi hai, toh isko line mein laga do
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                .then((token) => {
                    originalRequest.headers.Authorization = 'Bearer ' + token;
                    return apiClient(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true; // Lock laga do taaki dusri requests refresh trigger na karein

            try {
                // Get the refresh token and device ID from Zustand
                const { refreshToken } = useAuthStore.getState();
                const deviceId = localStorage.getItem('deviceId') || 'web-browser';

                // Call tera backend wala refresh endpoint (Body mein data bhej kar)
                const { data } = await axios.post(
                    `${apiClient.defaults.baseURL}/auth/refresh`,
                    { refreshToken, deviceId }
                );

                const newAccessToken = data.data.accessToken;
                const newRefreshToken = data.data.refreshToken;

                // Update Zustand store
                useAuthStore.getState().refreshTokens(newAccessToken, newRefreshToken);

                // Line mein khadi hui baaki API requests ko naya token pass kar do
                processQueue(null, newAccessToken);

                // Apni khud ki failed request ko naye token ke sath dobara chalao
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                // Agar refresh token bhi expire ho gaya, toh pura system saaf kar do
                processQueue(refreshError, null);
                useAuthStore.getState().logout();
                
                // User ko login page par fenk do
                if (typeof window !== 'undefined') {
                    window.location.href = '/login'; 
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false; // Lock hata do
            }
        }

        // Agar error 401 nahi hai (e.g. 400, 404, 500), toh error wapas bhej do
        return Promise.reject(error);
    }
);