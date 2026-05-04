import { apiClient } from './apiClient';

export const authApi = {
    signup: async (userData) => {
        const response = await apiClient.post('/auth/signup', userData);
        return response.data;
    },
    
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    }
};