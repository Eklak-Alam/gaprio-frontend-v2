'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Zap, Play, Pencil, Trash2, Loader2, Check,
    MessageSquare, Calendar, Mail, FileText, GitBranch, CheckSquare,
    Clock, ExternalLink, Terminal, ChevronRight
} from 'lucide-react';
import api from '@/lib/axios';

const ACCENT = '#FF8E34';

const TOOL_META = {
    slack_post_message:  { icon: MessageSquare, color: '#E01E5A', label: 'Slack' },
    slack_read_messages: { icon: MessageSquare, color: '#E01E5A', label: 'Slack' },
    asana_create_task:   { icon: CheckSquare,   color: '#F06A6A', label: 'Asana' },
    asana_list_tasks:    { icon: CheckSquare,   color: '#F06A6A', label: 'Asana' },
    google_create_draft: { icon: Mail,          color: '#4285F4', label: 'Gmail' },
    google_send_email:   { icon: Mail,          color: '#4285F4', label: 'Gmail' },
    google_list_emails:  { icon: Mail,          color: '#4285F4', label: 'Gmail' },
    google_create_event: { icon: Calendar,      color: '#0F9D58', label: 'Calendar' },
    google_list_events:  { icon: Calendar,      color: '#0F9D58', label: 'Calendar' },
    google_create_doc:   { icon: FileText,      color: '#4285F4', label: 'Docs' },
    github_create_issue: { icon: GitBranch,     color: '#8B5CF6', label: 'GitHub' },
};

