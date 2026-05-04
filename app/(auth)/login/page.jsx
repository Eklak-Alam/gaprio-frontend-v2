'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Loader2, ShieldCheck, Activity } from 'lucide-react';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/useAuthStore';

gsap.registerPlugin(useGSAP);

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const containerRef = useRef(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authApi.login(formData);
            setAuth(response.data.user, response.data.accessToken);
            toast.success('Authentication successful. Welcome back.');
            router.push(response.data.nextStep || '/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Access denied. Invalid credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- ENTERPRISE GSAP ANIMATIONS ---
    useGSAP(() => {
        const tl = gsap.timeline();

        // 1. Form Elements (Sharp, precise slide up)
        tl.from('.gsap-form-item', { 
            y: 10, 
            opacity: 0, 
            duration: 0.4, 
            stagger: 0.05, 
            ease: 'power2.out',
            delay: 0.1 
        });

        // 2. Right Side Content Fade
        tl.from('.gsap-visual-text', {
            opacity: 0,
            x: 20,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.2');

        // 3. Terminal Boot Sequence
        tl.from('.gsap-terminal-window', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'expo.out'
        }, '-=0.4')
        .from('.gsap-terminal-line', {
            opacity: 0,
            x: -10,
            duration: 0.3,
            stagger: 0.15,
            ease: 'power1.out'
        });

    }, { scope: containerRef });

    return (
        // Removed pt-20 for perfect vertical centering
        <div ref={containerRef} className="min-h-screen flex bg-[#050505] font-sans selection:bg-zinc-700 selection:text-white">
            
            <style dangerouslySetInnerHTML={{__html: `
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px #0A0A0A inset !important;
                    -webkit-text-fill-color: #FFFFFF !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}} />

            {/* =========================================
                LEFT SIDE: THE FORM (Minimalist & Icon-less)
                ========================================= */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-10 relative z-10">
                <div className="w-full max-w-[380px]"> 
                    
                    <div className="mb-10 relative h-10 w-auto flex justify-start gsap-form-item">
                        <img src="/logo2.png" alt="Gaprio Logo" className="h-full object-contain" />
                    </div>

                    <div className="mb-10 gsap-form-item">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            Authenticate to access your Gaprio workspace.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5"> 
                        <div className="gsap-form-item">
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">Work Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="work@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#FC8B32] focus:ring-1 focus:ring-[#FC8B32]/30 transition-all"
                            />
                        </div>

                        <div className="gsap-form-item">
                            <div className="flex justify-between items-baseline mb-1.5">
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">Security Key</label>
                                <button type="button" className="text-xs text-zinc-500 hover:text-[#FC8B32] transition-colors">
                                    Forgot credentials?
                                </button>
                            </div>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#FC8B32] focus:ring-1 focus:ring-[#FC8B32]/30 transition-all"
                            />
                        </div>

                        <div className="gsap-form-item pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>Authenticate</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="gsap-form-item mt-8 text-center text-sm text-zinc-500">
                        Need an account?{' '}
                        <button 
                            onClick={() => router.push('/register')} 
                            className="text-white hover:text-[#FC8B32] font-medium transition-colors"
                        >
                            Initialize workspace
                        </button>
                    </div>
                </div>
            </div>

            {/* =========================================
                RIGHT SIDE: ENTERPRISE DATA VISUALIZATION
                ========================================= */}
            <div className="hidden lg:flex w-[55%] relative bg-[#0A0A0A] border-l border-white/[0.05] overflow-hidden flex-col justify-center p-16 xl:p-24">
                
                {/* Structural Architectural Grid */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom_right,black,transparent_80%)]" />
                </div>

                <div className="relative z-10 max-w-xl">
                    
                    {/* Header Copy */}
                    <div className="mb-12">
                        <div className="gsap-visual-text flex items-center gap-2 text-[#FC8B32] text-xs font-mono tracking-widest uppercase mb-4">
                            <Activity className="w-4 h-4" />
                            Secure Gateway
                        </div>
                        <h2 className="gsap-visual-text text-3xl xl:text-4xl font-semibold text-white leading-tight mb-4 tracking-tight">
                            Enterprise Security. <br/>Zero Friction.
                        </h2>
                        <p className="gsap-visual-text text-zinc-400 text-base leading-relaxed">
                            Gaprio respects existing access rules. Your data remains encrypted in transit and at rest, ensuring your workflow operates within strict compliance boundaries.
                        </p>
                    </div>

                    {/* The "Authentication Core" Terminal UI */}
                    <div className="gsap-terminal-window bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-2xl font-mono text-xs sm:text-sm">
                        
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                </div>
                                <span className="text-zinc-500">Auth Gateway v2.1</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-500">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>ENCRYPTED</span>
                            </div>
                        </div>

                        {/* Terminal Output */}
                        <div className="p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#FC8B32] animate-pulse shadow-[0_0_8px_#FC8B32]" />
                                <span className="text-[#FC8B32] font-semibold">Incoming Request: Node 4A-B</span>
                            </div>
                            
                            <div className="space-y-1.5 text-zinc-500 pt-2 border-l border-white/10 pl-5">
                                <p className="gsap-terminal-line flex gap-2">
                                    <span className="text-zinc-600">&gt;</span> 
                                    Validating identity matrix...
                                </p>
                                <p className="gsap-terminal-line flex gap-2">
                                    <span className="text-zinc-600">&gt;</span> 
                                    Checking active token registry.
                                </p>
                                <p className="gsap-terminal-line flex gap-2">
                                    <span className="text-zinc-600">&gt;</span> 
                                    Establishing secure WebSocket connection.
                                </p>
                                <p className="gsap-terminal-line flex gap-2 text-zinc-300 pt-2">
                                    <span className="text-[#FC8B32]">&gt;</span> 
                                    Awaiting credential input...
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}