'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }) {
    const { accessToken, isHydrated, isOnboarded } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isHydrated) return; 

        const authPaths = ['/login', '/register'];
        const isAuthPage = authPaths.includes(pathname);
        const isPublicPage = pathname === '/'; 
        const isOnboardingPage = pathname === '/onboarding/profile';

        // 🔴 SCENARIO 1: No Token in LocalStorage/Session
        if (!accessToken) {
            // Kick them to login if they try to access a protected route
            if (!isAuthPage && !isPublicPage) {
                router.replace('/login');
            }
            return;
        }

        // 🟢 SCENARIO 2: User is Logged In (Token exists)
        if (accessToken) {
            
            // Case A: Token exists, but Onboarding is NOT complete
            // if (!isOnboarded) {
            //     if (!isOnboardingPage) {
            //         router.replace('/onboarding/profile');
            //     }
            //     return; 
            // }

            // Case B: Token exists AND Onboarding is complete
            if (isOnboarded) {
                // If they try to go back to login or onboarding, bounce them to the dashboard
                if (isAuthPage || isOnboardingPage || isPublicPage) {
                    router.replace('/dashboard'); 
                }
                // Otherwise, render normal things!
            }
        }
    }, [accessToken, isHydrated, isOnboarded, pathname, router]);

    // Show initializing screen while Zustand reads from localStorage
    if (!isHydrated) {
        return (
            <div className="h-[100dvh] w-full bg-[#050505] flex flex-col items-center justify-center font-saira">
                <Loader2 className="w-10 h-10 text-[#FC8B32] animate-spin mb-4" />
                <p className="text-gray-400 tracking-wider text-sm">INITIALIZING...</p>
            </div>
        );
    }

    return <>{children}</>;
}