import { apiClient } from './apiClient';

const BASE_URL = '/integrations/google';

export const googleServiceApi = {
    // ==========================================
    // 1. OAUTH ROUTES
    // ==========================================
    getAuthUrl: async () => {
        const response = await apiClient.get(`${BASE_URL}/auth-url`);
        return response.data;
    },
    disconnect: async () => {
        const response = await apiClient.delete('/integrations/disconnect/google');
        return response.data;
    },

    // ==========================================
    // 2. CALENDAR & MEET ROUTES
    // ==========================================
    getEvents: async () => {
        const response = await apiClient.get(`${BASE_URL}/calendar/events`);
        return response.data;
    },
    checkBusySlots: async () => {
        const response = await apiClient.get(`${BASE_URL}/calendar/availability`);
        return response.data;
    },
    createMeeting: async (data) => {
        const response = await apiClient.post(`${BASE_URL}/calendar/events`, data);
        return response.data;
    },
    updateMeeting: async (eventId, data) => {
        const response = await apiClient.put(`${BASE_URL}/calendar/events/${eventId}`, data);
        return response.data;
    },
    deleteMeeting: async (eventId) => {
        const response = await apiClient.delete(`${BASE_URL}/calendar/events/${eventId}`);
        return response.data;
    },

    // ==========================================
    // 3. DRIVE ROUTES
    // ==========================================
    searchDriveFiles: async (params) => {
        const response = await apiClient.get(`${BASE_URL}/drive/files`, { params });
        return response.data;
    },
    createDriveFolder: async (data) => {
        const response = await apiClient.post(`${BASE_URL}/drive/folders`, data);
        return response.data;
    },
    uploadDriveFile: async (formData) => {
        // formData should contain the file and other fields
        const response = await apiClient.post(`${BASE_URL}/drive/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    moveDriveFile: async (fileId, data) => {
        const response = await apiClient.put(`${BASE_URL}/drive/files/${fileId}/move`, data);
        return response.data;
    },
    changeFilePermissions: async (fileId, data) => {
        const response = await apiClient.put(`${BASE_URL}/drive/files/${fileId}/permissions`, data);
        return response.data;
    },
    deleteDriveFile: async (fileId) => {
        const response = await apiClient.delete(`${BASE_URL}/drive/${fileId}`);
        return response.data;
    },

    // ==========================================
    // 4. DOCS ROUTES
    // ==========================================
    getDocText: async (documentId) => {
        const response = await apiClient.get(`${BASE_URL}/docs/${documentId}`);
        return response.data;
    },
    createNewDoc: async (data) => {
        const response = await apiClient.post(`${BASE_URL}/docs`, data);
        return response.data;
    },
    appendDocText: async (documentId, data) => {
        const response = await apiClient.put(`${BASE_URL}/docs/${documentId}/append`, data);
        return response.data;
    },

    // ==========================================
    // 5. GMAIL ROUTES
    // ==========================================
    fetchEmails: async (params) => {
        const response = await apiClient.get(`${BASE_URL}/gmail/recent`, { params });
        return response.data;
    },
    sendNewEmail: async (data) => {
        const response = await apiClient.post(`${BASE_URL}/gmail/send`, data);
        return response.data;
    },
    replyEmail: async (data) => {
        const response = await apiClient.post(`${BASE_URL}/gmail/reply`, data); // From GoogleWorkspace.jsx
        return response.data;
    },
    saveDraft: async (data) => {
        const response = await apiClient.post(`${BASE_URL}/gmail/draft`, data); // From GoogleWorkspace.jsx
        return response.data;
    },
    deleteEmail: async (id) => {
        const response = await apiClient.delete(`${BASE_URL}/gmail/${id}`); // From GoogleWorkspace.jsx
        return response.data;
    },

    // ==========================================
    // 6. SHEETS ROUTES
    // ==========================================
    createSheet: async (data) => {
        const response = await apiClient.post(`${BASE_URL}/sheets`, data);
        return response.data;
    },
    readSheet: async (spreadsheetId) => {
        const response = await apiClient.get(`${BASE_URL}/sheets/${spreadsheetId}`);
        return response.data;
    },
    appendRow: async (spreadsheetId, data) => {
        const response = await apiClient.post(`${BASE_URL}/sheets/${spreadsheetId}/append`, data);
        return response.data;
    }
};
