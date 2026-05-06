// src/store/useAuthStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            // ========================
            // 1. STATE (The Data)
            // ========================
            user: null,
            org: null,
            accessToken: null,
            refreshToken: null, // 🟢 Added! Backend needs this for the /refresh API
            isAuthenticated: false,
            isHydrated: false, 

            // ========================
            // 2. ACTIONS (The Modifiers)
            // ========================
            
            // Call this right after Login or Register
            setAuth: (user, org, accessToken, refreshToken) => set({ 
                user, 
                org,
                accessToken, 
                refreshToken, // 🟢 Save it securely
                isAuthenticated: !!accessToken 
            }),

            // 🟢 NEW: Specifically for your apiClient.js Interceptor!
            // This updates tokens without messing with user/org data.
            refreshTokens: (accessToken, refreshToken) => set({
                accessToken,
                refreshToken,
                isAuthenticated: !!accessToken
            }),

            // Update profile data in frontend without calling API again
            updateUser: (userData) => set({ 
                user: { ...get().user, ...userData } 
            }),

            // Update workspace data in frontend
            updateOrg: (orgData) => set({ 
                org: { ...get().org, ...orgData } 
            }),

            // Wipe everything clean on Logout
            logout: () => set({ 
                user: null, 
                org: null,
                accessToken: null, 
                refreshToken: null, // 🟢 Wipe this too!
                isAuthenticated: false 
            }),

            // ========================
            // 3. HYDRATION (Next.js Safety)
            // ========================
            setHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: 'gaprio-auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                // This runs when Next.js finishes loading localStorage into Zustand
                if (state) state.setHydrated();
            },
        }
    )
);