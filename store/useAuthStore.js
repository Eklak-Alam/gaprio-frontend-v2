import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isHydrated: false, // 👈 New: Hydration track karne ke liye

            setAuth: (user, accessToken) => set({ 
                user, 
                accessToken, 
                isAuthenticated: !!accessToken 
            }),

            logout: () => set({ 
                user: null, 
                accessToken: null, 
                isAuthenticated: false 
            }),

            setHydrated: () => set({ isHydrated: true }), // 👈 Manual hydration setter
        }),
        {
            name: 'gaprio-auth',
            storage: createJSONStorage(() => localStorage),
            // partialize ko hata diya taaki token save rahe
            onRehydrateStorage: () => (state) => {
                state.setHydrated(); // Jab storage load ho jaye, hydrated true kar do
            },
        }
    )
);