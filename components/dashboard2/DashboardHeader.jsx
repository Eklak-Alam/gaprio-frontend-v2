import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/api/auth.api';
import { LogOut, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardHeader() {
    const router = useRouter();
    const { refreshToken, logout } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            if (refreshToken) await authApi.logout(refreshToken);
            logout();
            toast.success("System disconnected.", {
                style: { background: '#0c0c0c', color: '#fff', border: '1px solid #FF7F11' }
            });
            router.push('/login');
        } catch (error) {
            logout();
            router.push('/login');
        }
    };

    return (
        <header className="w-full border-b border-white/5 glass-morphism px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <img src="/logo1.png" alt="Gaprio Logo" className="h-8 object-contain" />
                <span className="text-white font-bold text-lg tracking-tight">Gaprio Core</span>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2 text-xs text-[#ACBFA4] font-mono uppercase tracking-widest bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/5">
                    <Activity className="w-3 h-3 text-emerald-500" /> System Online
                </div>
                
                <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 text-sm font-semibold text-[#ACBFA4] hover:text-[#FF7F11] transition-colors"
                >
                    {isLoggingOut ? <Activity className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    Disconnect
                </button>
            </div>
        </header>
    );
}