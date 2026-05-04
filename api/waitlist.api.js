import { apiClient } from './apiClient';

export const waitlistApi = {
    /**
     * Submits user details to join the waitlist.
     * Backend expects: { name, email, role, useCase }
     */
    joinWaitlist: async (waitlistData) => {
        try {
            const response = await apiClient.post('/waitlist/join', waitlistData);
            return response.data;
        } catch (error) {
            console.error("Waitlist API Error:", error);
            // Re-throw the error so the UI can catch and display it
            throw error.response?.data || error;
        }
    }
};