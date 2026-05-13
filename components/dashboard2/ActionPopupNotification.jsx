'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Zap, Play, Clock, Loader2,
    MessageSquare, Calendar, Mail, FileText, GitBranch, CheckSquare
} from 'lucide-react';
import { apiClient } from '@/api/apiClient';

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

export default function ActionPopupNotification({ onCountChange }) {
    const [popupQueue, setPopupQueue] = useState([]);
    const [seenIds,    setSeenIds]    = useState(new Set());
    const [executing,  setExecuting]  = useState(false);
    const [dismissing, setDismissing] = useState(false);
    const swRegistration  = useRef(null);
    const refreshCountRef = useRef(null);

    const currentAction = popupQueue[0] || null;
    const queueLen      = popupQueue.length;

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
        let mounted = true;

        async function registerSW() {
            try {
                const reg = await navigator.serviceWorker.register('/sw-notifications.js', { scope: '/' });
                swRegistration.current = reg;
                await reg.update();
                if ('Notification' in window && Notification.permission === 'default')
                    await Notification.requestPermission();
                const sw = reg.active || reg.installing || reg.waiting;
                if (sw && sw.state !== 'activated')
                    await new Promise(r => sw.addEventListener('statechange', () => sw.state === 'activated' && r()));
                
                const store = await import('@/store/useAuthStore');
                const token = store.useAuthStore.getState().accessToken;
                const refreshToken = store.useAuthStore.getState().refreshToken;

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                if (reg.active && token)
                    reg.active.postMessage({ type: 'INIT', data: { apiBaseUrl: apiUrl, authToken: token, refreshToken, knownActionIds: Array.from(seenIds) } });
            } catch { /* fallback */ }
        }
        registerSW();

        const handleSWMessage = (event) => {
            if (!mounted) return;
            const { type, actions, pendingCount, knownIds, actionId } = event.data || {};
            if (type === 'NEW_ACTIONS') {
                if (actions?.length > 0) {
                    setPopupQueue(prev => { const ex = new Set(prev.map(a => a.id)); return [...prev, ...actions.filter(a => !ex.has(a.id))]; });
                    setSeenIds(new Set(knownIds || []));
                }
                if (onCountChange && typeof pendingCount === 'number') onCountChange(pendingCount);
            }
            if ((type === 'ACTION_EXECUTED' || type === 'ACTION_DISMISSED') && actionId) {
                setPopupQueue(prev => prev.filter(a => a.id !== actionId));
                refreshCountRef.current?.();
            }
        };
        navigator.serviceWorker.addEventListener('message', handleSWMessage);
        return () => { mounted = false; navigator.serviceWorker.removeEventListener('message', handleSWMessage); };
    }, []);

    useEffect(() => {
        const i = setInterval(async () => {
            const store = await import('@/store/useAuthStore');
            const token = store.useAuthStore.getState().accessToken;
            const refreshToken = store.useAuthStore.getState().refreshToken;
            if (swRegistration.current?.active && token)
                swRegistration.current.active.postMessage({ type: 'UPDATE_TOKEN', data: { authToken: token, refreshToken } });
        }, 60000);
        return () => clearInterval(i);
    }, []);

    const checkForNewActions = useCallback(async () => {
        try {
            const res = await apiClient.get('/monitoring/actions', { params: { status: 'pending' } });
            const pending = res.data.data || [];
            const fresh = pending.filter(a => !seenIds.has(a.id));
            if (fresh.length > 0) {
                setPopupQueue(prev => { const ex = new Set(prev.map(a => a.id)); return [...prev, ...fresh.filter(a => !ex.has(a.id))]; });
                setSeenIds(prev => { const u = new Set(prev); fresh.forEach(a => u.add(a.id)); return u; });
            }
            if (onCountChange) onCountChange(pending.length);
        } catch { /* silent */ }
    }, [seenIds, onCountChange]);

    useEffect(() => {
        const i = setInterval(() => {
            if ('serviceWorker' in navigator && swRegistration.current?.active)
                swRegistration.current.active.postMessage({ type: 'POLL_NOW' });
            else checkForNewActions();
        }, 15000);
        return () => clearInterval(i);
    }, [checkForNewActions]);

    useEffect(() => { checkForNewActions(); }, []);

    useEffect(() => {
        if (!currentAction) return;
        const t = setTimeout(() => handleLater(), 20000);
        return () => clearTimeout(t);
    }, [currentAction?.id]);

    const removeFirst  = () => setPopupQueue(p => p.slice(1));
    const notifySW     = (id) => swRegistration.current?.active?.postMessage({ type: 'ACTION_HANDLED', data: { actionId: id } });
    const refreshCount = async () => {
        if (!onCountChange) return;
        try { const r = await apiClient.get('/monitoring/actions/count'); onCountChange(r.data.count || 0); } catch { /* silent */ }
    };
    refreshCountRef.current = refreshCount;

    const handleExecute = async () => {
        if (!currentAction || executing) return;
        setExecuting(true);
        try { await apiClient.post(`/monitoring/actions/${currentAction.id}/execute`); notifySW(currentAction.id); removeFirst(); await refreshCount(); }
        catch (e) { console.error(e); } finally { setExecuting(false); }
    };

    const handleLater = () => { if (currentAction) notifySW(currentAction.id); removeFirst(); };

    const handleIgnore = async () => {
        if (!currentAction || dismissing) return;
        setDismissing(true);
        try { await apiClient.post(`/monitoring/actions/${currentAction.id}/reject`); notifySW(currentAction.id); removeFirst(); await refreshCount(); }
        catch (e) { console.error(e); } finally { setDismissing(false); }
    };

    if (!currentAction) return null;

    const meta     = getToolMeta(currentAction.suggested_tool);
    const ToolIcon = meta.icon;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentAction.id}
                initial={{ y: -14, opacity: 0, scale: 0.97 }}
                animate={{ y: 0,   opacity: 1, scale: 1    }}
                exit={{   y: -10,  opacity: 0, scale: 0.97 }}
                transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                className="fixed top-5 left-1/2 -translate-x-1/2 z-[9998]"
                style={{ width: 'min(480px, calc(100vw - 24px))' }}
            >
                {/* Stacked shadow cards */}
                {queueLen > 1 && (
                    <div className="absolute inset-x-4 -bottom-1.5 h-full rounded-2xl"
                        style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.05)', zIndex: -1 }} />
                )}
                {queueLen > 2 && (
                    <div className="absolute inset-x-7 -bottom-3 h-full rounded-2xl"
                        style={{ background: '#0e0e11', border: '1px solid rgba(255,255,255,0.04)', zIndex: -2 }} />
                )}

                {/* Main card */}
                <div className="rounded-2xl overflow-hidden"
                    style={{
                        background: '#111114',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 20px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)',
                    }}
                >
                    <div className="flex items-center gap-3 px-3.5 py-3">
                        {/* Tool icon */}
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${meta.color}14`, border: `1px solid ${meta.color}22` }}>
                            <ToolIcon size={14} style={{ color: meta.color }} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                                    style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}1e` }}>
                                    {meta.label}
                                </span>
                                <span className="text-zinc-600 text-[9px] font-mono">suggested</span>
                                {queueLen > 1 && (
                                    <span className="ml-auto text-[9px] font-mono text-zinc-500 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.06]">
                                        +{queueLen - 1}
                                    </span>
                                )}
                            </div>
                            <p className="text-zinc-100 text-[12px] font-medium leading-snug truncate">
                                {currentAction.description}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={handleExecute}
                                disabled={executing}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-black transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
                                style={{ background: ACCENT }}
                            >
                                {executing ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} fill="currentColor" />}
                                Execute
                            </button>
                            <button onClick={handleLater} title="Remind later"
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-all active:scale-90">
                                <Clock size={13} />
                            </button>
                            <button onClick={handleIgnore} disabled={dismissing} title="Dismiss"
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/[0.10] transition-all active:scale-90">
                                {dismissing ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                            </button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <motion.div
                        key={`bar-${currentAction.id}`}
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 20, ease: 'linear' }}
                        className="h-[1.5px] origin-left"
                        style={{ background: `linear-gradient(90deg, ${meta.color}, ${ACCENT})` }}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
