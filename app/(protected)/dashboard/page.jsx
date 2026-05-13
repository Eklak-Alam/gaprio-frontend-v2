'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuthStore } from '@/store/useAuthStore';
import DashboardHeader from '@/components/dashboard2/DashboardHeader';
import Greeting from '@/components/dashboard2/Greeting';
import InfoCards from '@/components/dashboard2/InfoCards';

import Sidebar from '@/components/dashboard2/Sidebar';
import GoogleWorkspace from '@/components/dashboard2/GoogleWorkspace';
import ActionPopupNotification from '@/components/dashboard2/ActionPopupNotification';

// API
import { integrationsApi } from '@/api/integrations.api';

gsap.registerPlugin(useGSAP);

export default function DashboardPage() {
    const containerRef = useRef(null);
    const { user, org } = useAuthStore();
    const [activeTab, setActiveTab] = useState('overview');
    
    // Google Workspace Data state
    const [googleData, setGoogleData] = useState({ emails: [], meetings: [], files: [] });
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);
    
    const checkGoogleConnection = () => {
        return user?.connections?.some(c => c.provider === 'google');
    };

    const fetchGoogleData = async () => {
        if (!checkGoogleConnection()) return;
        try {
            const data = await integrationsApi.getProviderData('google');
            setGoogleData(data || { emails: [], meetings: [], files: [] });
        } catch (error) {
            console.error("Failed to fetch google data", error);
        }
    };

    useEffect(() => {
        setIsGoogleConnected(checkGoogleConnection());
        if (activeTab === 'google' && checkGoogleConnection()) {
            fetchGoogleData();
        }
    }, [user, activeTab]);

    useGSAP(() => {
        if (activeTab !== 'overview') return;
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
    }, { scope: containerRef, dependencies: [activeTab] });

    if (!user) return null; // Hydration safety

    return (
        <div className="flex h-screen bg-[#0F0F0F] overflow-hidden w-full relative">
            {/* GLOBAL ACTIONS NOTIFICATION */}
            <ActionPopupNotification />
            
            {/* SIDEBAR */}
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                user={user} 
            />
            
            {/* MAIN CONTENT AREA */}
            <div ref={containerRef} className="flex-1 flex flex-col relative overflow-hidden font-sans z-0 h-full w-full">
                
                {activeTab === 'overview' && (
                    <div className="h-full flex flex-col relative overflow-y-auto w-full custom-scrollbar">
                        {/* --- PREMIUM BACKGROUND EFFECTS --- */}
                        <div className="bg-mesh absolute inset-0 -z-10" />
                        <div className="hero-grid absolute inset-0 opacity-0 -z-10" />

                        {/* HEADER COMPONENT */}
                        <div className="gsap-anim shrink-0">
                            <DashboardHeader />
                        </div>

                        {/* MAIN DASHBOARD CONTENT */}
                        <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 lg:pt-12 max-w-[1600px]">
                            
                            {/* GREETING COMPONENT */}
                            <div className="mb-8 lg:mb-12 gsap-anim">
                                <Greeting user={user} />
                            </div>

                            {/* INFO CARDS COMPONENT */}
                            <div className="gsap-anim">
                                <InfoCards user={user} org={org} />
                            </div>
                            
                        </main>
                    </div>
                )}

                {activeTab === 'google' && (
                    <div className="h-full w-full bg-[#020202]">
                        <GoogleWorkspace 
                            isConnected={isGoogleConnected} 
                            data={googleData} 
                            user={user}
                            onRefresh={fetchGoogleData}
                        />
                    </div>
                )}
                
                {/* Fallback for other tabs like 'ai', 'slack' etc */}
                {activeTab !== 'overview' && activeTab !== 'google' && (
                    <div className="h-full w-full flex items-center justify-center bg-[#020202]">
                        <p className="text-zinc-500 font-medium">This module is currently under development.</p>
                    </div>
                )}
            </div>
        </div>
    );
}