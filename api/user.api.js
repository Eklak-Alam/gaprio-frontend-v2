// src/api/user.api.js
import { apiClient } from './apiClient';

export const userApi = {
    // Get my personal profile details
    getProfile: async () => {
        const response = await apiClient.get('/users/me');
        return response.data;
    },

    // Update my profile details
    updateProfile: async (profileData) => {
        // profileData can include: firstName, lastName, goal, avatarUrl
        const response = await apiClient.put('/users/me', profileData);
        return response.data;
    },

    // Change password (will log out other devices!)
    changePassword: async (passwordData) => {
        // passwordData requires: oldPassword, newPassword
        const response = await apiClient.put('/users/me/password', passwordData);
        return response.data;
    },

    // Delete my own account
    deleteAccount: async () => {
        const response = await apiClient.delete('/users/me');
        return response.data;
    }
};