'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
    Mail, MessageSquare, Activity, Clock,
    ShieldCheck, Terminal, ArrowRight, CheckCircle2, Wrench
} from 'lucide-react';
import Image from 'next/image';

// ─── Animations ─────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.02 } }
};
const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

// ─── Coming‑soon toast ──────────────────────────────────────
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

// ─── Main component ──────────────────────────────────────────
export default function OverviewTab({ user, googleData, slackData, setActiveTab }) {

    const [mobileTab, setMobileTab] = useState('activity');

    const connections      = user?.connections || [];
    const activeConnections = connections.length;
    const emailCount       = googleData?.emails?.length   || 0;
    const meetingCount     = googleData?.meetings?.length || 0;
    const channelCount     = slackData?.channels?.length  || 0;

    const hour     = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    // ── unified feed ──
    const unifiedStream = useMemo(() => {
        const stream   = [];
        const timeDist = ['Just now', '3h ago', 'Yesterday', '2d ago', '3d ago', 'Last week'];

        googleData?.emails?.forEach((email, i) =>
            stream.push({
                id: `email-${i}`, type: 'google', icon: Mail,
                title:    email.subject || 'No Subject',
                subtitle: email.from?.split('<')[0].replace(/"/g, '').trim() || 'Unknown',
                preview:  email.snippet,
                source:   'Gmail',
                time:     timeDist[i % timeDist.length],
            })
        );

        slackData?.channels?.forEach((ch, i) =>
            stream.push({
                id: `slack-${i}`, type: 'slack', icon: MessageSquare,
                title:    `#${ch.name}`,
                subtitle: 'Workspace',
                preview:  ch.topic || `${ch.members_count} active members.`,
                source:   'Slack',
                time:     timeDist[(i + 1) % timeDist.length],
            })
        );

        return stream.sort((a, b) => timeDist.indexOf(a.time) - timeDist.indexOf(b.time));
    }, [googleData, slackData]);

    // ── node definitions ──
    const nodes = [
    // Active Tools
    { label: 'Google Workspace', logo: '/companylogo/google.webp', provider: 'google',  available: true,  action: () => setActiveTab('google') },
    { label: 'Slack',            logo: '/companylogo/slack.png',   provider: 'slack',   available: true,  action: () => setActiveTab('slack')  },

    // Coming Soon Tools
    { label: 'Asana',            logo: '/companylogo/asana.png',   provider: 'asana',   available: false, action: () => fireComingSoon('Asana') },
    { label: 'Miro',             logo: '/companylogo/miro.png',    provider: 'miro',    available: false, action: () => fireComingSoon('Miro')  },
    { label: 'Jira Software',    logo: '/companylogo/jira.png',    provider: 'jira',    available: false, action: () => fireComingSoon('Jira Software') },
    { label: 'Zoho CRM',         logo: '/companylogo/zoho.png',    provider: 'zoho',    available: false, action: () => fireComingSoon('Zoho CRM') },
    
    // Newly added from your TOOLS list
    { label: 'MS 365',           logo: '/companylogo/microsoft.webp', provider: 'ms365', available: false, action: () => fireComingSoon('MS 365') },
    { label: 'ClickUp',          logo: '/companylogo/clickup.png',    provider: 'clickup', available: false, action: () => fireComingSoon('ClickUp') }
    ];      

    // ── stats ──
    const stats = [
        { label: 'Nodes',  value: activeConnections, color: 'text-emerald-500', icon: CheckCircle2, hover: '',                              click: null                    },
        { label: 'Inbox',  value: emailCount,         color: 'text-zinc-500',   icon: Mail,          hover: 'group-hover/s:text-orange-400', click: () => setActiveTab('google') },
        { label: 'Slack',  value: channelCount,       color: 'text-zinc-500',   icon: MessageSquare, hover: 'group-hover/s:text-blue-400',   click: () => setActiveTab('slack')  },
        { label: 'Health', value: '100%',             color: 'text-zinc-500',   icon: Activity,      hover: '',                              click: null                    },
    ];

    return (
        <>
            <Toaster />

            {/*
              Fills the space below the topbar exactly.
              NO outer scroll — panels scroll internally.
              Width grows with viewport (no artificial cap that ignores sidebar).
            */}
            <div className="w-full h-full flex flex-col bg-[#020202] overflow-hidden
                px-3   py-3
                sm:px-4  sm:py-3
                md:px-5  md:py-4
                lg:px-6  lg:py-4
                xl:px-8  xl:py-5
                2xl:px-12 2xl:py-6">

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col h-full gap-2.5 sm:gap-3 lg:gap-3.5 xl:gap-4 2xl:gap-5"
                >

                    {/* ══ HERO CARD ═══════════════════════════════════════════ */}
                    <motion.div
                        variants={itemVariants}
                        className="shrink-0 flex flex-col xl:flex-row xl:items-center justify-between
                            gap-3 xl:gap-6
                            bg-[#050505] border border-white/[0.06] rounded-xl xl:rounded-2xl
                            px-4 py-4
                            sm:px-5  sm:py-4
                            lg:px-6  lg:py-5
                            xl:px-8  xl:py-6
                            2xl:px-10 2xl:py-7
                            relative overflow-hidden shadow-lg"
                    >
                        {/* shimmer top line */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
                        {/* subtle grid */}
                        <div className="absolute inset-0 pointer-events-none
                            bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)]
                            bg-[size:20px_20px]
                            [mask-image:radial-gradient(ellipse_70%_80%_at_30%_0%,#000_50%,transparent_100%)]" />

                        {/* LEFT – greeting text */}
                        <div className="relative z-10 flex-1 min-w-0">
                            <h1 className="font-extrabold tracking-tight leading-none text-white
                                text-[18px]
                                sm:text-[20px]
                                md:text-[22px]
                                lg:text-[24px]
                                xl:text-[26px]
                                2xl:text-[32px]
                                mb-1.5 lg:mb-2">
                                {greeting},&nbsp;
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                                    {user?.full_name?.split(' ')[0] || 'Admin'}
                                </span>.
                            </h1>
                            <p className="text-zinc-400 leading-relaxed
                                text-[11px]
                                sm:text-[11px]
                                lg:text-[12px]
                                xl:text-[12px]
                                2xl:text-[14px]
                                max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg">
                                Neural workspace synchronization complete. You have&nbsp;
                                <span className="text-white font-semibold">{meetingCount}</span> scheduled events and&nbsp;
                                <span className="text-orange-400 font-semibold">{emailCount}</span> pending payloads requiring your attention.
                            </p>
                        </div>

                        {/* RIGHT – stats + buttons */}
                        <div className="relative z-10 flex flex-col xl:items-end gap-3 xl:gap-4 shrink-0">

                            {/* Stats row */}
                            <div className="flex items-end gap-4 sm:gap-6 lg:gap-7 xl:gap-8 2xl:gap-10">
                                {stats.map(({ label, value, color, icon: Icon, hover, click }) => (
                                    <div
                                        key={label}
                                        onClick={click || undefined}
                                        className={`flex flex-col ${click ? 'cursor-pointer group/s' : ''}`}
                                    >
                                        <span className={`flex items-center gap-1
                                            text-[8px] sm:text-[8px] lg:text-[9px] xl:text-[9px] 2xl:text-[10px]
                                            font-bold uppercase tracking-widest mb-1
                                            ${color} ${hover} transition-colors`}>
                                            <Icon size={8} className="xl:w-2.5 xl:h-2.5" />
                                            {label}
                                        </span>
                                        <span className="font-bold text-zinc-100 leading-none
                                            text-[18px]
                                            sm:text-[20px]
                                            lg:text-[22px]
                                            xl:text-[24px]
                                            2xl:text-[30px]">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5
                                    px-3 py-1.5
                                    lg:px-4 lg:py-2
                                    xl:px-5 xl:py-2
                                    2xl:px-6 2xl:py-2.5
                                    bg-[#0d0d0d] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/10
                                    text-zinc-400 hover:text-zinc-200
                                    rounded-lg xl:rounded-xl
                                    text-[10px] lg:text-[11px] xl:text-[11px] 2xl:text-[13px]
                                    font-semibold transition-all">
                                    <Terminal size={10} className="lg:w-3 lg:h-3 xl:w-3 xl:h-3" />
                                    View Logs
                                </button>
                                <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5
                                    px-4 py-1.5
                                    lg:px-5 lg:py-2
                                    xl:px-6 xl:py-2
                                    2xl:px-7 2xl:py-2.5
                                    bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90
                                    text-black font-bold
                                    rounded-lg xl:rounded-xl
                                    text-[10px] lg:text-[11px] xl:text-[11px] 2xl:text-[13px]
                                    transition-all shadow-md active:scale-[0.98]">
                                    Diagnostics
                                    <ArrowRight size={10} className="lg:w-3 lg:h-3 xl:w-3 xl:h-3" />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* ══ MOBILE TABS ═════════════════════════════════════════ */}
                    <motion.div variants={itemVariants}
                        className="flex lg:hidden shrink-0 bg-[#080808] p-1 border border-white/[0.06] rounded-lg">
                        {[{ k: 'activity', label: 'Stream', icon: Clock }, { k: 'nodes', label: 'Nodes', icon: ShieldCheck }].map(({ k, label, icon: Icon }) => (
                            <button key={k} onClick={() => setMobileTab(k)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] sm:text-[11px] font-bold rounded-md transition-colors
                                    ${mobileTab === k ? 'bg-[#181818] text-white border border-white/[0.07]' : 'text-zinc-500'}`}>
                                <Icon size={12} /> {label}
                            </button>
                        ))}
                    </motion.div>

                    {/* ══ BOTTOM PANELS — flex‑1 fills remaining height ═══════ */}
                    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 lg:gap-3.5 xl:gap-4 2xl:gap-5">

                        {/* ── ACTIVITY FEED ─────────────────────────────────── */}
                        <motion.div variants={itemVariants}
                            className={`${mobileTab === 'activity' ? 'flex' : 'hidden'} lg:flex
                                col-span-1 lg:col-span-8 flex-col min-h-0
                                bg-[#050505] border border-white/[0.07] rounded-xl xl:rounded-2xl`}>

                            {/* header */}
                            <div className="shrink-0 flex items-center justify-between
                                px-3 py-2.5
                                lg:px-4 lg:py-2.5
                                xl:px-5 xl:py-3
                                2xl:px-6 2xl:py-3.5
                                bg-[#080808] border-b border-white/[0.05] rounded-t-xl xl:rounded-t-2xl">
                                <div className="flex items-center gap-2">
                                    <Clock size={11} className="xl:w-3 xl:h-3 text-zinc-500" />
                                    <span className="text-[9px] lg:text-[10px] xl:text-[10px] 2xl:text-[11px] font-bold text-zinc-300 uppercase tracking-widest">
                                        Unified Feed
                                    </span>
                                </div>
                                <span className="flex items-center gap-1
                                    text-[8px] lg:text-[8px] xl:text-[9px]
                                    font-mono font-bold text-orange-500 bg-orange-500/10 border border-orange-500/20
                                    px-1.5 py-0.5 rounded-md">
                                    <span className="w-1 h-1 xl:w-1.5 xl:h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                    LIVE
                                </span>
                            </div>

                            {/* scrollable list */}
                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar
                                p-2 lg:p-2.5 xl:p-3 2xl:p-4
                                space-y-1.5 xl:space-y-2">
                                {unifiedStream.length > 0 ? (
                                    unifiedStream.map((item) => (
                                        <ActivityRow key={item.id} {...item} onClick={() => setActiveTab(item.type)} />
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 gap-2">
                                        <Activity size={20} className="text-zinc-600" />
                                        <p className="text-[10px] font-semibold text-zinc-400">Inbox Clear</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* ── NEURAL NODES ──────────────────────────────────── */}
                        <motion.div variants={itemVariants}
                            className={`${mobileTab === 'nodes' ? 'flex' : 'hidden'} lg:flex
                                col-span-1 lg:col-span-4 flex-col min-h-0
                                bg-[#050505] border border-white/[0.07] rounded-xl xl:rounded-2xl`}>

                            {/* header */}
                            <div className="shrink-0 flex items-center justify-between
                                px-3 py-2.5
                                lg:px-4 lg:py-2.5
                                xl:px-5 xl:py-3
                                2xl:px-6 2xl:py-3.5
                                bg-[#080808] border-b border-white/[0.05] rounded-t-xl xl:rounded-t-2xl">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={11} className="xl:w-3 xl:h-3 text-zinc-500" />
                                    <span className="text-[9px] lg:text-[10px] xl:text-[10px] 2xl:text-[11px] font-bold text-zinc-300 uppercase tracking-widest">
                                        Nodes
                                    </span>
                                </div>
                                <span className="text-[8px] lg:text-[8px] xl:text-[9px] font-mono font-bold text-zinc-500
                                    bg-[#0f0f0f] border border-white/[0.06] px-1.5 py-0.5 rounded-md">
                                    {activeConnections}/6
                                </span>
                            </div>

                            {/* node list */}
                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar
                                p-1.5 lg:p-2 xl:p-2.5 2xl:p-3
                                space-y-0.5 xl:space-y-1">
                                {nodes.map((n) => (
                                    <NodeItem
                                        key={n.provider}
                                        label={n.label}
                                        logo={n.logo}
                                        available={n.available}
                                        isConnected={connections.some(c => c.provider === n.provider)}
                                        onClick={n.action}
                                    />
                                ))}
                            </div>
                        </motion.div>

                    </div>
                    {/* tiny bottom gap so nothing touches the edge */}
                    <div className="shrink-0 h-1 xl:h-2" />
                </motion.div>
            </div>
        </>
    );
}

// ─── Activity Row ────────────────────────────────────────────

function ActivityRow({ icon: Icon, title, subtitle, preview, source, time, onClick }) {
    return (
        <div onClick={onClick}
            className="flex flex-col
                p-2 sm:p-2.5 xl:p-3 2xl:p-3.5
                bg-[#0a0a0a] border border-white/[0.05] hover:border-white/[0.09] hover:bg-white/[0.02]
                rounded-lg xl:rounded-xl transition-all cursor-pointer group">

            {/* top row */}
            <div className="flex items-center justify-between gap-2 mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-4 h-4 xl:w-5 xl:h-5 rounded-md bg-[#050505] border border-white/[0.05]
                        flex items-center justify-center shrink-0">
                        <Icon size={8} className="xl:w-2.5 xl:h-2.5 text-zinc-500" />
                    </div>
                    <span className="text-[9px] xl:text-[10px] 2xl:text-[11px] font-semibold text-zinc-400 truncate">
                        {subtitle}
                    </span>
                    <span className="hidden sm:inline text-[7px] xl:text-[8px] font-mono text-zinc-600
                        bg-[#050505] border border-white/[0.05] px-1 py-0.5 rounded uppercase tracking-wide shrink-0">
                        {source}
                    </span>
                </div>
                <span className="text-[7px] xl:text-[8px] font-mono text-zinc-600 shrink-0">{time}</span>
            </div>

            {/* content */}
            <div className="pl-5 xl:pl-6 2xl:pl-7">
                <p className="text-[10px] xl:text-[11px] 2xl:text-[12px] font-semibold text-zinc-200 truncate leading-snug">
                    {title || 'No Subject'}
                </p>
                {preview && (
                    <p className="text-[9px] xl:text-[10px] text-zinc-500 truncate mt-0.5" title={preview}>
                        {preview.replace(/͏/g, '').trim()}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Node Item ───────────────────────────────────────────────

function NodeItem({ label, logo, isConnected, available, onClick }) {
    return (
        <div onClick={onClick}
            className={`flex items-center justify-between
                p-2 sm:p-2.5 xl:p-2.5 2xl:p-3
                border rounded-lg xl:rounded-xl transition-all cursor-pointer group
                ${available
                    ? 'border-transparent hover:bg-[#0d0d0d] hover:border-white/[0.06]'
                    : 'border-transparent hover:bg-[#0d0d0d] hover:border-white/[0.04] opacity-75 hover:opacity-90'
                }`}>

            <div className="flex items-center gap-2 xl:gap-2.5 min-w-0">
                {/* logo box */}
                <div className={`w-7 h-7 xl:w-8 xl:h-8 2xl:w-9 2xl:h-9 rounded-lg bg-[#050505] border flex items-center justify-center shrink-0
                    ${available ? 'border-white/[0.07]' : 'border-white/[0.04]'}`}>
                    {logo ? (
                        <Image src={logo} alt={label} width={14} height={14}
                            className={`object-contain xl:w-4 xl:h-4 2xl:w-[18px] 2xl:h-[18px]`} />
                    ) : (
                        <Activity size={11} className="text-zinc-500" />
                    )}
                </div>

                {/* label */}
                <div className="flex flex-col min-w-0">
                    <span className={`text-[10px] xl:text-[11px] 2xl:text-[12px] font-semibold truncate
                        ${available ? 'text-zinc-200' : 'text-zinc-200'}`}>
                        {label}
                    </span>
                    <span className={`text-[8px] xl:text-[9px] font-medium mt-0.5 truncate
                        ${available ? 'text-zinc-400' : 'text-zinc-300'}`}>
                        {available ? 'Integration Node' : 'Coming soon'}
                    </span>
                </div>
            </div>

            {/* badge */}
            <div className="shrink-0 pl-1.5">
                {!available ? (
                    <div className="flex items-center gap-1 bg-orange-500/[0.08] border border-orange-500/[0.15]
                        px-1.5 py-0.5 rounded-md">
                        <Wrench size={7} className="text-orange-400/60" />
                        <span className="hidden sm:inline text-[7px] xl:text-[7px] font-bold text-orange-400/60 uppercase tracking-widest">
                            Soon
                        </span>
                    </div>
                ) : isConnected ? (
                    <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20
                        px-1.5 py-0.5 xl:px-2 xl:py-1 rounded-md">
                        <span className="w-1 h-1 xl:w-1.5 xl:h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
                        <span className="hidden sm:inline text-[7px] xl:text-[8px] font-bold text-emerald-500 uppercase tracking-widest">
                            Linked
                        </span>
                    </div>
                ) : (
                    <div className="bg-[#0a0a0a] border border-white/[0.07] px-1.5 py-0.5 xl:px-2 xl:py-1
                        rounded-md group-hover:border-white/[0.12] transition-colors">
                        <span className="text-[7px] xl:text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                            Connect
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}