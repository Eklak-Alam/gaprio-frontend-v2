import { apiClient } from './apiClient';

export const integrationsApi = {
    /**
     * =========================================================
     * 1. OAUTH & CONNECTIONS
     * =========================================================
     */

    // Fetches the Auth URL and instantly redirects the user
    // Usage: integrationsApi.connect('google')
    connect: async (provider) => {
        try {
            const response = await apiClient.get(`/integrations/${provider}/auth-url`);
            
            const authUrl = response.data?.data?.url;
            if (authUrl) {
                // Redirect the browser to Google/Slack/Asana
                window.location.href = authUrl;
            } else {
                throw new Error("Failed to get auth URL");
            }
        } catch (error) {
            console.error(`Error connecting to ${provider}:`, error);
            throw error;
        }
    },

    /**
     * =========================================================
     * 2. FETCH DASHBOARD DATA
     * =========================================================
     */

    // Dynamically fetch data for any provider's dashboard cards
    // Usage: integrationsApi.getProviderData('google')
    getProviderData: async (provider) => {
        const response = await apiClient.get(`/integrations/${provider}/data`);
        return response.data?.data;
    },

    /**
     * =========================================================
     * 3. SPECIFIC AI & PLATFORM ACTIONS
     * =========================================================
     */

    // Slack specific
    getSlackUsers: async () => {
        const response = await apiClient.get('/integrations/slack/users');
        return response.data?.data;
    },

    getSlackDMs: async () => {
        const response = await apiClient.get('/integrations/slack/dms');
        return response.data?.data;
    },

    // Google specific
    createGoogleMeeting: async (meetingData) => {
        const response = await apiClient.post('/integrations/google/calendar/meeting', meetingData);
        return response.data?.data;
    },

    // Asana specific
    createAsanaTask: async (taskData) => {
        const response = await apiClient.post('/integrations/asana/tasks/create', taskData);
        return response.data?.data;
    }
};