'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuthStore } from '@/store/useAuthStore';
import DashboardHeader from '@/components/dashboard2/DashboardHeader';
import Greeting from '@/components/dashboard2/Greeting';
import InfoCards from '@/components/dashboard2/InfoCards';

// Components Import

gsap.registerPlugin(useGSAP);

export default function DashboardPage() {
    const containerRef = useRef(null);
    const { user, org } = useAuthStore();

    useGSAP(() => {
        const tl = gsap.timeline();
        
        // Background grid slow fade in
        gsap.to('.hero-grid', { opacity: 0.3, duration: 2, ease: 'power2.inOut' });

        // Stagger all components with 'gsap-anim' class
        tl.from('.gsap-anim', { 
            y: 20, 
            opacity: 0, 
            duration: 0.6, 
            stagger: 0.1, 
            ease: 'power3.out',
            delay: 0.1 
        });
    }, { scope: containerRef });

    if (!user) return null; // Hydration safety

    return (
        <div ref={containerRef} className="min-h-screen flex flex-col bg-[#0F0F0F] relative overflow-hidden font-sans z-0">
            
            {/* --- PREMIUM BACKGROUND EFFECTS --- */}
            <div className="bg-mesh absolute inset-0 -z-10" />
            <div className="hero-grid absolute inset-0 opacity-0 -z-10" />

            {/* HEADER COMPONENT */}
            <div className="gsap-anim">
                <DashboardHeader />
            </div>

            {/* MAIN DASHBOARD CONTENT */}
            <main className="flex-1 max-w-6xl w-full mx-auto p-8 pt-12">
                
                {/* GREETING COMPONENT */}
                <div className="mb-12 gsap-anim">
                    <Greeting user={user} />
                </div>

                {/* INFO CARDS COMPONENT */}
                <div className="gsap-anim">
                    <InfoCards user={user} org={org} />
                </div>
                
            </main>
        </div>
    );
}