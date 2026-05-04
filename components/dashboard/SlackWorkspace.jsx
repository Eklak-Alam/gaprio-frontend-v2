'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Hash, Users, Send, X, Lock,
    Search, ChevronDown, ChevronRight, MessageCircle,
    Smile, Zap, Bot, ArrowLeft, RefreshCw, LogOut, RotateCw,
    Loader2, ExternalLink, Settings, Sparkles, Plus,
    UserPlus, Bell, BellOff, Pin, Star, Trash2,
    Copy, Download, Edit3, MoreHorizontal, Phone, Video,
    AtSign, Paperclip, Image as ImageIcon, Code, Wrench
} from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

// ─── brand colour ─────────────────────────────────────────────
const BRAND = '#F3842A';

// ─────────────────────────────────────────────────────────────
// TOAST HELPERS  (Toaster lives in page.jsx — NOT here)
// ─────────────────────────────────────────────────────────────
function toastSuccess(msg) {
    toast.custom(t => (
        <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: t.visible ? 1 : 0, x: t.visible ? 0 : 60, scale: t.visible ? 1 : 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="pointer-events-auto flex items-center gap-3 bg-[#111] border border-emerald-500/20 rounded-2xl px-4 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.7)] w-[290px]"
        >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Sparkles size={13} className="text-emerald-400" />
            </div>
            <p className="text-[12px] font-semibold text-white flex-1 leading-snug">{msg}</p>
            <button onClick={() => toast.dismiss(t.id)} className="shrink-0 text-zinc-600 hover:text-zinc-300"><X size={11} /></button>
        </motion.div>
    ), { duration: 3000, position: 'bottom-right' });
}

function toastError(msg) {
    toast.custom(t => (
        <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: t.visible ? 1 : 0, x: t.visible ? 0 : 60, scale: t.visible ? 1 : 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="pointer-events-auto flex items-center gap-3 bg-[#111] border border-red-500/20 rounded-2xl px-4 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.7)] w-[290px]"
        >
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <X size={13} className="text-red-400" />
            </div>
            <p className="text-[12px] font-semibold text-white flex-1 leading-snug">{msg}</p>
            <button onClick={() => toast.dismiss(t.id)} className="shrink-0 text-zinc-600 hover:text-zinc-300"><X size={11} /></button>
        </motion.div>
    ), { duration: 4000, position: 'bottom-right' });
}

