'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    LogOut, User, Briefcase, Target, Users, 
    LayoutDashboard, Settings, Loader2, Bell 
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/api/auth.api';
import { toast } from 'sonner';

export default function DashboardPage() {
    const router = useRouter();
    // Notice we removed isAuthenticated here, as AuthGuard handles that now
    const { user, logout } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // ❌ REMOVED: The Route Protection useEffect. 
    // Your AuthGuard already does this perfectly. Having it in both places causes infinite loops!

    // Secure Logout Handler
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Tell the backend to wipe the HTTP-only refresh cookie
            await authApi.logout();
            
            // Wipe the local Zustand state
            logout();
            
            toast.success('Logged out successfully');
            router.push('/login');
        } catch (error) {
            toast.error('Failed to log out cleanly.');
            setIsLoggingOut(false);
        }
    };

    // If AuthGuard is still processing or user data hasn't populated yet, show a loader
    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center selection:bg-zinc-700 selection:text-white">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex text-zinc-100">
            {/* --- SIDEBAR --- */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
                            G
                        </div>
                        <span className="font-bold text-xl tracking-tight">Gaprio</span>
                    </div>

                    <nav className="space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-medium transition-colors">
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-xl font-medium transition-colors">
                            <Settings className="w-5 h-5" />
                            Settings
                        </button>
                    </nav>
                </div>

                {/* Bottom Sidebar: Logout */}
                <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                    {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                </button>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 p-10 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">
                            Welcome back, {user.firstName || 'User'}!
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            Here is an overview of your workspace.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button className="p-2 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-colors">
                            <Bell className="w-5 h-5 text-zinc-400" />
                        </button>
                        <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-blue-400 border border-zinc-700">
                            {user.firstName?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                {/* --- PROFILE SECTION --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm max-w-4xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Profile Overview</h2>
                            <p className="text-sm text-zinc-500">Your personalized Gaprio setup</p>
                        </div>
                        <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                            Edit Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Detail Cards */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                            <div className="p-3 bg-zinc-900 rounded-xl text-zinc-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium mb-1">Full Name</p>
                                <p className="font-semibold text-zinc-200">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-zinc-500 mt-1">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium mb-1">Primary Role</p>
                                <p className="font-semibold text-zinc-200 capitalize">{user.role || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium mb-1">Main Goal</p>
                                <p className="font-semibold text-zinc-200">{user.goal || 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium mb-1">Company Size</p>
                                <p className="font-semibold text-zinc-200">{user.companySize || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </main>
        </div>
    );
}