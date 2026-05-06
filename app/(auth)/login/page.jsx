'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/useAuthStore';

gsap.registerPlugin(useGSAP);

export default function LoginPage() {
    const router = useRouter();
    const containerRef = useRef(null);
    const emailInputRef = useRef(null);
    
    const setAuth = useAuthStore((state) => state.setAuth);
    
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useGSAP(() => {
        const tl = gsap.timeline();
        
        // Background grid slow fade in
        gsap.to('.hero-grid', { opacity: 0.4, duration: 2, ease: 'power2.inOut' });

        // Stagger form items
        tl.from('.gsap-fade-up', { 
            y: 20, 
            opacity: 0, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: 'power3.out',
            delay: 0.1 
        });
    }, { scope: containerRef });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const deviceId = localStorage.getItem('deviceId') || 'web-browser';
            
            // Hit the login API
            const response = await authApi.login({ 
                email: formData.email,
                password: formData.password,
                deviceId
            });
            
            const { user, accessToken, refreshToken } = response.data;
            
            // Store session in Zustand
            // Note: Org details will be fetched inside the dashboard, passing a placeholder for now
            setAuth(user, { id: user.orgId }, accessToken, refreshToken);
            
            toast.success(`Welcome back, ${user.firstName}!`, {
                style: { background: '#0c0c0c', color: '#fff', border: '1px solid #FF7F11' },
                iconTheme: { primary: '#FF7F11', secondary: '#fff' }
            });
            
            // Redirect to App
            router.push('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid credentials. Access denied.', {
                style: { background: '#1a0f0f', color: '#E2E8CE', border: '1px solid #7f1d1d' }
            });
            setIsLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F0F] relative overflow-hidden font-sans p-6 z-0">
            
            {/* 🔴 CRITICAL FIX: Autofill Background Override */}
            <style dangerouslySetInnerHTML={{__html: `
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px #0F0F0F inset !important;
                    -webkit-text-fill-color: #E2E8CE !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}} />

            {/* --- PREMIUM BACKGROUND EFFECTS --- */}
            <div className="bg-mesh absolute inset-0 -z-10" />
            <div className="hero-grid absolute inset-0 opacity-0 -z-10" />
            
            <div className="w-full max-w-[420px] relative z-10">
                
                {/* Logo & Header */}
                <div className="mb-10 text-center gsap-fade-up">
                    <div className="h-12 w-auto flex justify-center mb-6">
                        <img src="/logo1.png" alt="Gaprio Logo" className="h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        System Access
                    </h1>
                    <p className="text-[#ACBFA4] text-sm">
                        Authenticate to enter your workspace.
                    </p>
                </div>

                {/* Glassmorphism Form Card */}
                <form 
                    onSubmit={handleLoginSubmit} 
                    className="space-y-6 glass-morphism p-8 rounded-2xl shadow-2xl gsap-fade-up"
                > 
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-[#ACBFA4] uppercase tracking-wider">
                            Work Email
                        </label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-4 w-4 h-4 text-[#ACBFA4]/50 pointer-events-none" />
                            <input 
                                ref={emailInputRef}
                                type="email" 
                                name="email" 
                                placeholder="name@company.com" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required
                                autoFocus
                                className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg pl-11 pr-4 py-3.5 text-sm text-[#E2E8CE] placeholder-[#ACBFA4]/30 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/50 transition-all shadow-inner" 
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-semibold text-[#ACBFA4] uppercase tracking-wider">
                                Security Key
                            </label>
                            <button type="button" className="text-[11px] font-semibold text-[#FF7F11] hover:text-[#FF9232] transition-colors">
                                Forgot?
                            </button>
                        </div>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 w-4 h-4 text-[#ACBFA4]/50 pointer-events-none" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                placeholder="••••••••••••" 
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                                className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg pl-11 pr-11 py-3.5 text-sm text-[#E2E8CE] placeholder-[#ACBFA4]/30 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/50 transition-all shadow-inner" 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 p-1.5 text-[#ACBFA4]/50 hover:text-[#E2E8CE] transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isLoading || !formData.email || !formData.password}
                            className="w-full flex items-center justify-center gap-2 bg-[#FF7F11] hover:bg-[#FF9232] text-white rounded-lg py-3.5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-[0_0_15px_rgba(255,127,17,0.3)] hover:shadow-[0_0_25px_rgba(255,127,17,0.5)]"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Authenticate</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Links */}
                <div className="mt-10 text-center text-sm text-[#ACBFA4] gsap-fade-up">
                    <p className="mb-6">
                        Don't have an account?{' '}
                        <button onClick={() => router.push('/get-started')} className="text-white hover:text-[#FF7F11] font-semibold transition-colors">
                            Initialize Core
                        </button>
                    </p>
                    
                    {/* Glow Line Separator */}
                    <div className="w-full max-w-[200px] mx-auto glow-line opacity-50 mb-6" />

                    <div className="flex items-center justify-center gap-2 text-xs text-[#ACBFA4]/70 font-mono tracking-wide uppercase">
                        <ShieldCheck className="w-4 h-4 text-[#FF7F11]" />
                        <span>Encrypted Connection Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}