function getToolMeta(t) {
    return TOOL_META[t] || { icon: Zap, color: ACCENT, label: 'Action' };
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_STYLE = {
    executed: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', text: '#4ade80', dot: '#22c55e' },
    rejected: { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  text: '#f87171', dot: '#ef4444' },
    pending:  { bg: `${ACCENT}12`,           border: `${ACCENT}30`,          text: ACCENT,    dot: ACCENT },
};

export default function SuggestedActions({ isOpen, onClose }) {
    const [actions, setActions]       = useState([]);
    const [filter, setFilter]         = useState('pending');
    const [loading, setLoading]       = useState(false);
    const [executingId, setExecutingId] = useState(null);
    const [editingId, setEditingId]   = useState(null);
    const [editParams, setEditParams] = useState({});
    const scrollRef                   = useRef(null);

    const fetchActions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/monitoring/actions', {
                params: { status: filter === 'all' ? undefined : filter }
            });
            setActions(res.data.data || []);
        } catch (err) { console.error('Failed to fetch actions:', err); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (isOpen) fetchActions(); }, [isOpen, filter]);

    useEffect(() => {
        if (!isOpen) return;
        const i = setInterval(fetchActions, 15000);
        return () => clearInterval(i);
    }, [isOpen, filter]);

    const handleExecute = async (id) => {
        setExecutingId(id);
        try { await api.post(`/monitoring/actions/${id}/execute`); fetchActions(); }
        catch (err) { console.error(err); }
        finally { setExecutingId(null); }
    };

    const handleReject = async (id) => {
        try { await api.post(`/monitoring/actions/${id}/reject`); fetchActions(); }
        catch (err) { console.error(err); }
    };

    const handleEditSave = async (id) => {
        try {
            await api.put(`/monitoring/actions/${id}`, { params: editParams });
            setEditingId(null); setEditParams({});
            fetchActions();
        } catch (err) { console.error(err); }
    };

    const startEdit = (action) => {
        setEditingId(action.id);
        setEditParams(action.edited_params || action.suggested_params);
    };

    const FILTERS = [
        { key: 'pending',  label: 'Pending' },
        { key: 'executed', label: 'Executed' },
        { key: 'rejected', label: 'Dismissed' },
        { key: 'all',      label: 'All' },
    ];

    const pendingCount = actions.filter(a => a.status === 'pending').length;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0,  scale: 1 }}
                        exit={{   opacity: 0, y: 16,  scale: 0.97 }}
                        transition={{ type: 'spring', damping: 32, stiffness: 420 }}
                        className="relative w-full sm:max-w-2xl flex flex-col overflow-hidden"
                        style={{
                            maxHeight: '92dvh',
                            background: 'linear-gradient(180deg, #0e0e11 0%, #09090c 100%)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '20px 20px 20px 20px',
                            boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
                        }}
                        // Bottom sheet on mobile
                        style2={{ borderRadius: '20px 20px 0 0' }}
                    >
                        {/* Top shimmer */}
                        <div className="absolute top-0 left-0 right-0 h-px"
                            style={{ background: `linear-gradient(90deg, transparent 0%, ${ACCENT}50 50%, transparent 100%)` }} />

                        {/* ── HEADER ── */}
                        <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}25` }}>
                                    <Zap size={16} style={{ color: ACCENT }} />
                                    {pendingCount > 0 && filter !== 'pending' && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
                                            style={{ background: ACCENT }}>
                                            {pendingCount}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-sm tracking-tight">Suggested Actions</h2>
                                    <p className="text-zinc-500 text-[11px] font-mono">Awaiting execution payloads</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:text-white hover:bg-white/6 transition-all active:scale-95"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* ── FILTER TABS ── */}
                        <div className="flex items-center gap-1 px-4 py-3 sm:px-5 border-b border-white/5 overflow-x-auto scrollbar-hide">
                            {FILTERS.map(f => {
                                const active = filter === f.key;
                                return (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilter(f.key)}
                                        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all"
                                        style={active
                                            ? { background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }
                                            : { color: 'rgb(113,113,122)', border: '1px solid transparent' }
                                        }
                                    >
                                        {f.label}
                                        {f.key === 'pending' && pendingCount > 0 && (
                                            <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-black"
                                                style={{ background: ACCENT }}>
                                                {pendingCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ── ACTIONS LIST ── */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2.5"
                            data-lenis-prevent="true"
                            style={{ background: '#07070a' }}
                        >
                            {loading && actions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Loader2 size={20} className="animate-spin" style={{ color: ACCENT }} />
                                    <p className="text-zinc-600 text-[11px] font-mono uppercase tracking-widest">Scanning network…</p>
                                </div>
                            ) : actions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-600"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <Terminal size={20} />
                                    </div>
                                    <p className="text-zinc-300 text-sm font-semibold">No {filter !== 'all' ? filter : ''} actions</p>
                                    <p className="text-zinc-600 text-xs text-center max-w-[260px] leading-relaxed">
                                        System will generate actionable payloads from your monitored channels.
                                    </p>
                                </div>
                            ) : (
                                actions.map((action, idx) => {
                                    const meta       = getToolMeta(action.suggested_tool);
                                    const ToolIcon   = meta.icon;
                                    const isEditing  = editingId === action.id;
                                    const isExecuting = executingId === action.id;
                                    const params     = action.edited_params || action.suggested_params;
                                    const statusSty  = STATUS_STYLE[action.status] || STATUS_STYLE.pending;

                                    return (
                                        <motion.div
                                            key={action.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className="rounded-2xl overflow-hidden group"
                                            style={{
                                                background: 'linear-gradient(145deg, rgba(16,16,20,0.9), rgba(12,12,15,0.95))',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                                            }}
                                        >
                                            {/* Colored left accent */}
                                            <div className="flex">
                                                <div className="w-[3px] shrink-0 rounded-l-2xl" style={{ background: meta.color }} />
                                                <div className="flex-1 min-w-0">

                                                    {/* Card body */}
                                                    <div className="flex items-start gap-3 p-4 sm:p-5">
                                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                                            style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}20` }}>
                                                            <ToolIcon size={16} style={{ color: meta.color }} />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md"
                                                                    style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}20` }}>
                                                                    {meta.label}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-zinc-600 text-[10px] font-mono">
                                                                    <Clock size={10} /> {timeAgo(action.created_at)}
                                                                </span>
                                                                {action.status !== 'pending' && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                                                                        style={{ background: statusSty.bg, color: statusSty.text, border: `1px solid ${statusSty.border}` }}>
                                                                        <span className="w-1 h-1 rounded-full" style={{ background: statusSty.dot }} />
                                                                        {action.status}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-zinc-100 text-[13px] sm:text-sm font-medium leading-snug mb-2">
                                                                {action.description}
                                                            </p>
                                                            {action.source_context && (
                                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-zinc-500 truncate max-w-full"
                                                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                    <ChevronRight size={10} className="shrink-0 text-zinc-600" />
                                                                    <span className="truncate">{action.source_context?.substring(0, 90)}{action.source_context?.length > 90 ? '…' : ''}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Params */}
                                                    {isEditing ? (
                                                        <div className="px-4 sm:px-5 pb-4">
                                                            <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Edit Payload</p>
                                                                <div className="space-y-2.5">
                                                                    {Object.entries(editParams).map(([key, val]) => (
                                                                        <div key={key}>
                                                                            <label className="text-[10px] font-mono mb-1 block" style={{ color: ACCENT }}>{key}</label>
                                                                            <input
                                                                                type="text"
                                                                                value={typeof val === 'object' ? JSON.stringify(val) : val}
                                                                                onChange={e => setEditParams(p => ({ ...p, [key]: e.target.value }))}
                                                                                className="w-full px-3 py-2 rounded-lg text-[12px] sm:text-[13px] text-zinc-200 outline-none transition-colors"
                                                                                style={{
                                                                                    background: 'rgba(255,255,255,0.04)',
                                                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                                                }}
                                                                                onFocus={e  => e.target.style.borderColor = `${ACCENT}50`}
                                                                                onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex gap-2 mt-3">
                                                                    <button onClick={() => handleEditSave(action.id)}
                                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black transition-all active:scale-95"
                                                                        style={{ background: ACCENT }}>
                                                                        <Check size={13} /> Save
                                                                    </button>
                                                                    <button onClick={() => { setEditingId(null); setEditParams({}); }}
                                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-all active:scale-95"
                                                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : params && Object.keys(params).length > 0 && (
                                                        <div className="px-4 sm:px-5 pb-3">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {Object.entries(params).slice(0, 3).map(([key, val]) => (
                                                                    <span key={key} className="flex items-center text-[11px] px-2 py-1 rounded-lg font-mono max-w-full"
                                                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                        <span className="mr-1 shrink-0" style={{ color: ACCENT }}>{key}:</span>
                                                                        <span className="text-zinc-400 truncate max-w-[120px] sm:max-w-[180px]">
                                                                            {typeof val === 'object' ? JSON.stringify(val).substring(0, 40) : String(val).substring(0, 40)}
                                                                        </span>
                                                                    </span>
                                                                ))}
                                                                {Object.keys(params).length > 3 && (
                                                                    <span className="text-[10px] text-zinc-600 font-mono px-2 py-1 flex items-center">
                                                                        +{Object.keys(params).length - 3} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Execution result */}
                                                    {action.status === 'executed' && action.execution_result && (() => {
                                                        const result   = action.execution_result;
                                                        const rd       = result?.result ?? result;
                                                        let url = null, message = null;
                                                        if (typeof rd === 'object') {
                                                            url     = rd?.data?.url || rd?.url || rd?.data?.permalink_url;
                                                            message = rd?.data?.message || rd?.message;
                                                        } else if (typeof rd === 'string') {
                                                            const m = rd.match(/https?:\/\/[^\s)'"]+/);
                                                            url = m ? m[0] : null; message = rd;
                                                        }
                                                        if (!url && !message) return null;
                                                        return (
                                                            <div className="px-4 sm:px-5 pb-4">
                                                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                                                    style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
                                                                    <Check size={13} className="text-emerald-500 shrink-0" />
                                                                    <span className="text-emerald-400 text-[12px] font-medium flex-1 truncate">
                                                                        {message || 'Executed successfully'}
                                                                    </span>
                                                                    {url && (
                                                                        <a href={url} target="_blank" rel="noopener noreferrer"
                                                                            className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 hover:text-emerald-300 uppercase tracking-widest shrink-0 transition-colors">
                                                                            View <ExternalLink size={10} />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* Action buttons (pending only) */}
                                                    {action.status === 'pending' && (
                                                        <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-white/[0.04]"
                                                            style={{ background: 'rgba(0,0,0,0.2)' }}>
                                                            <button
                                                                onClick={() => handleExecute(action.id)}
                                                                disabled={isExecuting}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black transition-all active:scale-95 disabled:opacity-50"
                                                                style={{ background: isExecuting ? `${ACCENT}80` : ACCENT, boxShadow: `0 2px 10px ${ACCENT}30` }}
                                                            >
                                                                {isExecuting ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
                                                                Execute
                                                            </button>
                                                            <button
                                                                onClick={() => startEdit(action)}
                                                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-all active:scale-95"
                                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                                                            >
                                                                <Pencil size={13} />
                                                                <span className="hidden sm:inline">Edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(action.id)}
                                                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
                                                            >
                                                                <Trash2 size={13} />
                                                                <span className="hidden sm:inline">Dismiss</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}