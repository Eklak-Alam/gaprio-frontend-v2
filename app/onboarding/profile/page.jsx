'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
    Loader2, Rocket, Users, Target, Briefcase, 
    CheckCircle2, ArrowRight, Activity, ShieldCheck, 
    Zap, Terminal, Lock
} from 'lucide-react';

import { userApi } from '@/api/user.api';
import { integrationsApi } from '@/api/integrations.api';
import { useAuthStore } from '@/store/useAuthStore';

gsap.registerPlugin(useGSAP);

// --- CONFIGURATION ---
const ONBOARDING_STEPS = [
    {
        id: 'role',
        title: "Specify user role",
        subtitle: "Calibrate the AI interface for your function.",
        icon: <Briefcase className="w-4 h-4 text-[#FC8B32]" />,
        options: ['Founder', 'Product Manager', 'Developer', 'Designer', 'Marketing']
    },
    {
        id: 'companySize',
        title: "Workspace scale",
        subtitle: "Select size for infrastructure allocation.",
        icon: <Users className="w-4 h-4 text-[#FC8B32]" />,
        options: ['Solo', '2-10 Nodes', '11-50 Nodes', '50-200 Nodes', 'Enterprise (200+)']
    },
    {
        id: 'goal',
        title: "Primary objective",
        subtitle: "What is your core directive for Gaprio?",
        icon: <Target className="w-4 h-4 text-[#FC8B32]" />,
        options: ['Increase Revenue', 'Automate Workflows', 'Team Collaboration', 'Market Research']
    }
];

const INTEGRATION_STEPS = [
    {
        id: "google",
        name: "Google Workspace",
        description: "Authorize AI access to Gmail, Calendar, and Drive for organizational context.",
        icon: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
        statusText: "Waiting for Sync..."
    },
    {
        id: "slack",
        name: "Slack Communications",
        description: "Deploy Gaprio Agent to your Slack channels to monitor and automate thread coordination.",
        icon: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
        statusText: "Awaiting Channel Access..."
    },
    {
        id: "asana",
        name: "Asana Management",
        description: "Enable task orchestration and automated project tracking across your workspaces.",
        icon: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Asana_logo.svg",
        statusText: "Awaiting API Handshake..."
    }
];

