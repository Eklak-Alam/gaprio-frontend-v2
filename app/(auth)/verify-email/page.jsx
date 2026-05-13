'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, ShieldCheck, Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/useAuthStore';

gsap.registerPlugin(useGSAP);

function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const containerRef = useRef(null);
    const inputRefs = useRef([]);
    
    const queryEmail = searchParams.get('email') || '';
    
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [cooldown, setCooldown] = useState(60); // 60 seconds cooldown for resend
    const [canResend, setCanResend] = useState(false);

    // Entry Animations
    useGSAP(() => {
        const tl = gsap.timeline();
        
        gsap.to('.hero-grid', { opacity: 0.4, duration: 2, ease: 'power2.inOut' });

        tl.from('.gsap-anim', { 
            y: 20, 
            opacity: 0, 
            duration: 0.5, 
            stagger: 0.08, 
            ease: 'power3.out',
            delay: 0.1 
        });
    }, { scope: containerRef });

    // Resend Cooldown Timer
    useEffect(() => {
        let timer;
        if (!canResend && cooldown > 0) {
            timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
        } else if (cooldown === 0) {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [cooldown, canResend]);

    // Handle OTP Input Changes
    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        // Allow only the last character entered (in case they type fast)
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle Backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle Paste (e.g. copying 123456 from email)
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        
        if (pastedData) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            // Focus on the next empty input or the last one
            const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
            inputRefs.current[nextIndex]?.focus();
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        
        if (!queryEmail) {
            toast.error("Email is missing. Please restart the process.");
            router.push('/get-started');
            return;
        }

        const code = otp.join('');
        if (code.length !== 6) {
            toast.error("Please enter all 6 digits.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.verifyEmail({ 
                email: queryEmail,
                code: code
            });
            
            // Extract tokens and user from the new backend payload
            const { user, accessToken, refreshToken } = response;
            
            // Auto-login the user into Zustand
            const setAuth = useAuthStore.getState().setAuth;
            setAuth(user, null, accessToken, refreshToken);
            
            toast.success(`Email verified successfully!`, {
                icon: '✅',
                style: { background: '#0c0c0c', color: '#fff', border: '1px solid #FF7F11' },
                iconTheme: { primary: '#FF7F11', secondary: '#fff' }
            });
            
            // Redirect straight to Dashboard
            router.push('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification Failed. Invalid or expired code.', {
                style: { background: '#1a0f0f', color: '#E2E8CE', border: '1px solid #7f1d1d' }
            });
            setIsLoading(false);
            
            // Clear inputs on failure
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        
        setIsResending(true);
        try {
            await authApi.resendVerification({ email: queryEmail });
            toast.success("A new verification code has been sent to your email.");
            setCooldown(60);
            setCanResend(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend code.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F0F] relative overflow-hidden font-sans p-6 z-0">
            
            {/* --- PREMIUM BACKGROUND EFFECTS --- */}
            <div className="bg-mesh absolute inset-0 -z-10" />
            <div className="hero-grid absolute inset-0 opacity-0 -z-10" />
            
            <div className="w-full max-w-[460px] relative z-10">
                
                {/* Logo & Header */}
                <div className="mb-8 text-center gsap-anim">
                    <div className="h-10 w-auto flex justify-center mb-6">
                        <img src="/logo1.png" alt="Gaprio Logo" className="h-full object-contain" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[#FF7F11] bg-[#FF7F11]/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border border-[#FF7F11]/20">
                        <ShieldCheck className="w-3 h-3" /> Security Checkpoint
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Verify your Email
                    </h1>
                    <p className="text-[#ACBFA4] text-sm">
                        We've sent a 6-digit security code to your email address.
                    </p>
                </div>

                {/* Glassmorphism Form Card */}
                <form 
                    onSubmit={handleVerifySubmit} 
                    className="space-y-6 glass-morphism p-8 rounded-2xl shadow-2xl flex flex-col items-center"
                > 
                    {/* Read-only Email Field showing where we sent it */}
                    <div className="gsap-anim w-full bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#ACBFA4]/80 flex items-center justify-center gap-2 mb-2">
                        <Mail className="w-4 h-4" />
                        <span>{queryEmail || 'Loading email...'}</span>
                    </div>

                    {/* 6-Digit OTP Input Grid */}
                    <div className="gsap-anim flex justify-between w-full gap-2 sm:gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-14 sm:w-14 sm:h-16 bg-[#0F0F0F] border border-white/10 rounded-xl text-center text-xl sm:text-2xl font-bold text-[#E2E8CE] focus:outline-none focus:border-[#FF7F11] focus:ring-1 focus:ring-[#FF7F11]/50 transition-all shadow-inner"
                                maxLength={1}
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
                    <div className="gsap-anim w-full pt-2">
                        <button 
                            type="submit" 
                            disabled={isLoading || otp.join('').length !== 6}
                            className="w-full flex items-center justify-center gap-2 bg-[#FF7F11] hover:bg-[#FF9232] text-white rounded-lg py-3.5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-[0_0_15px_rgba(255,127,17,0.3)] hover:shadow-[0_0_25px_rgba(255,127,17,0.5)]"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Verify Identity</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Resend Link */}
                    <div className="gsap-anim w-full flex justify-center mt-4">
                        <button 
                            type="button"
                            onClick={handleResend}
                            disabled={!canResend || isResending}
                            className="flex items-center gap-2 text-sm text-[#ACBFA4] hover:text-[#E2E8CE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            {canResend ? "Resend Code" : `Resend Code in ${cooldown}s`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Wrap in Suspense because we are using useSearchParams()
export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
                <Loader2 className="w-8 h-8 text-[#FF7F11] animate-spin" />
            </div>
        }>
            <VerifyEmailForm />
        </Suspense>
    );
}
