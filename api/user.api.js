import { apiClient } from './apiClient';

export const userApi = {
    /**
     * Fetches the user profile, onboarding status, and active integrations.
     * Backend returns: { success: true, data: { profile: { ..., activeConnections: [] } } }
     */
    getProfile: async () => {
        try {
            const response = await apiClient.get('/users/profile');
            // We return the whole body so the components can access response.data.profile
            return response.data; 
        } catch (error) {
            console.error("Error fetching profile:", error);
            throw error;
        }
    },
    
    /**
     * Updates profile fields (role, goal, companySize, etc.)
     * This is called during the Onboarding flow.
     */
    updateProfile: async (profileData) => {
        try {
            const response = await apiClient.patch('/users/profile', profileData);
            return response.data;
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    },

    /**
     * Updates the user's password.
     * Expects: { oldPassword, newPassword }
     */
    changePassword: async (passwordData) => {
        try {
            const response = await apiClient.put('/users/change-password', passwordData);
            return response.data;
        } catch (error) {
            console.error("Error changing password:", error);
            throw error;
        }
    }
};