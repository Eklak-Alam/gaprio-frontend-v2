'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { authApi } from '@/api/auth.api';

gsap.registerPlugin(useGSAP);

// const PUBLIC_DOMAINS = [
//     'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
//     'icloud.com', 'aol.com', 'proton.me', 'protonmail.com'
// ];

export default function GetStartedPage() {
    const router = useRouter();
    const containerRef = useRef(null);
    const emailInputRef = useRef(null);
    
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useGSAP(() => {
        const tl = gsap.timeline();
        
        // Form elements fade up
        tl.from('.gsap-fade-up', { 
            y: 20, 
            opacity: 0, 
            duration: 0.6, 
            stagger: 0.1, 
            ease: 'power3.out',
            delay: 0.1 
        });
        
        // Background grid slow fade in
        gsap.to('.hero-grid', { opacity: 0.4, duration: 2, ease: 'power2.inOut' });
    }, { scope: containerRef });

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        
        const currentEmail = email.toLowerCase().trim();
        const emailParts = currentEmail.split('@');
        
        if (emailParts.length !== 2) {
            toast.error('Please enter a valid email address.', {
                style: { background: '#0c0c0c', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
            });
            return;
        }

        const domain = emailParts[1];

        // 1. Frontend check: Reject public domains instantly (COMMENTED OUT TO ALLOW EVERY EMAIL)
        // if (PUBLIC_DOMAINS.includes(domain)) {
        //     toast.error(`Professional email required. @${domain} is not supported.`, {
        //         duration: 4000,
        //         style: { background: '#1a0f0f', color: '#E2E8CE', border: '1px solid #7f1d1d' }
        //     });
        //     setEmail('');
        //     setTimeout(() => emailInputRef.current?.focus(), 100);
        //     return;
        // }

        setIsLoading(true);

        try {
            // 2. Hit backend to check if the organization exists
            const response = await authApi.checkDomain(currentEmail);
            
            if (response.data.exists) {
                toast.success(`Workspace found: ${response.data.organization.name}`, {
                    style: { background: '#0c0c0c', color: '#fff', border: '1px solid #FF7F11' },
                    iconTheme: { primary: '#FF7F11', secondary: '#fff' }
                });
                router.push(`/join-workspace?email=${encodeURIComponent(currentEmail)}&orgId=${response.data.organization.id}`);
            } else {
                toast('No workspace found. Let\'s set one up.', {
                    icon: '🚀',
                    style: { background: '#0c0c0c', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
                });
                router.push(`/create-workspace?email=${encodeURIComponent(currentEmail)}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred. Please try again.', {
                style: { background: '#1a0f0f', color: '#E2E8CE', border: '1px solid #7f1d1d' }
            });
            setIsLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F0F] relative overflow-hidden font-sans p-6 z-0">
            
            {/* --- PREMIUM BACKGROUND EFFECTS --- */}
            <div className="bg-mesh absolute inset-0 -z-10" />
            <div className="hero-grid absolute inset-0 opacity-0 -z-10" />
            
            <div className="w-full max-w-[420px] relative z-10">
                
                {/* Logo & Header */}
                <div className="mb-10 text-center gsap-fade-up">
                    <div className="h-12 w-auto flex justify-center mb-8">
                        {/* 🔴 Your specific logo */}
                        <img src="/logo1.png" alt="Gaprio Logo" className="h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
                        Welcome to Gaprio
                    </h1>
                    <p className="text-[#ACBFA4] text-sm leading-relaxed max-w-[90%] mx-auto">
                        Enter your professional email to access your workspace or deploy a new intelligence core.
                    </p>
                </div>

                {/* Glassmorphism Form Card */}
                <form 
                    onSubmit={handleEmailSubmit} 
                    className="space-y-6 glass-morphism p-8 rounded-2xl shadow-2xl gsap-fade-up"
                > 
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#ACBFA4] uppercase tracking-wider">
                            Work Email
                        </label>
                        <div className="relative">
                            <input 
                                ref={emailInputRef}
                                type="email" 
                                name="email" 
                                placeholder="name@company.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required
                                autoFocus
                                className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-4 py-3.5 text-sm text-[#E2E8CE] placeholder-[#ACBFA4]/40 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/50 transition-all shadow-inner" 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading || !email}
                        className="w-full flex items-center justify-center gap-2 bg-[#FF7F11] hover:bg-[#FF9232] text-white rounded-lg py-3.5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-[0_0_15px_rgba(255,127,17,0.3)] hover:shadow-[0_0_25px_rgba(255,127,17,0.5)]"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Continue</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="mt-10 text-center text-sm text-[#ACBFA4] gsap-fade-up">
                    <p className="mb-6">
                        Already have an account?{' '}
                        <button onClick={() => router.push('/login')} className="text-white hover:text-[#FF7F11] font-semibold transition-colors">
                            Sign in
                        </button>
                    </p>
                    
                    {/* Glow Line Separator */}
                    <div className="w-full max-w-[200px] mx-auto glow-line opacity-50 mb-6" />

                    <div className="flex items-center justify-center gap-2 text-xs text-[#ACBFA4]/70 font-mono tracking-wide uppercase">
                        <ShieldCheck className="w-4 h-4 text-[#FF7F11]" />
                        <span>Enterprise Grade Security</span>
                    </div>
                </div>
            </div>
        </div>
    );
}