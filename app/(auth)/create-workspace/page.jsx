'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, Building2, User, Mail, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/useAuthStore';

gsap.registerPlugin(useGSAP);

function CreateWorkspaceForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const containerRef = useRef(null);
    
    // Extract email from URL
    const queryEmail = searchParams.get('email') || '';
    
    const setAuth = useAuthStore((state) => state.setAuth);
    
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        password: '',
        orgName: '',
        industry: ''
    });

    useGSAP(() => {
        const tl = gsap.timeline();
        
        // Background grid slow fade in
        gsap.to('.hero-grid', { opacity: 0.4, duration: 2, ease: 'power2.inOut' });

        // Stagger form sections
        tl.from('.gsap-section', { 
            y: 20, 
            opacity: 0, 
            duration: 0.6, 
            stagger: 0.15, 
            ease: 'power3.out',
            delay: 0.1 
        });
    }, { scope: containerRef });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        
        if (!queryEmail) {
            toast.error("Email is missing. Please restart the process.");
            router.push('/get-started');
            return;
        }

        setIsLoading(true);

        try {
            const deviceId = localStorage.getItem('deviceId') || 'web-browser';
            const domain = queryEmail.split('@')[1]; // Extract domain for the backend
            
            // Backend will create Org + Admin User
            await authApi.registerAdmin({ 
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: queryEmail,
                password: formData.password,
                orgName: formData.orgName,
                domain: domain,
                industry: formData.industry || 'Technology',
                deviceId
            });
            
            toast.success(`Workspace deployed! Check your email.`, {
                icon: '🚀',
                style: { background: '#0c0c0c', color: '#fff', border: '1px solid #FF7F11' },
                iconTheme: { primary: '#FF7F11', secondary: '#fff' }
            });
            
            // Redirect to Verification Screen
            router.push(`/verify-email?email=${encodeURIComponent(queryEmail)}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Deployment Failed. Please try again.', {
                style: { background: '#1a0f0f', color: '#E2E8CE', border: '1px solid #7f1d1d' }
            });
            setIsLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F0F] relative overflow-hidden font-sans p-6 z-0 py-12">
            
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
            
            <div className="w-full max-w-[540px] relative z-10">
                
                {/* Header */}
                <div className="mb-8 text-center gsap-section">
                    <div className="h-10 w-auto flex justify-center mb-6">
                        <img src="/logo1.png" alt="Gaprio Logo" className="h-full object-contain" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[#FF7F11] bg-[#FF7F11]/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border border-[#FF7F11]/20">
                        <Zap className="w-3 h-3" /> Admin Setup
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Deploy your Workspace
                    </h1>
                    <p className="text-[#ACBFA4] text-sm max-w-sm mx-auto">
                        Configure your organization's core intelligence hub.
                    </p>
                </div>

                {/* Glassmorphism Form Card */}
                <form 
                    onSubmit={handleCreateSubmit} 
                    className="glass-morphism p-8 rounded-2xl shadow-2xl"
                > 
                    
                    {/* SECTION 1: ADMIN PROFILE */}
                    <div className="gsap-section mb-8">
                        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                            <User className="w-4 h-4 text-[#FF7F11]" />
                            <h2 className="text-sm font-semibold text-white tracking-wide">Administrator Identity</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3.5 w-4 h-4 text-[#ACBFA4]/50" />
                                <input 
                                    type="email" 
                                    value={queryEmail} 
                                    disabled
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-lg pl-10 pr-4 py-3 text-sm text-[#ACBFA4]/70 focus:outline-none cursor-not-allowed" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="text" 
                                    name="firstName" 
                                    placeholder="First Name" 
                                    value={formData.firstName} 
                                    onChange={handleChange} 
                                    required 
                                    autoFocus
                                    className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#E2E8CE] placeholder-[#ACBFA4]/30 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/50 transition-all shadow-inner" 
                                />
                                <input 
                                    type="text" 
                                    name="lastName" 
                                    placeholder="Last Name" 
                                    value={formData.lastName} 
                                    onChange={handleChange} 
                                    required
                                    className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#E2E8CE] placeholder-[#ACBFA4]/30 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/50 transition-all shadow-inner" 
                                />
                            </div>

                            <input 
                                type="password" 
                                name="password" 
                                placeholder="Master Password (Min 8 chars)" 
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                                minLength={8}
                                className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#E2E8CE] placeholder-[#ACBFA4]/30 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/50 transition-all shadow-inner" 
                            />
                        </div>
                    </div>

                    {/* SECTION 2: WORKSPACE SETTINGS */}
                    <div className="gsap-section mb-8">
                        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                            <Building2 className="w-4 h-4 text-[#FF7F11]" />
                            <h2 className="text-sm font-semibold text-white tracking-wide">Workspace Settings</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <input 
                                type="text" 
                                name="orgName" 
                                placeholder="Organization Name (e.g. Acme Corp)" 
                                value={formData.orgName} 
                                onChange={handleChange} 
                                required 
                                className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#E2E8CE] placeholder-[#ACBFA4]/30 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/50 transition-all shadow-inner" 
                            />
                            
                            <select
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#ACBFA4] focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/50 transition-all shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="" disabled className="text-[#ACBFA4]/30">Select Industry</option>
                                <option value="Technology">Technology & Software</option>
                                <option value="Design">Design & Creative</option>
                                <option value="Finance">Finance & Fintech</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* SUBMIT */}
                    <div className="gsap-section">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-[#FF7F11] hover:bg-[#FF9232] text-white rounded-lg py-3.5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-[0_0_15px_rgba(255,127,17,0.3)] hover:shadow-[0_0_25px_rgba(255,127,17,0.5)]"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Initialize System</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Link */}
                <div className="mt-8 text-center text-[11px] text-[#ACBFA4]/70 font-mono tracking-wide uppercase gsap-section flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#FF7F11]" />
                    <span>Admin privileges will be granted upon creation</span>
                </div>
            </div>
        </div>
    );
}

// Wrap in Suspense for searchParams
export default function CreateWorkspacePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
                <Loader2 className="w-8 h-8 text-[#FF7F11] animate-spin" />
            </div>
        }>
            <CreateWorkspaceForm />
        </Suspense>
    );
}