function toastWarn(msg) {
    toast.custom(t => (
        <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: t.visible ? 1 : 0, x: t.visible ? 0 : 60, scale: t.visible ? 1 : 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="pointer-events-auto flex items-center gap-3 bg-[#111] border border-[#F3842A]/20 rounded-2xl px-4 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.7)] w-[300px]"
        >
            <div className="w-8 h-8 rounded-xl bg-[#F3842A]/10 border border-[#F3842A]/25 flex items-center justify-center shrink-0">
                <Wrench size={13} className="text-[#F3842A]" />
            </div>
            <p className="text-[12px] font-semibold text-white flex-1 leading-snug">{msg}</p>
            <button onClick={() => toast.dismiss(t.id)} className="shrink-0 text-zinc-600 hover:text-zinc-300"><X size={11} /></button>
        </motion.div>
    ), { duration: 3500, position: 'bottom-right' });
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function formatTime(ts) {
    if (!ts) return '';
    const date = new Date(parseFloat(ts) * 1000);
    const now = new Date();
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (date.toDateString() === now.toDateString()) return time;
    if (date.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
}

function parseSlackText(text) {
    if (!text) return '';
    return text
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        .replace(/~([^~]+)~/g, '<del>$1</del>')
        .replace(/`([^`]+)`/g, `<code class="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[12px] font-mono text-[#F3842A]">$1</code>`)
        .replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, '<a href="$1" target="_blank" rel="noopener" class="text-[#F3842A]/80 hover:text-[#F3842A] underline underline-offset-2">$2</a>')
        .replace(/<(https?:\/\/[^>]+)>/g, '<a href="$1" target="_blank" rel="noopener" class="text-[#F3842A]/80 hover:text-[#F3842A] underline underline-offset-2">$1</a>')
        .replace(/<@([A-Z0-9]+)>/g, `<span class="bg-[#F3842A]/10 text-[#F3842A] px-1.5 py-0.5 rounded-md font-mono text-[11px] font-bold cursor-pointer hover:bg-[#F3842A]/20 transition-colors">@user</span>`)
        .replace(/\n/g, '<br/>');
}

// ─────────────────────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────────────────────
function UserAvatar({ src, name, size = 32 }) {
    const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const palette = ['#F3842A', '#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
    const idx = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
    if (src) return (
        <img src={src} alt={name}
            style={{ width: size, height: size, minWidth: size }}
            className="rounded-lg object-cover border border-white/[0.06] shadow-sm flex-shrink-0" />
    );
    return (
        <div style={{ width: size, height: size, minWidth: size, fontSize: size * 0.38, background: palette[idx] + '22', color: palette[idx] }}
            className="rounded-lg flex items-center justify-center font-bold flex-shrink-0 border border-white/[0.08]">
            {initials}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────────
function MessageBubble({ msg, onThreadClick, workspaceUsers, onReact }) {
    const [showMenu, setShowMenu] = useState(false);
    const enrichedText = (msg.text || '').replace(/<@([A-Z0-9]+)>/g, (match, uid) => {
        const u = workspaceUsers.find(x => x.id === uid);
        return u ? `<@${u.displayName || u.name}>` : match;
    });

    return (
        <div className="group relative flex items-start gap-2.5 sm:gap-3.5
            px-3 sm:px-5 xl:px-6
            py-2 xl:py-2.5
            hover:bg-white/[0.018] transition-colors">

            <UserAvatar src={msg.senderAvatar} name={msg.senderName} size={30} />

            <div className="flex-1 min-w-0 pt-0.5">
                {/* Name + time */}
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[13px] xl:text-[14px] font-bold text-zinc-100 leading-tight">{msg.senderName}</span>
                    {msg.isBot && (
                        <span className="text-[8px] font-bold bg-[#F3842A]/10 border border-[#F3842A]/20 text-[#F3842A] px-1.5 py-0.5 rounded uppercase tracking-widest">
                            Bot
                        </span>
                    )}
                    <span className="text-[10px] xl:text-[11px] font-medium text-zinc-600">{formatTime(msg.ts)}</span>
                </div>

                {/* Text */}
                <div
                    className="text-[13px] xl:text-[14px] text-zinc-300 leading-relaxed break-words font-medium"
                    dangerouslySetInnerHTML={{ __html: parseSlackText(enrichedText) }}
                />

                {/* Reactions */}
                {msg.reactions?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.reactions.map((r, i) => (
                            <button key={i}
                                onClick={() => onReact?.(msg, r.name)}
                                className="flex items-center gap-1 text-[11px] bg-white/[0.04] border border-white/[0.06]
                                    rounded-lg px-2 py-0.5 text-zinc-400 hover:bg-[#F3842A]/10 hover:border-[#F3842A]/20
                                    hover:text-[#F3842A] transition-colors font-medium">
                                :{r.name}: <span className="font-bold text-zinc-300">{r.count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Thread replies */}
                {msg.replyCount > 0 && (
                    <button onClick={() => onThreadClick(msg)}
                        className="flex items-center gap-1.5 mt-1.5
                            text-[11px] xl:text-[12px] font-bold text-[#F3842A]
                            hover:text-[#F3842A]/80 transition-colors
                            bg-[#F3842A]/[0.08] hover:bg-[#F3842A]/[0.12]
                            px-2.5 py-1 rounded-lg border border-[#F3842A]/20">
                        <MessageCircle size={12} />
                        {msg.replyCount} {msg.replyCount === 1 ? 'reply' : 'replies'}
                    </button>
                )}
            </div>

            {/* Hover action bar */}
            <div className="absolute right-3 sm:right-5 -top-3
                opacity-0 group-hover:opacity-100
                flex gap-0.5 bg-[#0c0c0c] border border-white/[0.08]
                rounded-xl shadow-xl p-1 z-20
                transition-opacity duration-150">
                {[
                    { icon: MessageCircle, label: 'Thread', action: () => onThreadClick(msg) },
                    { icon: Smile,         label: 'React',  action: () => toastWarn('Emoji reactions coming soon!') },
                    { icon: Copy,          label: 'Copy',   action: () => { navigator.clipboard.writeText(msg.text || ''); toastSuccess('Copied!'); } },
                    { icon: MoreHorizontal, label: 'More',  action: () => setShowMenu(v => !v) },
                ].map(({ icon: Icon, label, action }) => (
                    <button key={label} onClick={action}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors"
                        title={label}>
                        <Icon size={13} />
                    </button>
                ))}

                {/* Message context menu */}
                <AnimatePresence>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 top-full mt-1 z-40 w-44
                                    bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl p-1 text-left"
                            >
                                {[
                                    { icon: Pin,      label: 'Pin Message',   action: () => toastWarn('Pinning coming soon!') },
                                    { icon: Star,     label: 'Save Message',  action: () => toastWarn('Saved messages coming soon!') },
                                    { icon: Edit3,    label: 'Edit Message',  action: () => toastWarn('Message editing coming soon!') },
                                    { icon: Trash2,   label: 'Delete',        action: () => toastWarn('Delete coming soon!'), danger: true },
                                ].map(({ icon: Icon, label, action, danger }) => (
                                    <button key={label} onClick={() => { action(); setShowMenu(false); }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors
                                            ${danger
                                                ? 'text-red-400 hover:bg-red-500/10'
                                                : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'}`}>
                                        <Icon size={13} /> {label}
                                    </button>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// @MENTION AUTOCOMPLETE
// ─────────────────────────────────────────────────────────────
function MentionDropdown({ users, filter, onSelect }) {
    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(filter.toLowerCase()) ||
        (u.displayName || '').toLowerCase().includes(filter.toLowerCase())
    ).slice(0, 7);
    if (!filtered.length) return null;
    return (
        <div className="absolute bottom-[calc(100%+6px)] left-0 w-64 sm:w-72
            bg-[#0c0c0c] border border-white/[0.08] rounded-xl
            shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50">
            <div className="px-3 py-2 text-[9px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/[0.05]">
                Mentioning "{filter}"
            </div>
            <div className="p-1 max-h-[220px] overflow-y-auto">
                {filtered.map(u => (
                    <button key={u.id} onClick={() => onSelect(u)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-left transition-colors">
                        <UserAvatar src={u.avatar} name={u.name} size={22} />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[12px] font-semibold text-white truncate">{u.displayName || u.name}</span>
                                {u.isBot && <span className="text-[8px] font-bold bg-[#F3842A]/10 text-[#F3842A] px-1 py-0.5 rounded uppercase">AI</span>}
                            </div>
                            {u.title && <p className="text-[10px] text-zinc-600 truncate">{u.title}</p>}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// #CHANNEL AUTOCOMPLETE
// ─────────────────────────────────────────────────────────────
function ChannelDropdown({ channels, filter, onSelect }) {
    const filtered = channels.filter(c => c.name.toLowerCase().includes(filter.toLowerCase())).slice(0, 7);
    if (!filtered.length) return null;
    return (
        <div className="absolute bottom-[calc(100%+6px)] left-0 w-56 sm:w-64
            bg-[#0c0c0c] border border-white/[0.08] rounded-xl
            shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50">
            <div className="px-3 py-2 text-[9px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/[0.05]">
                Channel "{filter}"
            </div>
            <div className="p-1 max-h-[220px] overflow-y-auto">
                {filtered.map(ch => (
                    <button key={ch.id} onClick={() => onSelect(ch)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-left transition-colors">
                        <div className="w-5 h-5 rounded bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                            <Hash size={11} className="text-zinc-500" />
                        </div>
                        <span className="text-[12px] font-semibold text-white truncate flex-1">{ch.name}</span>
                        {ch.is_private && <Lock size={11} className="text-zinc-600 shrink-0" />}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// THREAD PANEL
// ─────────────────────────────────────────────────────────────
function ThreadPanel({ channel, parentMsg, onClose, workspaceUsers }) {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    const fetchReplies = useCallback(() => {
        if (!parentMsg) return;
        api.get(`/integrations/slack/threads/${channel.id}/${parentMsg.ts}`)
            .then(r => setReplies(r.data.data || []))
            .catch(() => toastError('Failed to load thread'))
            .finally(() => setLoading(false));
    }, [channel?.id, parentMsg?.ts]);

    useEffect(() => { setLoading(true); fetchReplies(); }, [fetchReplies]);
    useEffect(() => { const id = setInterval(fetchReplies, 5000); return () => clearInterval(id); }, [fetchReplies]);
    useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [replies]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setSending(true);
        try {
            await api.post('/integrations/slack/message', { channelId: channel.id, text: replyText, threadTs: parentMsg.ts });
            setReplyText('');
            fetchReplies();
        } catch { toastError('Failed to send reply'); }
        finally { setSending(false); }
    };

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', maxWidth: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="absolute right-0 top-0 bottom-0
                md:relative md:w-[340px] lg:w-[380px]
                flex flex-col overflow-hidden
                border-l border-white/[0.06] bg-[#070707]
                flex-shrink-0 z-40 shadow-2xl md:shadow-none"
        >
            {/* Header */}
            <div className="h-[52px] sm:h-[60px] border-b border-white/[0.06] flex items-center justify-between px-4 sm:px-5 shrink-0">
                <div>
                    <h3 className="text-[14px] font-bold text-white">Thread</h3>
                    <p className="text-[10px] font-medium text-zinc-600 flex items-center gap-1">
                        <Hash size={10} /> {channel?.name}
                    </p>
                </div>
                <button onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-lg
                        text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/[0.08]">
                    <X size={14} />
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 [&::-webkit-scrollbar]:hidden" data-lenis-prevent="true">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 size={20} className="text-[#F3842A] animate-spin" />
                    </div>
                ) : replies.map((msg, i) => (
                    <div key={msg.ts || i}
                        className={`flex items-start gap-2.5 px-4 sm:px-5 py-2.5
                            ${msg.isParent ? 'border-b border-white/[0.05] pb-4 mb-2 bg-white/[0.01]' : 'hover:bg-white/[0.018] transition-colors'}`}>
                        <UserAvatar src={msg.senderAvatar} name={msg.senderName} size={28} />
                        <div className="min-w-0 pt-0.5">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[12px] font-bold text-zinc-100">{msg.senderName}</span>
                                <span className="text-[10px] text-zinc-600">{formatTime(msg.ts)}</span>
                            </div>
                            <div className="text-[12px] xl:text-[13px] text-zinc-300 break-words leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: parseSlackText(msg.text) }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Reply input */}
            <form onSubmit={handleReply} className="p-3 sm:p-4 border-t border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08]
                    rounded-xl px-3 py-2 focus-within:border-[#F3842A]/40 transition-colors">
                    <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
                        placeholder="Reply in thread…"
                        className="flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-zinc-600 font-medium" />
                    <button type="submit" disabled={sending || !replyText.trim()}
                        className="text-[#F3842A] hover:text-[#F3842A]/70 disabled:text-zinc-700 transition-colors shrink-0">
                        <Send size={14} />
                    </button>
                </div>
            </form>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────
// CREATE CHANNEL MODAL
// ─────────────────────────────────────────────────────────────
function CreateChannelModal({ onClose }) {
    const [name, setName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;
        setCreating(true);
        try {
            await api.post('/integrations/slack/channels', { name: name.toLowerCase().replace(/\s+/g, '-'), isPrivate });
            toastSuccess(`#${name} created!`);
            onClose();
        } catch {
            toastWarn('Channel creation requires additional Slack permissions. Contact your workspace admin.');
        } finally { setCreating(false); }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="relative w-full max-w-sm bg-[#0c0c0c] border border-white/[0.08] rounded-2xl p-5 sm:p-6 z-10 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[15px] font-bold text-white">Create Channel</h3>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Channel Name</label>
                        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 focus-within:border-[#F3842A]/40 transition-colors">
                            <Hash size={13} className="text-zinc-600 shrink-0" />
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                placeholder="channel-name"
                                className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-zinc-600 font-medium" />
                        </div>
                    </div>

                    <button onClick={() => setIsPrivate(v => !v)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${isPrivate ? 'bg-[#F3842A]/[0.08] border-[#F3842A]/20 text-[#F3842A]' : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white'}`}>
                        <Lock size={13} />
                        <span className="text-[12px] font-semibold">Private Channel</span>
                    </button>
                </div>

                <div className="flex gap-2 mt-5">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[12px] font-bold text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleCreate} disabled={!name.trim() || creating}
                        className="flex-1 py-2.5 rounded-xl bg-[#F3842A] hover:bg-[#e0751c] disabled:opacity-40
                            text-[12px] font-bold text-black transition-colors flex items-center justify-center gap-2">
                        {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                        Create
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// INVITE MEMBER MODAL
// ─────────────────────────────────────────────────────────────
function InviteMemberModal({ onClose }) {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    const handleInvite = async () => {
        if (!email.trim()) return;
        setSending(true);
        try {
            await api.post('/integrations/slack/invite', { email });
            toastSuccess(`Invite sent to ${email}`);
            onClose();
        } catch {
            toastWarn('Inviting members requires Slack admin permissions in your workspace.');
        } finally { setSending(false); }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="relative w-full max-w-sm bg-[#0c0c0c] border border-white/[0.08] rounded-2xl p-5 sm:p-6 z-10 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[15px] font-bold text-white">Invite Member</h3>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <div>
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 focus-within:border-[#F3842A]/40 transition-colors">
                        <AtSign size={13} className="text-zinc-600 shrink-0" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-zinc-600 font-medium" />
                    </div>
                </div>

                <div className="flex gap-2 mt-5">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[12px] font-bold text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleInvite} disabled={!email.trim() || sending}
                        className="flex-1 py-2.5 rounded-xl bg-[#F3842A] hover:bg-[#e0751c] disabled:opacity-40
                            text-[12px] font-bold text-black transition-colors flex items-center justify-center gap-2">
                        {sending ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                        Send Invite
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function SlackWorkspace({ isConnected, data, user }) {

    // Core state
    const [channels,        setChannels]        = useState(data?.channels || []);
    const [dms,             setDms]             = useState([]);
    const [workspaceUsers,  setWorkspaceUsers]  = useState([]);
    const [activeChannel,   setActiveChannel]   = useState(null);
    const [messages,        setMessages]        = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messageText,     setMessageText]     = useState('');
    const [sending,         setSending]         = useState(false);
    const [searchTerm,      setSearchTerm]      = useState('');
    const [threadMsg,       setThreadMsg]       = useState(null);
    const [showChannels,    setShowChannels]    = useState(true);
    const [showDMs,         setShowDMs]         = useState(true);
    const [mobileView,      setMobileView]      = useState('sidebar'); // 'sidebar' | 'messages'
    const [mentionFilter,   setMentionFilter]   = useState(null);
    const [channelFilter,   setChannelFilter]   = useState(null);
    const [isPolling,       setIsPolling]       = useState(true);
    const [askAI,           setAskAI]           = useState(false);
    const [aiThinking,      setAiThinking]      = useState(false);
    const [sendAsUser,      setSendAsUser]      = useState(true);
    const [showSettings,    setShowSettings]    = useState(false);
    const [notifications,   setNotifications]   = useState(true);

    // Modal state
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [showInviteMember,  setShowInviteMember]  = useState(false);

    const messagesEndRef    = useRef(null);
    const inputRef          = useRef(null);
    const activeChannelRef  = useRef(null);

    useEffect(() => { activeChannelRef.current = activeChannel; }, [activeChannel]);
    useEffect(() => { setChannels(data?.channels || []); }, [data?.channels]);

    useEffect(() => {
        if (!isConnected) return;
        api.get('/integrations/slack/dms').then(r => setDms(r.data.data || [])).catch(console.warn);
        api.get('/integrations/slack/workspace-users').then(r => setWorkspaceUsers(r.data.data || [])).catch(console.warn);
    }, [isConnected]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // Polling
    useEffect(() => {
        if (!isPolling || !isConnected) return;
        const id = setInterval(async () => {
            const ch = activeChannelRef.current;
            if (!ch) return;
            try {
                const r = await api.get(`/integrations/slack/channels/${ch.id}/messages`);
                const fresh = r.data.data?.messages || [];
                setMessages(prev => {
                    const lastOld = prev[prev.length - 1]?.ts;
                    const lastNew = fresh[fresh.length - 1]?.ts;
                    return (prev.length !== fresh.length || lastOld !== lastNew) ? fresh : prev;
                });
            } catch { /* silent */ }
        }, 5000);
        return () => clearInterval(id);
    }, [isPolling, isConnected]);

    const loadMessages = useCallback(async (channel) => {
        setActiveChannel(channel);
        setLoadingMessages(true);
        setThreadMsg(null);
        setMobileView('messages');
        try {
            const r = await api.get(`/integrations/slack/channels/${channel.id}/messages`);
            setMessages(r.data.data?.messages || []);
        } catch {
            toastError('Failed to load messages');
        } finally { setLoadingMessages(false); }
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !activeChannel) return;
        setSending(true);
        try {
            if (askAI) {
                setAiThinking(true);
                await api.post('/integrations/slack/ai-chat', {
                    channelId: activeChannel.id,
                    message: messageText,
                    channelName: activeChannel.name || activeChannel.displayName || 'channel',
                    sendAsUser,
                });
                setAiThinking(false);
            } else {
                await api.post('/integrations/slack/message', {
                    channelId: activeChannel.id,
                    text: messageText,
                    sendAsUser,
                });
            }
            setMessageText('');
            const r = await api.get(`/integrations/slack/channels/${activeChannel.id}/messages`);
            setMessages(r.data.data?.messages || []);
        } catch {
            setAiThinking(false);
            toastError('Failed to send message');
        } finally { setSending(false); }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setMessageText(val);
        const pos = e.target.selectionStart;
        const before = val.slice(0, pos);
        const atMatch   = before.match(/@(\w*)$/);
        const hashMatch = before.match(/#([\w-]*)$/);
        if (atMatch)        { setMentionFilter(atMatch[1]); setChannelFilter(null); }
        else if (hashMatch) { setChannelFilter(hashMatch[1]); setMentionFilter(null); }
        else                { setMentionFilter(null); setChannelFilter(null); }
    };

    const handleMentionSelect = (u) => {
        const pos = inputRef.current?.selectionStart || messageText.length;
        const before = messageText.slice(0, pos).replace(/@\w*$/, `<@${u.id}> `);
        setMessageText(before + messageText.slice(pos));
        setMentionFilter(null);
        if (u.isBot) setAskAI(true);
        inputRef.current?.focus();
    };

    const handleChannelSelect = (ch) => {
        const pos = inputRef.current?.selectionStart || messageText.length;
        const before = messageText.slice(0, pos).replace(/#[\w-]*$/, `<#${ch.id}|${ch.name}> `);
        setMessageText(before + messageText.slice(pos));
        setChannelFilter(null);
        inputRef.current?.focus();
    };

    const handleAuth       = () => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/slack?userId=${user?.id}`; };
    const handleDisconnect = async () => {
        try { await api.delete('/integrations/disconnect/slack'); window.location.reload(); }
        catch { toastError('Disconnect failed'); }
    };

    const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredDMs      = dms.filter(d => (d.displayName || d.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

    // ─── DISCONNECTED STATE ───────────────────────────────
    if (!isConnected) {
        return (
            <div className="w-full h-full flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="max-w-sm w-full bg-[#080808] border border-white/[0.07] rounded-3xl p-8 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(243,132,42,0.07) 0%, transparent 70%)' }} />
                    <div className="relative z-10">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#111] border border-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <Image src="/companylogo/slack.png" alt="Slack" width={36} height={36} className="object-contain" unoptimized />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">Connect Slack</h3>
                        <p className="text-zinc-500 text-[12px] sm:text-[13px] leading-relaxed mb-7">
                            Read channels, reply to threads, and deploy Gaprio AI agents directly in your Slack workspace.
                        </p>
                        <button onClick={handleAuth}
                            className="w-full bg-white text-black py-3 rounded-xl text-[13px] font-bold
                                hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg">
                            Connect Workspace <ExternalLink size={14} />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const teamName = user?.connections?.find(c => c.provider === 'slack')?.metadata?.teamName || 'Workspace';

    // ─── CONNECTED STATE ──────────────────────────────────
    return (
        <div className="flex flex-col h-full w-full overflow-hidden
            px-0 sm:px-3 xl:px-5 2xl:px-6
            pt-2 sm:pt-3 xl:pt-4
            pb-2 sm:pb-3 xl:pb-4">

            {/* Modals */}
            <AnimatePresence>
                {showCreateChannel && <CreateChannelModal onClose={() => setShowCreateChannel(false)} />}
                {showInviteMember  && <InviteMemberModal  onClose={() => setShowInviteMember(false)}  />}
            </AnimatePresence>

            {/* ── Top header bar ──────────────────────────── */}
            <div className="shrink-0 px-3 sm:px-1 pb-2.5 sm:pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3
                    border-b border-white/[0.05] pb-2.5 sm:pb-3">

                    {/* Left: title */}
                    <div className="flex items-center gap-2.5">
                        <Image src="/companylogo/slack.png" alt="Slack" width={22} height={22}
                            className="object-contain xl:w-6 xl:h-6" unoptimized />
                        <h1 className="text-[16px] sm:text-[18px] xl:text-[20px] font-bold text-white tracking-tight">
                            Slack Intelligence
                        </h1>
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] xl:text-[10px] font-bold text-emerald-500 uppercase tracking-widest hidden sm:block">Live</span>
                        </div>
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                        {/* Create channel */}
                        <QuickBtn icon={Plus} label="New Channel" onClick={() => setShowCreateChannel(true)} />
                        {/* Invite */}
                        <QuickBtn icon={UserPlus} label="Invite" onClick={() => setShowInviteMember(true)} />
                        {/* Notifications toggle */}
                        <QuickBtn
                            icon={notifications ? Bell : BellOff}
                            label={notifications ? 'Mute' : 'Unmute'}
                            onClick={() => { setNotifications(v => !v); toastSuccess(notifications ? 'Notifications muted' : 'Notifications on'); }}
                            active={notifications}
                        />
                        {/* Polling */}
                        <QuickBtn
                            icon={RefreshCw}
                            label={isPolling ? 'Live' : 'Paused'}
                            onClick={() => { setIsPolling(v => !v); toastSuccess(isPolling ? 'Polling paused' : 'Live polling on'); }}
                            active={isPolling}
                        />
                        {/* Re-sync */}
                        <QuickBtn icon={RotateCw} label="Re-sync" onClick={handleAuth} />
                        {/* Disconnect */}
                        <QuickBtn icon={LogOut} label="Disconnect" onClick={() => {
                            if (window.confirm('Disconnect Slack from Gaprio?')) handleDisconnect();
                        }} danger />
                    </div>
                </div>
            </div>

            {/* ── Main Slack interface ─────────────────────── */}
            <div className="flex-1 min-h-0 px-0 sm:px-0">
                <div className="flex h-full w-full
                    bg-[#060606] border border-white/[0.05]
                    rounded-none sm:rounded-2xl xl:rounded-3xl
                    overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.6)] relative">

                    {/* ── LEFT SIDEBAR ─────────────────────── */}
                    <div className={`
                        ${mobileView === 'sidebar' ? 'flex' : 'hidden'} md:flex
                        w-full md:w-[240px] lg:w-[260px] xl:w-[280px]
                        flex-col bg-[#080808] border-r border-white/[0.05]
                        flex-shrink-0 z-20 relative
                    `}>
                        {/* Workspace name header */}
                        <div className="h-[52px] sm:h-[60px] flex items-center justify-between px-3 sm:px-4 border-b border-white/[0.05] shrink-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#F3842A]/10 border border-[#F3842A]/20
                                    rounded-lg flex items-center justify-center text-[#F3842A] text-[12px] font-bold shrink-0">
                                    {teamName[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-[13px] sm:text-[14px] font-bold text-white truncate tracking-tight">{teamName}</h2>
                                    <p className="text-[10px] text-zinc-600 font-medium">Slack Workspace</p>
                                </div>
                            </div>

                            {/* Settings menu */}
                            <div className="relative shrink-0">
                                <button onClick={() => setShowSettings(v => !v)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg
                                        text-zinc-600 hover:text-white hover:bg-white/[0.06] transition-colors">
                                    <Settings size={13} />
                                </button>
                                <AnimatePresence>
                                    {showSettings && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                                transition={{ duration: 0.12 }}
                                                className="absolute right-0 top-full mt-1 z-50 w-48
                                                    bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl p-1 text-left"
                                            >
                                                {[
                                                    { icon: Plus,     label: 'Create Channel', action: () => setShowCreateChannel(true) },
                                                    { icon: UserPlus, label: 'Invite Member',  action: () => setShowInviteMember(true) },
                                                    { icon: Download, label: 'Export History', action: () => toastWarn('Export feature coming soon!') },
                                                    { icon: Settings, label: 'Workspace Settings', action: () => toastWarn('Advanced settings coming soon!') },
                                                ].map(({ icon: Icon, label, action }) => (
                                                    <button key={label}
                                                        onClick={() => { action(); setShowSettings(false); }}
                                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors">
                                                        <Icon size={13} className="text-zinc-500" /> {label}
                                                    </button>
                                                ))}
                                                <div className="border-t border-white/[0.05] my-1" />
                                                <button onClick={() => { setShowSettings(false); handleAuth(); }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors">
                                                    <RotateCw size={13} className="text-[#F3842A]" /> Re-authorize
                                                </button>
                                                <button onClick={() => { setShowSettings(false); if (window.confirm('Disconnect Slack?')) handleDisconnect(); }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-red-400 hover:bg-red-500/[0.08] transition-colors">
                                                    <LogOut size={13} /> Disconnect
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="px-3 sm:px-4 pt-3 pb-2 shrink-0">
                            <div className="relative">
                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input type="text" placeholder="Search…" value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/[0.07] rounded-lg
                                        py-1.5 pl-7 pr-3 text-[12px] text-white
                                        focus:outline-none focus:border-[#F3842A]/30 transition-colors
                                        placeholder:text-zinc-600 font-medium" />
                            </div>
                        </div>

                        {/* Channel / DM list */}
                        <div className="flex-1 overflow-y-auto px-2 pb-4 [&::-webkit-scrollbar]:hidden" data-lenis-prevent="true">

                            {/* Channels */}
                            <div className="mb-2">
                                <div onClick={() => setShowChannels(v => !v)}
                                    className="flex items-center gap-1.5 w-full px-2 py-1.5
                                        text-[9px] font-bold text-zinc-600 uppercase tracking-widest
                                        hover:text-zinc-400 transition-colors cursor-pointer">
                                    {showChannels ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                    Channels
                                    <span className="ml-auto font-mono text-zinc-700">{filteredChannels.length}</span>
                                    <button
                                        onClick={e => { e.stopPropagation(); setShowCreateChannel(true); }}
                                        className="ml-1 w-4 h-4 flex items-center justify-center rounded
                                            text-zinc-600 hover:text-[#F3842A] hover:bg-[#F3842A]/10 transition-colors">
                                        <Plus size={10} />
                                    </button>
                                </div>

                                <AnimatePresence initial={false}>
                                    {showChannels && filteredChannels.map(ch => (
                                        <motion.button
                                            key={ch.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            onClick={() => loadMessages(ch)}
                                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                                                text-[12px] sm:text-[13px] font-medium transition-colors group mt-0.5
                                                ${activeChannel?.id === ch.id
                                                    ? 'bg-[#F3842A]/[0.1] text-white border border-[#F3842A]/[0.12]'
                                                    : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'}`}
                                        >
                                            <span className="shrink-0 text-zinc-600">
                                                {ch.is_private ? <Lock size={12} /> : <Hash size={12} />}
                                            </span>
                                            <span className="truncate flex-1 text-left">{ch.name}</span>
                                            {ch.members_count > 0 && (
                                                <span className={`text-[10px] font-mono transition-opacity ${activeChannel?.id === ch.id ? 'text-[#F3842A]/60' : 'text-zinc-700 opacity-0 group-hover:opacity-100'}`}>
                                                    {ch.members_count}
                                                </span>
                                            )}
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* DMs */}
                            <div>
                                <div onClick={() => setShowDMs(v => !v)}
                                    className="flex items-center gap-1.5 w-full px-2 py-1.5
                                        text-[9px] font-bold text-zinc-600 uppercase tracking-widest
                                        hover:text-zinc-400 transition-colors cursor-pointer">
                                    {showDMs ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                    Direct Messages
                                    <span className="ml-auto font-mono text-zinc-700">{filteredDMs.length}</span>
                                    <button
                                        onClick={e => { e.stopPropagation(); toastWarn('Direct messaging coming soon from this panel!'); }}
                                        className="ml-1 w-4 h-4 flex items-center justify-center rounded text-zinc-600 hover:text-[#F3842A] hover:bg-[#F3842A]/10 transition-colors">
                                        <Plus size={10} />
                                    </button>
                                </div>

                                <AnimatePresence initial={false}>
                                    {showDMs && filteredDMs.map(dm => (
                                        <motion.button
                                            key={dm.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            onClick={() => loadMessages(dm)}
                                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                                                text-[12px] sm:text-[13px] font-medium transition-colors mt-0.5
                                                ${activeChannel?.id === dm.id
                                                    ? 'bg-[#F3842A]/[0.1] text-white border border-[#F3842A]/[0.12]'
                                                    : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'}`}
                                        >
                                            <UserAvatar src={dm.avatar} name={dm.name} size={18} />
                                            <span className="truncate flex-1 text-left">{dm.displayName || dm.name}</span>
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* AI footer */}
                        <div className="px-3 sm:px-4 py-3 border-t border-white/[0.05] shrink-0 bg-[#050505]">
                            <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                                <Sparkles size={11} className="text-[#F3842A]" />
                                Gaprio Intelligence
                            </div>
                        </div>
                    </div>

                    {/* ── CENTER — Messages ─────────────────── */}
                    <div className={`
                        flex-1 flex flex-col min-w-0 bg-[#060606]
                        ${mobileView === 'sidebar' ? 'hidden md:flex' : 'flex'}
                    `}>
                        {activeChannel ? (
                            <>
                                {/* Channel header */}
                                <div className="h-[52px] sm:h-[60px] border-b border-white/[0.05]
                                    flex items-center justify-between px-3 sm:px-5 shrink-0 bg-[#080808]">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        {/* Mobile back */}
                                        <button onClick={() => setMobileView('sidebar')}
                                            className="md:hidden w-7 h-7 flex items-center justify-center
                                                rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors">
                                            <ArrowLeft size={15} />
                                        </button>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-zinc-600 shrink-0">
                                                    {activeChannel.is_private ? <Lock size={14} /> : <Hash size={14} />}
                                                </span>
                                                <h3 className="text-[14px] sm:text-[15px] xl:text-[16px] font-bold text-white truncate tracking-tight">
                                                    {activeChannel.name || activeChannel.displayName}
                                                </h3>
                                            </div>
                                            {activeChannel.topic && (
                                                <p className="text-[10px] sm:text-[11px] text-zinc-600 truncate max-w-[180px] sm:max-w-xs xl:max-w-md font-medium">
                                                    {activeChannel.topic}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Channel actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        {activeChannel.members_count > 0 && (
                                            <span className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-zinc-500
                                                bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-lg mr-1">
                                                <Users size={12} /> {activeChannel.members_count}
                                            </span>
                                        )}
                                        <button onClick={() => toastWarn('Voice calls coming soon!')}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-white hover:bg-white/[0.08] transition-colors">
                                            <Phone size={13} />
                                        </button>
                                        <button onClick={() => toastWarn('Video calls coming soon!')}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-white hover:bg-white/[0.08] transition-colors">
                                            <Video size={13} />
                                        </button>
                                        <button onClick={() => toastWarn('Channel pins coming soon!')}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-white hover:bg-white/[0.08] transition-colors">
                                            <Pin size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Message list */}
                                <div className="flex-1 overflow-y-auto py-2 [&::-webkit-scrollbar]:hidden" data-lenis-prevent="true">
                                    {loadingMessages ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 size={22} className="text-[#F3842A] animate-spin" />
                                        </div>
                                    ) : messages.length > 0 ? (
                                        <>
                                            {messages.map((msg, i) => (
                                                <MessageBubble
                                                    key={msg.ts || i}
                                                    msg={msg}
                                                    onThreadClick={setThreadMsg}
                                                    workspaceUsers={workspaceUsers}
                                                    onReact={() => toastWarn('Emoji reactions coming soon!')}
                                                />
                                            ))}
                                            <div ref={messagesEndRef} className="h-3" />
                                        </>
                                    ) : (
                                        <EmptyState icon={Hash} text="No messages yet. Be the first to transmit." />
                                    )}
                                </div>

                                {/* ── Message input ─────────────────── */}
                                <div className="px-3 sm:px-4 xl:px-5 py-2.5 sm:py-3
                                    bg-[#080808] border-t border-white/[0.05] shrink-0 relative z-20">
                                    <div className="max-w-5xl mx-auto relative">
                                        {/* Autocomplete dropdowns */}
                                        {mentionFilter !== null && (
                                            <MentionDropdown users={workspaceUsers} filter={mentionFilter} onSelect={handleMentionSelect} />
                                        )}
                                        {channelFilter !== null && (
                                            <ChannelDropdown channels={channels} filter={channelFilter} onSelect={handleChannelSelect} />
                                        )}

                                        {/* Main input row */}
                                        <form onSubmit={handleSend} className="flex items-end gap-2">
                                            {/* AI toggle */}
                                            <button type="button" onClick={() => setAskAI(v => !v)}
                                                title="Toggle Gaprio AI Agent"
                                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
                                                    transition-all shrink-0 border shadow-sm
                                                    ${askAI
                                                        ? 'bg-[#F3842A]/10 border-[#F3842A]/30 text-[#F3842A]'
                                                        : 'bg-white/[0.03] border-white/[0.08] text-zinc-600 hover:text-white hover:bg-white/[0.06]'}`}>
                                                {askAI
                                                    ? <Image src="/logo1.png" alt="AI" width={18} height={18} className="drop-shadow-[0_0_6px_rgba(243,132,42,0.8)]" />
                                                    : <Bot size={17} />}
                                            </button>

                                            {/* Text input */}
                                            <div className={`flex-1 bg-white/[0.03] border rounded-xl
                                                flex items-end gap-2 px-3 py-2 transition-colors
                                                ${askAI
                                                    ? 'border-[#F3842A]/30 focus-within:border-[#F3842A]/60'
                                                    : 'border-white/[0.08] focus-within:border-white/[0.2]'}`}>

                                                {/* Attachment / file buttons */}
                                                <div className="hidden sm:flex items-center gap-0.5 pb-0.5 shrink-0">
                                                    {[
                                                        { icon: Paperclip, tip: 'Attach file' },
                                                        { icon: ImageIcon, tip: 'Image' },
                                                        { icon: Code,      tip: 'Code snippet' },
                                                    ].map(({ icon: Icon, tip }) => (
                                                        <button key={tip} type="button"
                                                            onClick={() => toastWarn(`${tip} — coming soon!`)}
                                                            className="w-6 h-6 flex items-center justify-center rounded-md
                                                                text-zinc-700 hover:text-zinc-400 hover:bg-white/[0.06] transition-colors">
                                                            <Icon size={12} />
                                                        </button>
                                                    ))}
                                                </div>

                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={messageText}
                                                    onChange={handleInputChange}
                                                    placeholder={askAI
                                                        ? `Command AI in #${activeChannel.name || 'channel'}…`
                                                        : `Message #${activeChannel.name || activeChannel.displayName || 'channel'}…`}
                                                    className="flex-1 min-w-0 bg-transparent
                                                        text-[12px] sm:text-[13px] xl:text-[14px]
                                                        text-white h-[34px] outline-none
                                                        placeholder:text-zinc-600 font-medium"
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && !e.shiftKey && mentionFilter === null && channelFilter === null) {
                                                            e.preventDefault(); handleSend(e);
                                                        }
                                                        if (e.key === 'Escape') { setMentionFilter(null); setChannelFilter(null); }
                                                    }}
                                                />

                                                {/* Send button */}
                                                <button type="submit"
                                                    disabled={sending || aiThinking || !messageText.trim()}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg
                                                        transition-all shrink-0 active:scale-95
                                                        disabled:opacity-30 disabled:cursor-not-allowed
                                                        ${askAI
                                                            ? 'bg-[#F3842A] hover:bg-[#e0751c] text-black'
                                                            : 'bg-white hover:bg-zinc-200 text-black'}`}>
                                                    {aiThinking
                                                        ? <Loader2 size={14} className="animate-spin text-black" />
                                                        : <Send size={14} />}
                                                </button>
                                            </div>
                                        </form>

                                        {/* Footer hint */}
                                        <div className="flex items-center gap-3 mt-1.5 pl-[44px] sm:pl-[52px] text-[10px] text-zinc-700">
                                            {askAI ? (
                                                <span className="flex items-center gap-1 text-[#F3842A]/70">
                                                    <Zap size={10} /> <strong>AI Mode active</strong> — Gaprio will respond in channel
                                                </span>
                                            ) : (
                                                <button type="button" onClick={() => setSendAsUser(v => !v)}
                                                    className={`flex items-center gap-1 transition-colors hover:text-zinc-400
                                                        ${sendAsUser ? 'text-zinc-500' : 'text-zinc-700'}`}>
                                                    <Users size={10} />
                                                    {sendAsUser ? 'Sending as you (native user)' : 'Sending as bot — click to toggle'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* No channel selected */
                            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0c0c0c] border border-white/[0.06] rounded-2xl flex items-center justify-center mb-4">
                                    <MessageSquare size={24} className="text-zinc-700" />
                                </div>
                                <h3 className="text-[16px] sm:text-[18px] font-bold text-white mb-2 tracking-tight">Comms Standby</h3>
                                <p className="text-zinc-600 text-[12px] sm:text-[13px] text-center leading-relaxed max-w-[240px] sm:max-w-sm mb-5">
                                    Select a channel or DM to start communicating.
                                </p>
                                <div className="flex items-center gap-2 px-4 py-2.5
                                    bg-[#F3842A]/[0.06] border border-[#F3842A]/[0.12]
                                    rounded-xl text-[11px] text-zinc-400">
                                    <Sparkles size={12} className="text-[#F3842A]" />
                                    Tag <span className="text-[#F3842A] font-bold mx-1">@Gaprio Agent</span> for AI
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT — Thread panel ──────────────── */}
                    <AnimatePresence>
                        {threadMsg && activeChannel && (
                            <ThreadPanel
                                channel={activeChannel}
                                parentMsg={threadMsg}
                                onClose={() => setThreadMsg(null)}
                                workspaceUsers={workspaceUsers}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function QuickBtn({ icon: Icon, label, onClick, active, danger }) {
    return (
        <button onClick={onClick}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg
                text-[11px] xl:text-[12px] font-semibold border transition-colors shrink-0 whitespace-nowrap
                ${danger
                    ? 'bg-transparent border-red-500/20 text-red-400/70 hover:text-red-300 hover:bg-red-500/[0.08] hover:border-red-500/30'
                    : active
                        ? 'bg-[#F3842A]/[0.1] border-[#F3842A]/25 text-[#F3842A]'
                        : 'bg-white/[0.03] border-white/[0.07] text-zinc-500 hover:text-white hover:bg-white/[0.07] hover:border-white/[0.12]'}`}>
            <Icon size={12} xl={14} className={active ? 'text-[#F3842A]' : ''} />
            <span className="hidden sm:block">{label}</span>
        </button>
    );
}

function EmptyState({ icon: Icon, text }) {
    return (
        <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center mb-3">
                <Icon size={20} className="text-zinc-700" />
            </div>
            <p className="text-zinc-600 text-[12px] sm:text-[13px] font-medium leading-relaxed max-w-[200px]">{text}</p>
        </div>
    );
}