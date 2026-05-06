// src/api/org.api.js
import { apiClient } from './apiClient';

export const orgApi = {
    // Get workspace details and total member count
    getDetails: async () => {
        const response = await apiClient.get('/organizations');
        return response.data;
    },

    // Get list of all team members
    getMembers: async () => {
        const response = await apiClient.get('/organizations/members');
        return response.data;
    },

    // 🔴 ADMIN ONLY: Update workspace settings (name, timezone, etc.)
    updateSettings: async (settingsData) => {
        const response = await apiClient.put('/organizations/settings', settingsData);
        return response.data;
    },

    // 🔴 ADMIN ONLY: Change a member's role ('ADMIN' or 'MEMBER')
    updateMemberRole: async (userId, role) => {
        const response = await apiClient.put(`/organizations/members/${userId}/role`, { role });
        return response.data;
    },

    // 🔴 ADMIN ONLY: Kick someone out of the workspace
    removeMember: async (userId) => {
        const response = await apiClient.delete(`/organizations/members/${userId}`);
        return response.data;
    }
};