export default function UnifiedSetupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // ✅ FIX 1: Bring in your updater function (e.g., setIsOnboarded or an update function)
    const { setAuth, user, setIsOnboarded } = useAuthStore(); 
    
    const containerRef = useRef(null);
    
    const [globalStep, setGlobalStep] = useState(0); 
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({ 
        role: user?.role || '', 
        goal: user?.goal || '', 
        companySize: user?.companySize || user?.company_size || '' 
    });

    // --- SMART ROUTING & OAUTH HANDLING ---
    useEffect(() => {
        const status = searchParams.get("integration");
        
        // 1. Handle returning from OAuth
        if (status === "google_success") {
            setGlobalStep(6); // Move to Slack
            toast.success("Google Core Synchronized.");
            return;
        } else if (status === "slack_success") {
            setGlobalStep(7); // Move to Asana
            toast.success("Slack Interface Linked.");
            return;
        }

        // 2. Intelligent Auto-Skip (If Phase 1 is already in DB)
        const isProfileComplete = user?.role && user?.goal && (user?.companySize || user?.company_size);
        if (isProfileComplete && globalStep === 0) {
            // Skip Welcome and Onboarding, jump straight to Deployment
            setGlobalStep(5);
        }
    }, [searchParams, user]);

    // --- ANIMATIONS ---
    useGSAP(() => {
        gsap.from('.gsap-modal', {
            y: 40, opacity: 0, duration: 1, ease: 'power4.out'
        });
        gsap.from('.gsap-bg-mesh', {
            opacity: 0, scale: 1.1, duration: 2, ease: 'power2.out'
        });
    }, { scope: containerRef });

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.fromTo('.gsap-step-content', 
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.05 }
        );
    }, { scope: containerRef, dependencies: [globalStep] });

    // --- HANDLERS ---
    const handleSelectOption = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (globalStep < 3) {
            setTimeout(() => setGlobalStep(globalStep + 1), 350);
        }
    };

    const finalizeProfileConfiguration = async () => {
        setLoading(true);
        try {
            const response = await userApi.updateProfile(formData);
            const updatedProfile = response?.data?.profile || response?.profile;
            if (updatedProfile) setAuth(updatedProfile, useAuthStore.getState().accessToken);
            
            toast.success("Intelligence calibrated. Initializing Integrations...");
            
            setGlobalStep(4);
            setTimeout(() => {
                setLoading(false);
                setGlobalStep(5);
            }, 1500);

        } catch (error) {
            toast.error(error.response?.data?.message || "Configuration failed.");
            setLoading(false);
        }
    };

    const handleConnectIntegration = async (provider) => {
        setLoading(true);
        try {
            await integrationsApi.connect(provider);
        } catch (error) {
            toast.error("Handshake failed. Retrying...");
            setLoading(false);
        }
    };

    // ✅ FIX 2: Explicitly mark onboarding as complete in Zustand before routing
    const completeSetup = () => {
        gsap.to('.gsap-modal', { scale: 0.95, opacity: 0, duration: 0.6, ease: 'power3.inOut' });
        
        // Tell your global store that onboarding is fully complete
        if (setIsOnboarded) {
            setIsOnboarded(true); 
        }
        
        setTimeout(() => router.push('/dashboard'), 600);
    };

    // --- RENDER HELPERS ---
    const isWelcome = globalStep === 0;
    const isOnboarding = globalStep >= 1 && globalStep <= 3;
    const isInterstitial = globalStep === 4;
    const isIntegration = globalStep >= 5 && globalStep <= 7;

    const currentOnboardingStep = isOnboarding ? ONBOARDING_STEPS[globalStep - 1] : null;
    const currentIntegrationStep = isIntegration ? INTEGRATION_STEPS[globalStep - 5] : null;
    const hasSelection = currentOnboardingStep ? !!formData[currentOnboardingStep.id] : false;

    return (
        <div ref={containerRef} className="min-h-[100dvh] w-full bg-[#050505] text-white flex items-center justify-center p-4 md:p-6 overflow-hidden selection:bg-zinc-700 selection:text-white" style={{ fontFamily: "'Saira', sans-serif" }}>
            
            {/* Interactive Neural Mesh Background */}
            <div className="gsap-bg-mesh fixed inset-0 z-0 pointer-events-none opacity-50">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent_100%)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FC8B32]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
            </div>

            {/* Main Application Container */}
            <div className="gsap-modal w-full h-[100dvh] md:h-[85vh] md:max-h-[700px] md:min-h-[600px] max-w-5xl flex flex-col md:flex-row bg-[#0A0A0A]/80 backdrop-blur-2xl md:border border-white/10 md:rounded-[24px] shadow-2xl relative z-10 overflow-hidden">
                
                {/* --- DYNAMIC SIDEBAR (Hidden on Mobile) --- */}
                <div className="hidden md:flex w-[300px] bg-black/50 border-r border-white/5 p-8 flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-12">
                            <Image src="/logo1.png" alt="Gaprio" width={32} height={32} />
                            <span className="font-bold text-xl tracking-tight">Gaprio</span>
                        </div>

                        {/* Phase 1: Configuration */}
                        <div className="mb-8">
                            <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">Phase 1: Configuration</h3>
                            <div className="space-y-5">
                                {ONBOARDING_STEPS.map((s, i) => {
                                    const stepIndex = i + 1;
                                    const isActive = globalStep === stepIndex;
                                    const isPast = globalStep > stepIndex;
                                    return (
                                        <div key={s.id} className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {isPast ? <CheckCircle2 className="w-4 h-4 text-[#FC8B32]" /> : (
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'border-[#FC8B32] shadow-[0_0_10px_rgba(252,139,50,0.3)]' : 'border-white/10'}`}>
                                                        {isActive && <div className="w-1.5 h-1.5 bg-[#FC8B32] rounded-full" />}
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-sm font-medium transition-colors ${isActive || isPast ? 'text-white' : 'text-zinc-600'}`}>{s.title}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Phase 2: Integration */}
                        <div className={`transition-opacity duration-500 ${globalStep >= 4 ? 'opacity-100' : 'opacity-30'}`}>
                            <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">Phase 2: Deployment</h3>
                            <div className="space-y-5">
                                {INTEGRATION_STEPS.map((s, i) => {
                                    const stepIndex = i + 5;
                                    const isActive = globalStep === stepIndex;
                                    const isPast = globalStep > stepIndex;
                                    return (
                                        <div key={s.id} className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {isPast ? <CheckCircle2 className="w-4 h-4 text-[#FC8B32]" /> : (
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'border-[#FC8B32] shadow-[0_0_10px_rgba(252,139,50,0.3)]' : 'border-white/10'}`}>
                                                        {isActive && <div className="w-1.5 h-1.5 bg-[#FC8B32] rounded-full" />}
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-sm font-medium transition-colors ${isActive || isPast ? 'text-white' : 'text-zinc-600'}`}>{s.name}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-1 relative flex flex-col p-6 md:p-12 h-full overflow-hidden">
                    
                    {/* STATE 0: WELCOME */}
                    {isWelcome && (
                        <div className="gsap-step-content flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                            <div className="w-16 h-16 relative mb-6">
                                <Image src="/logo1.png" alt="Logo" fill className="object-contain drop-shadow-[0_0_15px_rgba(252,139,50,0.4)]" />
                            </div>
                            <div className="flex items-center gap-2 text-[#FC8B32] font-mono text-[10px] tracking-[0.2em] uppercase mb-4">
                                <Activity className="w-3 h-3" /> System Initialized
                            </div>
                            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                                Welcome, <span className="text-zinc-400">{user?.first_name || "User"}</span>
                            </h1>
                            <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-10">
                                The Gaprio Agent requires workspace calibration to begin autonomous coordination via our interactive neural mesh.
                            </p>
                            <button
                                onClick={() => setGlobalStep(1)}
                                className="w-full py-4 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all group"
                            >
                                Initiate Calibration <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {/* STATE 1-3: ONBOARDING CONFIGURATION */}
                    {isOnboarding && currentOnboardingStep && (
                        <div className="flex-1 flex flex-col h-full max-w-xl mx-auto w-full">
                            <div className="gsap-step-content mb-8 mt-4 md:mt-0">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-[#FC8B32] font-mono text-[10px] tracking-widest uppercase">
                                        <Activity className="w-3 h-3 animate-pulse" /> Step {globalStep}/3
                                    </div>
                                    <span className="md:hidden text-zinc-500 text-xs font-mono">{globalStep}/3</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">{currentOnboardingStep.title}</h2>
                                <p className="text-zinc-400 text-sm md:text-base">{currentOnboardingStep.subtitle}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar pb-6 space-y-3">
                                {currentOnboardingStep.options.map((option) => {
                                    const isSelected = formData[currentOnboardingStep.id] === option;
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleSelectOption(currentOnboardingStep.id, option)}
                                            className={`gsap-step-content w-full p-4 md:p-5 rounded-2xl text-left transition-all duration-300 border flex items-center justify-between group ${
                                                isSelected 
                                                ? 'bg-[#FC8B32]/10 border-[#FC8B32] text-white shadow-[0_0_20px_rgba(252,139,50,0.15)] scale-[1.01]' 
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <span className="font-medium text-base">{option}</span>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-[#FC8B32]' : 'border-white/20 group-hover:border-white/40'}`}>
                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#FC8B32]" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="gsap-step-content pt-6 border-t border-white/5 flex justify-between items-center mt-auto">
                                <button 
                                    onClick={() => setGlobalStep(prev => prev - 1)}
                                    className="text-sm font-medium text-zinc-500 hover:text-white transition-colors px-2"
                                >
                                    Back
                                </button>
                                {globalStep === 3 ? (
                                    <button
                                        onClick={finalizeProfileConfiguration}
                                        disabled={!hasSelection || loading}
                                        className="px-8 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Compile Data <Zap className="w-4 h-4 text-[#FC8B32]" /></>}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setGlobalStep(globalStep + 1)}
                                        className={`md:hidden px-6 py-3 bg-[#FC8B32] text-black rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${hasSelection ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                    >
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STATE 4: INTERSTITIAL LOAD */}
                    {isInterstitial && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <Loader2 className="w-12 h-12 text-[#FC8B32] animate-spin mb-6" />
                            <h2 className="text-2xl font-semibold mb-2 tracking-tight text-white">Calibrating Parameters</h2>
                            <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">Optimizing Neural Mesh...</p>
                        </div>
                    )}

                    {/* STATE 5-7: INTEGRATIONS */}
                    {isIntegration && currentIntegrationStep && (
                        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
                            <div className="gsap-step-content w-full bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
                                
                                {/* Inner Glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-[#FC8B32]/50 to-transparent blur-sm" />

                                {/* Header */}
                                <div className="px-5 py-3 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                        <Terminal className="w-3 h-3 text-[#FC8B32]" /> Connect {currentIntegrationStep.name}
                                    </span>
                                    <Lock className="w-3 h-3 text-emerald-500/50" />
                                </div>

                                <div className="p-8 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center p-5 mb-6 relative group hover:border-white/30 transition-colors cursor-default">
                                        <div className="absolute inset-0 bg-[#FC8B32]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-md" />
                                        <Image src={currentIntegrationStep.icon} alt={currentIntegrationStep.name} width={40} height={40} className="object-contain relative z-10" />
                                    </div>

                                    <h2 className="text-2xl font-semibold tracking-tight mb-2 text-white">{currentIntegrationStep.name}</h2>
                                    <p className="text-zinc-400 text-sm leading-relaxed mb-8 px-2">
                                        {currentIntegrationStep.description}
                                    </p>
                                    
                                    <div className="w-full py-3 rounded-lg bg-[#FC8B32]/5 border border-[#FC8B32]/20 font-mono text-[10px] text-[#FC8B32] mb-8 flex items-center justify-center gap-2 uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#FC8B32] animate-pulse" />
                                        {currentIntegrationStep.statusText}
                                    </div>

                                    <div className="w-full space-y-3">
                                        <button
                                            onClick={() => handleConnectIntegration(currentIntegrationStep.id)}
                                            disabled={loading}
                                            className="w-full py-4 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Initialize Sync <Zap className="w-3.5 h-3.5" /></>}
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                if (globalStep < 7) setGlobalStep(globalStep + 1);
                                                else completeSetup();
                                            }}
                                            className="w-full py-3 text-zinc-500 hover:text-white text-xs font-medium transition-colors"
                                        >
                                            Skip for now
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Pagination indicator for Mobile */}
                            <div className="gsap-step-content md:hidden flex gap-2 mt-8">
                                {[5, 6, 7].map((step) => (
                                    <div key={step} className={`h-1 rounded-full transition-all duration-500 ${step === globalStep ? 'w-8 bg-[#FC8B32]' : 'w-4 bg-white/10'}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}