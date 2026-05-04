'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { waitlistApi } from '../../api/waitlist.api';

gsap.registerPlugin(useGSAP);

export default function WaitlistPage() {
    const router = useRouter();
    const containerRef = useRef(null);
    const dropdownRef = useRef(null); 
    
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        useCase: ''
    });

    const useCaseOptions = [
        "Personal / Hobby",
        "Startup",
        "Enterprise",
        "Agency / Freelance"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectUseCase = (option) => {
        setFormData({ ...formData, useCase: option });
        setIsDropdownOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await waitlistApi.joinWaitlist(formData);
            if (res.success) {
                toast.success(res.message || "Welcome to the future. You are on the list.", {
                    style: { background: '#0c0c0c', color: '#FF7F11', border: '1px solid rgba(255, 255, 255, 0.1)' }
                });
                setFormData({ name: '', email: '', role: '', useCase: '' });
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong. Please try again.", {
                style: { background: '#0c0c0c', color: '#ef4444', border: '1px solid rgba(255, 255, 255, 0.1)' }
            });
        } finally {
            setIsLoading(false);
        }
    };

    // --- ENTERPRISE GSAP ANIMATIONS ---
    useGSAP(() => {
        const tl = gsap.timeline();

        tl.from('.gsap-form-item', { 
            y: 10, 
            opacity: 0, 
            duration: 0.4, 
            stagger: 0.05, 
            ease: 'power2.out',
            delay: 0.1 
        });

        tl.from('.gsap-visual-text', {
            opacity: 0,
            x: 20,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.2');

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
        <div ref={containerRef} className="min-h-screen flex bg-[#050505] font-sans selection:bg-zinc-700 selection:text-white">
            
            {/* Autofill CSS Override */}
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
                LEFT SIDE: THE FORM 
                ========================================= */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-10 relative z-10">
                <div className="w-full max-w-[380px]"> 
                    
                    {/* Logo */}
                    <div className="mb-10 relative h-10 w-auto flex justify-start gsap-form-item">
                        <img src="/logo2.png" alt="Gaprio Logo" className="h-full object-contain" />
                    </div>

                    <div className="mb-8 gsap-form-item">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                            Secure Early Access
                        </h1>
                        <p className="text-zinc-400 text-[15px]">
                            Spots are limited. Join the elite waitlist today.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4"> 
                        
                        {/* Name Field */}
                        <div className="gsap-form-item">
                            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="John Doe (Optional)"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3.5 text-[16px] text-white placeholder-zinc-700 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/30 transition-all"
                            />
                        </div>

                        {/* Email Field */}
                        <div className="gsap-form-item">
                            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Work Email *</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="work@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3.5 text-[16px] text-white placeholder-zinc-700 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/30 transition-all"
                            />
                        </div>

                        {/* Role & Use Case Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="gsap-form-item relative z-10">
                                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Role</label>
                                <input
                                    type="text"
                                    name="role"
                                    placeholder="Your Role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3.5 text-[16px] text-white placeholder-zinc-700 focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/30 transition-all"
                                />
                            </div>

                            {/* CUSTOM DROPDOWN IMPLEMENTATION WITH Z-INDEX FIX */}
                            <div 
                                className={`gsap-form-item relative ${isDropdownOpen ? 'z-[99]' : 'z-20'}`} 
                                ref={dropdownRef}
                            >
                                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Use Case</label>
                                
                                {/* Custom Select Trigger */}
                                <div 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full bg-[#0A0A0A] border rounded-lg px-4 py-3.5 text-[16px] flex justify-between items-center cursor-pointer transition-all duration-300 ${isDropdownOpen ? 'border-[#FF7F11] ring-1 ring-[#FF7F11]/30' : 'border-white/10'}`}
                                >
                                    <span className={`block truncate ${formData.useCase ? "text-white" : "text-zinc-700"}`}>
                                        {formData.useCase || "Select..."}
                                    </span>
                                    
                                    {/* Pure CSS Triangle Arrow */}
                                    <div className={`w-0 h-0 ml-2 flex-shrink-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent transition-transform duration-300 ${isDropdownOpen ? 'border-t-[#FF7F11] rotate-180' : 'border-t-zinc-500'}`}></div>
                                </div>

                                {/* Custom Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#0c0c0c] border border-white/10 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        {useCaseOptions.map((option, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => handleSelectUseCase(option)}
                                                className={`px-4 py-3.5 text-[16px] cursor-pointer transition-colors duration-150 border-b border-white/5 last:border-0 ${formData.useCase === option ? 'bg-[#FF7F11]/10 text-[#FF7F11] font-medium' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="gsap-form-item pt-4 relative z-0">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black rounded-lg py-3.5 text-[16px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        Requesting Access...
                                    </span>
                                ) : (
                                    "Request Access"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* =========================================
                RIGHT SIDE: ENTERPRISE DATA VISUALIZATION
                ========================================= */}
            <div className="hidden lg:flex w-[55%] relative bg-[#0A0A0A] border-l border-white/[0.05] overflow-hidden flex-col justify-center p-16 xl:p-24">
                
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom_right,black,transparent_80%)]" />
                </div>

                <div className="relative z-10 max-w-xl">
                    <div className="mb-12">
                        <div className="gsap-visual-text flex items-center gap-2 text-[#FF7F11] text-xs font-mono tracking-widest uppercase mb-4">
                            <div className="w-2 h-2 bg-[#FF7F11] animate-pulse"></div>
                            Priority Queue
                        </div>
                        <h2 className="gsap-visual-text text-3xl xl:text-4xl font-semibold text-white leading-tight mb-4 tracking-tight">
                            The AI Brain. <br/>For Your Enterprise.
                        </h2>
                        <p className="gsap-visual-text text-zinc-400 text-[16px] leading-relaxed">
                            Gaprio sits above your existing tools, understands conversations, documents, and tasks together, and turns everyday coordination into automated outcomes.
                        </p>
                    </div>

                    <div className="gsap-terminal-window bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-2xl font-mono text-xs sm:text-sm">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                </div>
                                <span className="text-zinc-500">Allocation Gateway v1.0</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-500 font-semibold text-[10px] tracking-widest">
                                [ SECURE ]
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#FF7F11] animate-pulse shadow-[0_0_8px_#FF7F11]" />
                                <span className="text-[#FF7F11] font-semibold">Incoming Request: Waitlist Registration</span>
                            </div>
                            
                            <div className="space-y-1.5 text-zinc-500 pt-2 border-l border-white/10 pl-5">
                                <p className="gsap-terminal-line flex gap-2">
                                    <span className="text-zinc-600">&gt;</span> 
                                    Initializing waitlist protocol...
                                </p>
                                <p className="gsap-terminal-line flex gap-2">
                                    <span className="text-zinc-600">&gt;</span> 
                                    Validating network origin.
                                </p>
                                <p className="gsap-terminal-line flex gap-2">
                                    <span className="text-zinc-600">&gt;</span> 
                                    Preparing secure allocation slot.
                                </p>
                                <p className="gsap-terminal-line flex gap-2 text-zinc-300 pt-2">
                                    <span className="text-[#FF7F11]">&gt;</span> 
                                    Awaiting user profile data...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}