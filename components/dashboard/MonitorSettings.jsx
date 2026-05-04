'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Eye, Hash, Lock, Users, Save,
    Loader2, CheckSquare, Info, ShieldCheck, X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '@/lib/axios';

// Brand accent color
const ACCENT = '#FF8E34';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

export default function MonitorSettings() {
    const [channels, setChannels]     = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [search, setSearch]         = useState('');
    const [loading, setLoading]       = useState(true);
    const [saving, setSaving]         = useState(false);

    useEffect(() => { fetchChannels(); }, []);

    const fetchChannels = async () => {
        try {
            setLoading(true);
            const res  = await api.get('/monitoring/available-channels');
            const data = res.data.data || [];
            setChannels(data);
            setSelectedIds(new Set(data.filter(c => c.is_monitored).map(c => c.id)));
        } catch {
            toast.error('Failed to load channels. Please try again.', { id: 'fetch-err' });
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q
            ? channels.filter(c => c.name.toLowerCase().includes(q) || c.topic?.toLowerCase().includes(q))
            : channels;
    }, [channels, search]);

    const toggleChannel = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        const toastId = toast.loading('Syncing configuration…');
        try {
            const selected = channels
                .filter(c => selectedIds.has(c.id))
                .map(c => ({ channelId: c.id, channelName: c.name }));
            await api.post('/monitoring/channels', { platform: 'slack', channels: selected });
            toast.success(`${selected.length} channel${selected.length !== 1 ? 's' : ''} saved successfully!`, { id: toastId });
        } catch {
            toast.error('Save failed. Please try again.', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {/* ── Toast renderer ── */}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#111',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                    },
                    success: { iconTheme: { primary: ACCENT, secondary: '#000' } },
                    error:   { iconTheme: { primary: '#f87171', secondary: '#000' } },
                    loading: { iconTheme: { primary: ACCENT, secondary: '#000' } },
                }}
            />

            <div
                className="w-full h-full overflow-y-auto custom-scrollbar"
                data-lenis-prevent="true"
                style={{ padding: 'clamp(12px, 2vw, 28px)' }}
            >
                {/* Full-width — no centering cap, fills whatever space the dashboard gives */}
                <div className="w-full pb-10">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-4 sm:gap-5">

                        {/* ── HEADER ── */}
                        <motion.div variants={itemVariants} className="relative bg-[#080808] border border-white/5 rounded-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF8E34]/40 to-transparent" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                            <div className="relative z-10 p-5 sm:p-7 flex flex-col gap-3">
                                <span className="inline-flex self-start items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono tracking-wider uppercase"
                                    style={{ background: `${ACCENT}15`, borderColor: `${ACCENT}30`, color: ACCENT }}>
                                    <ShieldCheck size={11} /> Security &amp; Access
                                </span>

                                <div className="flex items-center gap-2.5">
                                    <Eye size={20} style={{ color: ACCENT }} className="shrink-0" />
                                    <h2 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">Neural Monitoring</h2>
                                </div>

                                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
                                    Select which nodes Gaprio is permitted to scan. The neural agent will only analyze
                                    conversations and suggest actions for whitelisted channels.
                                </p>
                            </div>
                        </motion.div>

                        {/* ── INFO BANNER ── */}
                        <motion.div variants={itemVariants}
                            className="flex items-start gap-3 px-4 py-3.5 rounded-xl border text-xs sm:text-[13px] text-zinc-300 leading-relaxed"
                            style={{ background: `${ACCENT}08`, borderColor: `${ACCENT}18` }}>
                            <Info size={15} style={{ color: ACCENT }} className="shrink-0 mt-0.5" />
                            <p>
                                The Gaprio Agent must be <strong className="text-white">invited to a channel</strong> in Slack
                                before it appears here. Private channels remain strictly confidential until the bot is explicitly added.
                            </p>
                        </motion.div>

                        {/* ── MAIN CARD ── */}
                        <motion.div variants={itemVariants} className="bg-[#080808] border border-white/5 rounded-2xl flex flex-col shadow-2xl overflow-hidden">

                            {/* Sticky toolbar */}
                            <div className="sticky top-0 z-20 bg-[#0a0a0a] border-b border-white/5 p-3 sm:p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                {/* Search */}
                                <div className="relative flex-1 min-w-0">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                    {search && (
                                        <button onClick={() => setSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                                            <X size={14} />
                                        </button>
                                    )}
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search channels…"
                                        className="w-full bg-[#050505] border border-white/8 rounded-xl py-2.5 pl-9 pr-9 text-[13px] text-white focus:outline-none transition-colors placeholder:text-zinc-600 font-mono"
                                        style={{ '--tw-ring-color': `${ACCENT}50` }}
                                        onFocus={e => e.target.style.borderColor = `${ACCENT}50`}
                                        onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                    />
                                </div>

                                {/* Controls row */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Select / Clear pill */}
                                    <div className="flex items-center bg-[#050505] border border-white/8 p-1 rounded-xl gap-0.5">
                                        <button onClick={() => setSelectedIds(new Set(filtered.map(c => c.id)))}
                                            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap">
                                            All
                                        </button>
                                        <button onClick={() => setSelectedIds(new Set())}
                                            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                            Clear
                                        </button>
                                    </div>

                                    {/* Counter badge */}
                                    <span className="hidden sm:inline-flex items-center text-[11px] font-mono text-zinc-500">
                                        <span className="text-zinc-200 font-bold mr-1">{selectedIds.size}</span>
                                        / {channels.length}
                                    </span>

                                    {/* Save button */}
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || channels.length === 0}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 text-black whitespace-nowrap shadow-lg"
                                        style={{ background: saving ? `${ACCENT}90` : ACCENT }}
                                    >
                                        {saving
                                            ? <><Loader2 size={14} className="animate-spin" /> Syncing…</>
                                            : <><Save size={14} /> Apply</>
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Channel list */}
                            <div className="p-2 sm:p-3 bg-[#050505]">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                                        <Loader2 size={24} className="animate-spin" style={{ color: ACCENT }} />
                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Scanning network…</span>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                                        <div className="w-12 h-12 bg-white/5 border border-white/8 rounded-xl flex items-center justify-center text-zinc-600 mb-1">
                                            <Hash size={20} />
                                        </div>
                                        <p className="text-zinc-300 text-sm font-semibold">No channels found</p>
                                        <p className="text-zinc-600 text-xs text-center max-w-[220px]">
                                            Try a different search, or invite Gaprio to more Slack channels.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <AnimatePresence>
                                            {filtered.map(channel => {
                                                const isSelected = selectedIds.has(channel.id);
                                                return (
                                                    <motion.button
                                                        layout
                                                        key={channel.id}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.97 }}
                                                        onClick={() => toggleChannel(channel.id)}
                                                        className={`w-full flex items-center justify-between gap-3 px-3 sm:px-4 py-3 rounded-xl text-left transition-all border outline-none group ${
                                                            isSelected
                                                                ? 'border-[#FF8E34]/20'
                                                                : 'bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5'
                                                        }`}
                                                        style={isSelected ? { background: `${ACCENT}08` } : {}}
                                                    >
                                                        {/* Left: checkbox + icon + name */}
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {/* Checkbox */}
                                                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-[5px] flex items-center justify-center shrink-0 border transition-all ${
                                                                isSelected ? 'border-0 text-black' : 'bg-[#080808] border-zinc-700 text-transparent group-hover:border-zinc-500'
                                                            }`} style={isSelected ? { background: ACCENT, boxShadow: `0 0 8px ${ACCENT}55` } : {}}>
                                                                <CheckSquare size={10} strokeWidth={3} />
                                                            </div>

                                                            {/* Channel icon */}
                                                            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                                                isSelected ? 'text-white' : 'bg-white/5 text-zinc-500 group-hover:text-zinc-300'
                                                            }`} style={isSelected ? { background: `${ACCENT}22`, color: ACCENT } : {}}>
                                                                {channel.is_private ? <Lock size={14} /> : <Hash size={14} />}
                                                            </div>

                                                            {/* Name + topic */}
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className={`text-[13px] sm:text-sm font-semibold truncate transition-colors ${isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                                                                        {channel.name}
                                                                    </span>
                                                                    {channel.is_monitored && !isSelected && (
                                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono tracking-wider uppercase border border-zinc-700/60">
                                                                            Synced
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {channel.topic && (
                                                                    <p className="text-[11px] text-zinc-500 truncate">{channel.topic}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Right: member count */}
                                                        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 shrink-0 bg-white/4 px-2 py-1 rounded-md border border-white/5">
                                                            <Users size={12} className="text-zinc-600" />
                                                            {channel.num_members}
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                    </motion.div>
                </div>
            </div>
        </>
    );
}