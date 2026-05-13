'use client';

import {
    LayoutGrid, Settings, Sparkles, X, Eye, Wrench, Zap, Clock
} from 'lucide-react';
import Image from 'next/image';
import { Saira } from 'next/font/google';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const saira = Saira({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700']
});

// ─────────────────────────────────────────────────────────────────────────────
//  TOAST HELPERS
//  <Toaster /> lives in page.jsx (root) — NOT here.
//  These just call toast.custom(). They work as long as <Toaster /> exists
//  somewhere above in the tree.
// ─────────────────────────────────────────────────────────────────────────────

function fireComingSoon(label) {
    toast.custom(
        (t) => (
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: t.visible ? 1 : 0, y: t.visible ? 0 : 12, scale: t.visible ? 1 : 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl"
            >
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <Wrench size={13} className="text-orange-400" />
                </div>
                <div>
                    <p className="text-[12px] font-bold text-white leading-tight">{label}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">We're building this. Coming soon!</p>
                </div>
            </motion.div>
        ),
        { duration: 3000, position: 'bottom-right' }
    );
}

export function fireConnecting(label) {
    toast.custom(
        (t) => (
            <motion.div
                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                animate={{
                    opacity: t.visible ? 1 : 0,
                    x: t.visible ? 0 : 60,
                    scale: t.visible ? 1 : 0.92,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="pointer-events-auto flex items-center gap-3.5
                    bg-[#111111] border border-emerald-500/[0.15]
                    rounded-2xl px-4 py-3.5
                    shadow-[0_16px_48px_rgba(0,0,0,0.7),0_0_0_1px_rgba(16,185,129,0.03)]
                    w-[300px] sm:w-[320px]"
            >
                {/* Icon bubble */}
                <div className="w-10 h-10 rounded-xl shrink-0
                    bg-gradient-to-br from-emerald-500/15 to-emerald-500/5
                    border border-emerald-500/20
                    flex items-center justify-center">
                    <Zap size={15} className="text-emerald-400" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-white leading-tight tracking-tight mb-0.5">
                        Connecting {label}
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-snug flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        Establishing secure connection…
                    </p>
                </div>

                {/* Dismiss */}
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg
                        text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06]
                        transition-all duration-150"
                >
                    <X size={11} strokeWidth={2.5} />
                </button>
            </motion.div>
        ),
        {
            id: `connecting-${label}`,
            duration: 2500,
            position: 'bottom-right',
        }
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SIDEBAR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Sidebar({
    activeTab,
    setActiveTab,
    user,
    onOpenProfile,
    onClose,
    onOpenAI,
    onOpenSuggestions,
    pendingCount = 0,
    className = '',
    isMobile = false,
}) {
    const connections = user?.connections || [];
    const checkConn   = (provider) => connections.some(c => c.provider === provider);

    const go = (tabName) => {
        if (typeof setActiveTab === 'function') setActiveTab(tabName);
        if (onClose) onClose();
    };

    const handleAiClick = () => {
        if (onOpenAI) onOpenAI();
        go('ai');
    };

    // Google / Slack: toast only when NOT yet connected, then navigate
    const handleAvailable = (provider, tabName, label) => {
        if (!checkConn(provider)) fireConnecting(label);
        go(tabName);
    };

    return (
        <aside
            className={`
                group/sidebar flex flex-col justify-between
                bg-[#0a0a0a] border-r border-white/[0.06]
                relative z-50 overflow-hidden
                transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isMobile
                    ? 'w-[260px] sm:w-[280px]'
                    : 'w-[60px] md:w-[64px] xl:w-[72px] hover:w-[240px] xl:hover:w-[260px]'}
                h-[100dvh] max-h-screen ${className}
            `}
        >
            {/* Subtle noise texture */}
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.015] pointer-events-none" />

            {/* Mobile close button */}
            <AnimatePresence>
                {isMobile && onClose && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={onClose}
                        className="absolute top-3.5 right-3.5 z-50
                            w-7 h-7 flex items-center justify-center
                            text-zinc-400 hover:text-white
                            bg-white/[0.06] hover:bg-white/[0.12]
                            rounded-full transition-all duration-150"
                    >
                        <X size={15} strokeWidth={2} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Scrollable body ───────────────────────────────────── */}
            <div
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col relative z-10
                    [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                data-lenis-prevent="true"
            >
                {/* Logo */}
                <div className="flex items-center h-10 mt-5 mb-6 w-full px-[10px]">
                    <div className="w-[40px] md:w-[44px] xl:w-[48px] h-full flex items-center justify-center shrink-0">
                        <Image
                            src="/logo1.png"
                            alt="Gaprio"
                            width={28}
                            height={28}
                            className="object-contain xl:w-[32px] xl:h-[32px]
                                drop-shadow-[0_0_10px_rgba(243,132,42,0.45)]"
                            priority
                        />
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center
                        ${isMobile
                            ? 'max-w-[200px] opacity-100 ml-2'
                            : 'max-w-0 opacity-0 group-hover/sidebar:max-w-[200px] group-hover/sidebar:opacity-100 group-hover/sidebar:ml-2'}`}
                    >
                        <span className={`text-[20px] xl:text-[22px] font-bold tracking-tight text-white ${saira.className}`}>
                            Gaprio
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-5 mb-5 px-[10px]">

                    {/* Cockpit */}
                    <div>
                        <Label isMobile={isMobile}>Cockpit</Label>
                        <div className="space-y-0.5">
                            <Item
                                icon={LayoutGrid}
                                label="System Overview"
                                isActive={activeTab === 'overview'}
                                onClick={() => go('overview')}
                                isMobile={isMobile}
                            />
                        </div>
                    </div>

                    {/* Intelligence */}
                    <div>
                        <Label isMobile={isMobile}>Intelligence</Label>
                        <div className="space-y-0.5">
                            <Item
                                imageSrc="/logo1.png"
                                label="Gaprio Intelligence"
                                isActive={activeTab === 'ai'}
                                onClick={handleAiClick}
                                isMobile={isMobile}
                                imageClass={activeTab === 'ai'
                                    ? 'drop-shadow-[0_0_8px_rgba(243,132,42,0.55)]'
                                    : ''}
                            />
                            <Item
                                icon={Sparkles}
                                label="Suggested Actions"
                                onClick={onOpenSuggestions}
                                isMobile={isMobile}
                                notificationCount={pendingCount}
                            />
                            <Item
                                icon={Eye}
                                label="Monitor Settings"
                                isActive={activeTab === 'monitor-settings'}
                                onClick={() => go('monitor-settings')}
                                isMobile={isMobile}
                            />
                        </div>
                    </div>

                    {/* Neural Nodes */}
                    <div>
                        <Label isMobile={isMobile}>Neural Nodes</Label>
                        <div className="space-y-0.5">

                            {/* ── Available integrations ── */}
                            <Item
                                imageSrc="/companylogo/google.webp"
                                label="Google Workspace"
                                isActive={activeTab === 'google'}
                                onClick={() => handleAvailable('google', 'google', 'Google Workspace')}
                                isConnected={checkConn('google')}
                                isMobile={isMobile}
                            />
                            <Item
                                imageSrc="/companylogo/slack.png"
                                label="Slack"
                                isActive={activeTab === 'slack'}
                                onClick={() => handleAvailable('slack', 'slack', 'Slack')}
                                isConnected={checkConn('slack')}
                                isMobile={isMobile}
                            />

                            {/* ── Coming soon — fully clickable, full opacity, no grayscale ── */}
                            <Item imageSrc="/companylogo/asana.png"      label="Asana"            badge="Soon" isMobile={isMobile} onClick={() => fireComingSoon('Asana')} />
                            <Item imageSrc="/companylogo/miro.png"       label="Miro"             badge="Soon" isMobile={isMobile} onClick={() => fireComingSoon('Miro')} />
                            <Item imageSrc="/companylogo/jira.png"       label="Jira Software"    badge="Soon" isMobile={isMobile} onClick={() => fireComingSoon('Jira Software')} />
                            <Item imageSrc="/companylogo/zoho.png"       label="Zoho CRM"         badge="Soon" isMobile={isMobile} onClick={() => fireComingSoon('Zoho CRM')} />
                            <Item imageSrc="/companylogo/microsoft.webp" label="Microsoft 365"    badge="Soon" isMobile={isMobile} onClick={() => fireComingSoon('Microsoft 365')} />
                            <Item imageSrc="/companylogo/clickup.png"    label="ClickUp"          badge="Soon" isMobile={isMobile} onClick={() => fireComingSoon('ClickUp')} />
                        </div>
                    </div>
                </nav>
            </div>

            {/* ── Profile footer ────────────────────────────────────── */}
            <div className={`
                px-[10px] border-t border-white/[0.05] bg-[#0a0a0a]
                shrink-0 z-20 w-full pt-2.5
                ${isMobile ? 'pb-6' : 'pb-4'}
            `}>
                <button
                    onClick={onOpenProfile}
                    className="w-full h-[44px] xl:h-[48px] flex items-center
                        rounded-xl hover:bg-white/[0.05]
                        transition-colors duration-200 group outline-none"
                >
                    {/* Avatar */}
                    <div className="w-[40px] md:w-[44px] xl:w-[48px] h-full flex items-center justify-center shrink-0">
                        <div className="relative w-7 h-7 xl:w-8 xl:h-8 rounded-full
                            bg-gradient-to-tr from-amber-600 to-[#F3842A]
                            flex items-center justify-center
                            text-[11px] xl:text-[12px] font-bold text-black
                            shadow-[0_0_12px_rgba(243,132,42,0.3)]
                            group-hover:scale-105 transition-transform duration-200">
                            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            <span className="absolute -bottom-0.5 -right-0.5
                                w-2 h-2 xl:w-2.5 xl:h-2.5
                                bg-emerald-500 border-[2px] border-[#0a0a0a] rounded-full" />
                        </div>
                    </div>

                    {/* Name + settings */}
                    <div className={`flex flex-col items-start justify-center overflow-hidden whitespace-nowrap
                        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${isMobile
                            ? 'max-w-[180px] opacity-100 ml-2'
                            : 'max-w-0 opacity-0 group-hover/sidebar:max-w-[180px] group-hover/sidebar:opacity-100 group-hover/sidebar:ml-2'}`}
                    >
                        <p className="text-[12px] xl:text-[13px] font-semibold text-zinc-100 truncate group-hover:text-white transition-colors">
                            {user?.full_name || 'System Admin'}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <Settings
                                size={9}
                                className="text-zinc-600 group-hover:text-[#F3842A] group-hover:rotate-90 transition-all duration-500"
                            />
                            <p className="text-[9px] xl:text-[10px] font-semibold text-zinc-600 group-hover:text-[#F3842A] uppercase tracking-widest transition-colors">
                                Settings
                            </p>
                        </div>
                    </div>
                </button>
            </div>
        </aside>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Label({ children, isMobile }) {
    return (
        <div className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isMobile
                ? 'max-h-8 opacity-100'
                : 'max-h-0 opacity-0 group-hover/sidebar:max-h-8 group-hover/sidebar:opacity-100'}`}
        >
            <h3 className="px-2 pb-1.5 text-[9px] xl:text-[10px] font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap">
                {children}
            </h3>
        </div>
    );
}

function Item({
    icon: Icon,
    imageSrc,
    label,
    isActive = false,
    onClick,
    isConnected = false,
    badge,
    isMobile = false,
    notificationCount = 0,
    imageClass = '',
}) {
    const colW = 'w-[40px] md:w-[44px] xl:w-[48px]';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                group w-full flex items-center
                h-[36px] xl:h-[40px]
                rounded-xl transition-all duration-150 outline-none cursor-pointer
                ${isActive
                    ? 'bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'hover:bg-white/[0.05]'}
            `}
        >
            {/* Icon / image */}
            <div className={`${colW} h-full flex items-center justify-center shrink-0 relative`}>
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={label}
                        width={18}
                        height={18}
                        className={`object-contain xl:w-5 xl:h-5
                            transition-transform duration-200 group-hover:scale-110
                            ${imageClass}`}
                        style={{ width: 18, height: 18 }}
                    />
                ) : (
                    <Icon
                        size={18}
                        strokeWidth={1.5}
                        className={`xl:w-5 xl:h-5 transition-colors duration-200
                            ${isActive ? 'text-[#F3842A]' : 'text-zinc-500 group-hover:text-zinc-200'}`}
                    />
                )}

                {/* Connected dot — shown when sidebar is collapsed */}
                {isConnected && (
                    <span className={`
                        absolute top-[8px] right-[8px] xl:top-[9px] xl:right-[9px]
                        w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0a0a0a] z-10
                        transition-opacity duration-300
                        ${isMobile ? 'opacity-0' : 'opacity-100 group-hover/sidebar:opacity-0'}
                    `} />
                )}

                {/* Notification dot — shown when collapsed */}
                {notificationCount > 0 && (
                    <span className={`
                        absolute top-[8px] right-[8px] xl:top-[9px] xl:right-[9px]
                        w-2 h-2 bg-[#F3842A] rounded-full border-2 border-[#0a0a0a] z-10
                        transition-opacity duration-300
                        ${isMobile ? 'opacity-0' : 'opacity-100 group-hover/sidebar:opacity-0'}
                    `} />
                )}
            </div>

            {/* Sliding label + badges */}
            <div className={`
                flex flex-1 items-center justify-between pr-2 overflow-hidden whitespace-nowrap
                transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isMobile
                    ? 'max-w-[180px] opacity-100 ml-1'
                    : 'max-w-0 opacity-0 group-hover/sidebar:max-w-[180px] group-hover/sidebar:opacity-100 group-hover/sidebar:ml-1'}
            `}>
                <span className={`text-[12px] xl:text-[13px] tracking-wide transition-colors
                    ${isActive ? 'text-white font-semibold' : 'text-zinc-300 font-medium group-hover:text-white'}`}>
                    {label}
                </span>

                <div className="flex items-center gap-1.5 pl-2 shrink-0">
                    {badge && (
                        <span className="text-[8px] xl:text-[9px] font-bold
                            text-[#F3842A]/80 bg-[#F3842A]/[0.1] border border-[#F3842A]/20
                            px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            {badge}
                        </span>
                    )}
                    {notificationCount > 0 && (
                        <span className="min-w-[17px] h-[17px] xl:min-w-[18px] xl:h-[18px]
                            flex items-center justify-center
                            text-[9px] xl:text-[10px] font-bold bg-[#F3842A] text-black
                            rounded-full px-1 shadow-[0_0_10px_rgba(243,132,42,0.45)]">
                            {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                    )}
                    {isConnected && (
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500
                                shadow-[0_0_5px_rgba(16,185,129,0.6)]" />
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
