'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, UserPlus, ShieldCheck, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/useAuthStore';

gsap.registerPlugin(useGSAP);

function JoinWorkspaceForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const containerRef = useRef(null);
    
    // URL se email nikalna
    const queryEmail = searchParams.get('email') || '';
    
    const setAuth = useAuthStore((state) => state.setAuth);
    
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        password: ''
    });

    useGSAP(() => {
        const tl = gsap.timeline();
        
        // Background grid slow fade in
        gsap.to('.hero-grid', { opacity: 0.4, duration: 2, ease: 'power2.inOut' });

        // Stagger form items
        tl.from('.gsap-anim', { 
            y: 20, 
            opacity: 0, 
            duration: 0.5, 
            stagger: 0.08, 
            ease: 'power3.out',
            delay: 0.1 
        });
    }, { scope: containerRef });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        
        if (!queryEmail) {
            toast.error("Email is missing. Please restart the process.");
            router.push('/get-started');
            return;
        }

        setIsLoading(true);

        try {
            const deviceId = localStorage.getItem('deviceId') || 'web-browser';
            
            // Backend will auto-match the orgId using the email domain!
            const response = await authApi.registerMember({ 
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: queryEmail,
                password: formData.password,
                deviceId
            });
            
            // response.data contains the session (user, accessToken, refreshToken)
            const { user, accessToken, refreshToken } = response.data;
            
            // Update Zustand Store
            setAuth(user, null, accessToken, refreshToken);
            
            toast.success(`Welcome aboard, ${user.firstName}! Core online.`, {
                style: { background: '#0c0c0c', color: '#fff', border: '1px solid #FF7F11' },
                iconTheme: { primary: '#FF7F11', secondary: '#fff' }
            });
            
            // Redirect to App
            router.push('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Access Denied. Verification failed.', {
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
            
            <div className="w-full max-w-[460px] relative z-10">
                
                {/* Logo & Header */}
                <div className="mb-8 text-center gsap-anim">
                    <div className="h-10 w-auto flex justify-center mb-6">
                        <img src="/logo1.png" alt="Gaprio Logo" className="h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Complete your Profile
                    </h1>
                    <p className="text-[#ACBFA4] text-sm">
                        Set up your credentials to securely join your team's workspace.
                    </p>
                </div>

                {/* Glassmorphism Form Card */}
                <form 
                    onSubmit={handleJoinSubmit} 
                    className="space-y-5 glass-morphism p-8 rounded-2xl shadow-2xl"
                > 
                    {/* Read-only Email Field */}
                    <div className="gsap-anim space-y-1.5">
                        <label className="block text-[11px] font-semibold text-[#ACBFA4] uppercase tracking-wider">
                            Authorized Email
                        </label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-3.5 w-4 h-4 text-[#ACBFA4]/50" />
                            <input 
                                type="email" 
                                value={queryEmail} 
                                disabled
                                className="w-full bg-white/[0.02] border border-white/5 rounded-lg pl-10 pr-4 py-3.5 text-sm text-[#ACBFA4]/70 focus:outline-none cursor-not-allowed" 
                            />
                        </div>
                    </div>

                    {/* Name Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="gsap-anim space-y-1.5">
                            <label className="block text-[11px] font-semibold text-[#ACBFA4] uppercase tracking-wider">
                                First Name
                            </label>
                            <input 
                                type="text" 
                                name="firstName" 
                                placeholder="Jane" 
                                value={formData.firstName} 
                                onChange={handleChange} 
                                required 
                                autoFocus
                                className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-4 py-3.5 text-sm text-[#E2E8CE] placeholder-[#ACBFA4]/30 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/50 transition-all shadow-inner" 
                            />
                        </div>
                        <div className="gsap-anim space-y-1.5">
                            <label className="block text-[11px] font-semibold text-[#ACBFA4] uppercase tracking-wider">
                                Last Name
                            </label>
                            <input 
                                type="text" 
                                name="lastName" 
                                placeholder="Doe" 
                                value={formData.lastName} 
                                onChange={handleChange} 
                                required
                                className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-4 py-3.5 text-sm text-[#E2E8CE] placeholder-[#ACBFA4]/30 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/50 transition-all shadow-inner" 
                            />
                        </div>
                    </div>

                    <div className="gsap-anim space-y-1.5">
                        <label className="block text-[11px] font-semibold text-[#ACBFA4] uppercase tracking-wider">
                            Security Key (Password)
                        </label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="••••••••••••" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            minLength={8}
                            className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-4 py-3.5 text-sm text-[#E2E8CE] placeholder-[#ACBFA4]/30 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/50 transition-all shadow-inner" 
                        />
                    </div>

                    <div className="gsap-anim pt-4">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-[#FF7F11] hover:bg-[#FF9232] text-white rounded-lg py-3.5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-[0_0_15px_rgba(255,127,17,0.3)] hover:shadow-[0_0_25px_rgba(255,127,17,0.5)]"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Deploy Core & Join</span>
                                    <UserPlus className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Link */}
                <div className="mt-8 text-center text-[11px] text-[#ACBFA4]/70 font-mono tracking-wide uppercase gsap-anim flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#FF7F11]" />
                    <span>End-to-End Encrypted Session</span>
                </div>
            </div>
        </div>
    );
}

// Wrap in Suspense because we are using useSearchParams()
export default function JoinWorkspacePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
                <Loader2 className="w-8 h-8 text-[#FF7F11] animate-spin" />
            </div>
        }>
            <JoinWorkspaceForm />
        </Suspense>
    );
}