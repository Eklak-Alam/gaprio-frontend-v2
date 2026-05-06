// src/api/auth.api.js
import { apiClient } from './apiClient';

export const authApi = {
    // Check if company exists via email domain
    checkDomain: async (email) => {
        const response = await apiClient.post('/auth/check-domain', { email });
        return response.data;
    },

    // Path B: Create new Workspace + Admin
    registerAdmin: async (userData) => {
        // userData requires: firstName, lastName, email, password, orgName, domain, deviceId
        const response = await apiClient.post('/auth/register/admin', userData);
        return response.data;
    },

    // Path A: Join existing Workspace as Member
    registerMember: async (userData) => {
        // userData requires: firstName, lastName, email, password, deviceId
        const response = await apiClient.post('/auth/register/member', userData);
        return response.data;
    },
    
    // Login to get tokens
    login: async (credentials) => {
        // credentials requires: email, password, deviceId
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    // Logout and destroy session in DB
    logout: async (refreshToken) => {
        const response = await apiClient.post('/auth/logout', { refreshToken });
        return response.data;
    }
};