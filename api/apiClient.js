import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// 1. Create the base Axios instance
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // CRITICAL: Allows sending the HttpOnly refresh cookie
    headers: {
        'Content-Type': 'application/json',
    },
});

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
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call your backend refresh endpoint
                // Since withCredentials is true, the cookie goes automatically
                const { data } = await axios.post(
                    `${apiClient.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                // Update Zustand store with new token
                useAuthStore.getState().setAuth(data.data.user, data.data.accessToken);

                // Update the failed request header and retry it
                originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails (cookie expired/invalid), log the user out
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);