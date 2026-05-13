'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

// 🟢 1. List saare naye Public Routes jahan bina login ke jaa sakte hain
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/get-started',
    '/join-workspace',
    '/create-workspace',
    '/verify-email'
];

export default function AuthGuard({ children }) {
    // Hum isAuthenticated use kar rahe hain jo humne naye Zustand store mein banaya tha
    const { isAuthenticated, isHydrated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Zustand localStorage read karne tak wait karo
        if (!isHydrated) return; 

        const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

        // 🔴 SCENARIO 1: No Token / Not Logged In
        if (!isAuthenticated) {
            // Agar protected route (jaise /dashboard) par jaa raha hai toh login pe feko
            if (!isPublicRoute) {
                router.replace('/login');
            } else {
                setIsChecking(false);
            }
            return;
        }

        // 🟢 SCENARIO 2: User IS Logged In
        if (isAuthenticated) {
            // Agar logged-in user public pages (like login/get-started) par aaye, toh dashboard pe bhejo
            if (isPublicRoute) {
                router.replace('/dashboard');
            } else {
                setIsChecking(false);
            }
            return;
        }

    }, [isAuthenticated, isHydrated, pathname, router]);

    // Show initializing screen while Zustand reads from localStorage or routing happens
    // 🎨 UI UPDATE: Updated to match your #f2f2f2 premium light theme
    if (!isHydrated || isChecking) {
        return (
            <div className="h-[100dvh] w-full bg-[#f2f2f2] flex flex-col items-center justify-center font-sans">
                <Loader2 className="w-8 h-8 text-zinc-900 animate-spin mb-4" />
                <p className="text-zinc-500 tracking-wider text-xs font-semibold uppercase">Verifying Session...</p>
            </div>
        );
    }

    return <>{children}</>;
}