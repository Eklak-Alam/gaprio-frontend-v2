'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
    Mail, Video, Send, FileText, Calendar,
    ExternalLink, Plus, X, Clock,
    Save, CheckCircle2, Copy, AlertCircle, LogOut, RotateCw,
    Trash2, UploadCloud, Reply, Inbox, Wrench
} from 'lucide-react';
import { googleServiceApi } from '@/api/googleservice.api';

// ── animation ───────────────────────────────────────────────
const fadeV = {
    hidden: { opacity: 0, y: 8 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit:   { opacity: 0, y: -6, transition: { duration: 0.18, ease: 'easeIn' } },
};

// ── toast helpers ────────────────────────────────────────────
const toastSuccess = (msg) =>
    toast.custom((t) => (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: t.visible ? 1 : 0, y: t.visible ? 0 : 10, scale: t.visible ? 1 : 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="flex items-center gap-3 bg-[#111] border border-emerald-500/20 rounded-2xl px-4 py-3 shadow-2xl"
        >
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span className="text-[12px] font-semibold text-zinc-100">{msg}</span>
        </motion.div>
    ), { duration: 3000, position: 'bottom-right' });

const toastError = (msg) =>
    toast.custom((t) => (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: t.visible ? 1 : 0, y: t.visible ? 0 : 10, scale: t.visible ? 1 : 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="flex items-center gap-3 bg-[#111] border border-red-500/20 rounded-2xl px-4 py-3 shadow-2xl"
        >
            <AlertCircle size={15} className="text-red-400 shrink-0" />
            <span className="text-[12px] font-semibold text-zinc-100">{msg}</span>
        </motion.div>
    ), { duration: 3500, position: 'bottom-right' });

const toastInfo = (msg) =>
    toast.custom((t) => (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: t.visible ? 1 : 0, y: t.visible ? 0 : 10, scale: t.visible ? 1 : 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl"
        >
            <Wrench size={14} className="text-[#F3842A] shrink-0" />
            <span className="text-[12px] font-semibold text-zinc-100">{msg}</span>
        </motion.div>
    ), { duration: 3000, position: 'bottom-right' });

// ── main component ───────────────────────────────────────────
export default function GoogleWorkspace({ isConnected, data, user, onRefresh }) {

    const [activeTab,     setActiveTab]     = useState('email');
    const [activeModal,   setActiveModal]   = useState(null);
    const [selectedItem,  setSelectedItem]  = useState(null);
    const [createdMeeting,setCreatedMeeting]= useState(null);
    const [formData,      setFormData]      = useState({});
    const [loading,       setLoading]       = useState(false);
    const [isReplying,    setIsReplying]    = useState(false);

    // ── helpers ─────────────────────────────────────────────
    const extractEmail = (s) => { const m = s?.match(/<(.+)>/); return m ? m[1] : s; };
    const copyToClipboard = (t) => { navigator.clipboard.writeText(t); toastSuccess('Copied to clipboard'); };

    const handleAuth = async () => {
        try {
            const res = await googleServiceApi.getAuthUrl();
            if (res?.data?.url) {
                window.location.href = res.data.url;
            }
        } catch (error) {
            toastError('Failed to get auth URL.');
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Disconnect Google Workspace?')) return;
        try {
            await googleServiceApi.disconnect();
            toastSuccess('Google Workspace disconnected');
            setTimeout(() => window.location.reload(), 600);
        } catch { toastError('Failed to disconnect.'); }
    };

    // ── actions ──────────────────────────────────────────────
    const handleSendEmail = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await googleServiceApi.sendNewEmail(formData);
            toastSuccess('Email sent successfully!');
            setActiveModal(null); setFormData({});
            onRefresh?.();
        } catch { toastError('Failed to send email.'); }
        finally { setLoading(false); }
    };

    const handleReplyEmail = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await googleServiceApi.replyEmail({
                to: extractEmail(selectedItem.from),
                subject: `Re: ${selectedItem.subject}`,
                body: formData.replyBody,
                threadId: selectedItem.threadId,
                messageId: selectedItem.id,
            });
            toastSuccess('Reply sent successfully.');
            setIsReplying(false); setActiveModal(null); setFormData({});
        } catch { toastError('Failed to send reply.'); }
        finally { setLoading(false); }
    };

    const handleSaveDraft = async () => {
        if (!formData.to || !formData.subject) return toastError('Recipient and Subject are required');
        setLoading(true);
        try {
            await googleServiceApi.saveDraft(formData);
            toastSuccess('Draft saved to Gmail!');
            setActiveModal(null); setFormData({});
        } catch { toastError('Failed to save draft.'); }
        finally { setLoading(false); }
    };

    const handleDeleteEmail = async (id) => {
        try {
            await googleServiceApi.deleteEmail(id);
            toastSuccess('Email moved to trash.');
            setActiveModal(null); onRefresh?.();
        } catch { toastError('Failed to delete email.'); }
    };

    const handleCreateMeeting = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const start = new Date(formData.startTime);
            const end   = new Date(start.getTime() + 60 * 60 * 1000);
            const res   = await googleServiceApi.createMeeting({
                summary: formData.summary, description: formData.description,
                startTime: start, endTime: end,
            });
            setCreatedMeeting(res.data);
            setActiveModal('meeting_success'); setFormData({});
            toastSuccess('Meeting created & link generated!');
            onRefresh?.();
        } catch { toastError('Failed to schedule meeting.'); }
        finally { setLoading(false); }
    };

    const handleDeleteMeeting = async (id) => {
        try {
            await googleServiceApi.deleteMeeting(id);
            toastSuccess('Meeting cancelled.');
            onRefresh?.();
        } catch { toastError('Failed to cancel meeting.'); }
    };

    const handleUploadDrive = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            // Need to wrap into FormData
            const fData = new FormData();
            // Assuming text to file conversion
            const blob = new Blob([formData.fileContent], { type: 'text/plain' });
            fData.append('file', blob, formData.fileName + '.txt');

            await googleServiceApi.uploadDriveFile(fData);
            toastSuccess('Document saved to Google Drive.');
            setActiveModal(null); setFormData({}); onRefresh?.();
        } catch { toastError('Failed to push document.'); }
        finally { setLoading(false); }
    };

    const handleDeleteFile = async (id) => {
        try {
            await googleServiceApi.deleteDriveFile(id);
            toastSuccess('File deleted.');
            onRefresh?.();
        } catch { toastError('Failed to delete file.'); }
    };

    // ── disconnected state ───────────────────────────────────
    if (!isConnected) return (
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 bg-[#020202]">
            <Toaster />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="max-w-sm w-full bg-[#050505] border border-white/[0.07] rounded-2xl p-7 sm:p-9 text-center relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(243,132,42,0.07),transparent_70%)] pointer-events-none" />
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-[#0a0a0a] border border-white/[0.07] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <Image src="/companylogo/google.webp" alt="Google" width={32} height={32} className="object-contain" unoptimized />
                    </div>
                    <h3 className="text-[18px] sm:text-[20px] font-bold text-white mb-2 tracking-tight">Connect Google Workspace</h3>
                    <p className="text-zinc-400 text-[12px] leading-relaxed mb-7">
                        Securely connect your Google account to manage Drive files, send emails, and schedule Meet events directly from Gaprio.
                    </p>
                    <button onClick={handleAuth}
                        className="w-full bg-white text-black py-3 rounded-xl text-[12px] font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] shadow-md">
                        Connect Workspace <ExternalLink size={14} />
                    </button>
                </div>
            </motion.div>
        </div>
    );

    // ── connected UI ─────────────────────────────────────────
    return (
        <div className="flex flex-col w-full h-full bg-[#020202] overflow-hidden">
            <Toaster />

            {/* ── HEADER ──────────────────────────────────────── */}
            <div className="shrink-0
                px-3 pt-3 pb-0
                sm:px-4 sm:pt-4
                md:px-5 md:pt-4
                lg:px-6 lg:pt-5
                xl:px-8 xl:pt-5
                2xl:px-10 2xl:pt-6">

                {/* Title row */}
                <div className="flex items-center justify-between mb-3 xl:mb-4">
                    <div className="flex items-center gap-2 xl:gap-3">
                        <Image src="/companylogo/google.webp" alt="Google" width={22} height={22}
                            className="object-contain xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" unoptimized />
                        <h1 className="font-bold text-white tracking-tight
                            text-[14px] sm:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[19px]">
                            Google Workspace
                        </h1>
                        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20
                            px-2 py-0.5 xl:px-2.5 xl:py-1 rounded-md">
                            <span className="w-1 h-1 xl:w-1.5 xl:h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[8px] xl:text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Connected</span>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2
                    border-b border-white/[0.07] pb-2.5 xl:pb-3">

                    {/* Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                        <TabBtn active={activeTab === 'email'}    onClick={() => setActiveTab('email')}    icon={Mail}     label="Inbox"         />
                        <TabBtn active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={Calendar} label="Schedule"      />
                        <TabBtn active={activeTab === 'drive'}    onClick={() => setActiveTab('drive')}    icon={FileText} label="Cloud Storage" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        <ActBtn icon={RotateCw}   label="Sync"       onClick={() => { onRefresh?.(); toastInfo('Syncing…'); }} />
                        <ActBtn icon={LogOut}     label="Disconnect" onClick={handleDisconnect} />
                        <div className="w-px h-5 bg-white/10 mx-0.5 hidden sm:block" />
                        <ActBtn icon={UploadCloud} label="New File"  onClick={() => { setFormData({}); setActiveModal('drive_upload'); }} />
                        <ActBtn icon={Video}       label="New Meet"  onClick={() => { setFormData({}); setActiveModal('meeting'); }} />
                        <button
                            onClick={() => { setFormData({}); setActiveModal('compose'); }}
                            className="flex items-center gap-1.5 bg-[#F3842A] hover:bg-[#e0751c] text-black font-bold
                                px-3 py-1.5 xl:px-4 xl:py-2
                                rounded-lg text-[10px] xl:text-[11px] 2xl:text-[12px]
                                transition-all whitespace-nowrap shadow-sm active:scale-[0.97] ml-0.5">
                            <Plus size={12} className="xl:w-3.5 xl:h-3.5" /> Compose
                        </button>
                    </div>
                </div>
            </div>

            {/* ── CONTENT ─────────────────────────────────────── */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar
                px-3 pb-6
                sm:px-4
                md:px-5
                lg:px-6
                xl:px-8
                2xl:px-10">

                <AnimatePresence mode="wait">

                    {/* ── INBOX ───────────────────────────────────── */}
                    {activeTab === 'email' && (
                        <motion.div key="email" variants={fadeV} initial="hidden" animate="show" exit="exit" className="flex flex-col pt-1">
                            {data?.emails?.length ? data.emails.map((e, idx) => (
                                <div key={e.id}
                                    onClick={() => { setSelectedItem(e); setIsReplying(false); setActiveModal('view_email'); }}
                                    className={`group flex flex-col sm:flex-row sm:items-center justify-between
                                        px-3 py-3 xl:px-4 xl:py-3.5 2xl:px-5 2xl:py-4
                                        cursor-pointer transition-colors hover:bg-white/[0.025]
                                        ${idx !== data.emails.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
                                >
                                    <div className="flex items-start gap-3 min-w-0 flex-1 sm:pr-4">
                                        {/* avatar */}
                                        <div className="w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 rounded-full bg-[#1a1a1a] border border-white/10
                                            flex items-center justify-center text-zinc-300 font-bold shrink-0 text-[12px] xl:text-[13px]
                                            group-hover:bg-[#F3842A]/10 group-hover:text-[#F3842A] group-hover:border-[#F3842A]/20 transition-colors">
                                            {e.from.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-zinc-100 group-hover:text-white transition-colors truncate
                                                text-[12px] xl:text-[13px] 2xl:text-[14px]">
                                                {e.from.split('<')[0].replace(/"/g, '').trim()}
                                            </span>
                                            <div className="flex items-baseline gap-1.5 truncate mt-0.5">
                                                <span className="text-zinc-300 font-medium truncate
                                                    text-[11px] xl:text-[12px] 2xl:text-[13px]">
                                                    {e.subject || '(No Subject)'}
                                                </span>
                                                <span className="text-zinc-500 truncate hidden sm:inline
                                                    text-[11px] xl:text-[12px]">
                                                    — {e.snippet}
                                                </span>
                                            </div>
                                            <span className="text-zinc-500 truncate sm:hidden mt-0.5 text-[10px]">{e.snippet}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 pl-11 sm:pl-0 shrink-0">
                                        <span className="text-[10px] xl:text-[11px] text-zinc-500 font-medium sm:group-hover:hidden whitespace-nowrap">
                                            {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                        <div className="hidden sm:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(ev) => { ev.stopPropagation(); setIsReplying(true); setSelectedItem(e); setActiveModal('view_email'); }}
                                                className="p-1.5 xl:p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                                                <Reply size={13} className="xl:w-4 xl:h-4" />
                                            </button>
                                            <button onClick={(ev) => { ev.stopPropagation(); handleDeleteEmail(e.id); }}
                                                className="p-1.5 xl:p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
                                                <Trash2 size={13} className="xl:w-4 xl:h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : <EmptyState text="Inbox zero. You're all caught up." icon={Inbox} />}
                        </motion.div>
                    )}

                    {/* ── CALENDAR ────────────────────────────────── */}
                    {activeTab === 'calendar' && (
                        <motion.div key="calendar" variants={fadeV} initial="hidden" animate="show" exit="exit" className="pt-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 xl:gap-4">
                                {data?.meetings?.length ? data.meetings.map(m => (
                                    <div key={m.id}
                                        className="p-4 xl:p-5 bg-[#060606] border border-white/[0.06] hover:border-white/[0.10]
                                            rounded-xl transition-all group flex flex-col">
                                        <div className="flex justify-between items-start mb-3 gap-3">
                                            <h4 className="font-semibold text-zinc-100 leading-snug line-clamp-2 group-hover:text-white transition-colors
                                                text-[12px] xl:text-[13px] 2xl:text-[14px]">
                                                {m.summary}
                                            </h4>
                                            <div className="p-1.5 xl:p-2 bg-white/5 rounded-lg text-zinc-500 shrink-0
                                                group-hover:bg-[#F3842A]/10 group-hover:text-[#F3842A] transition-colors">
                                                <Calendar size={14} className="xl:w-4 xl:h-4" />
                                            </div>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/[0.05]">
                                            <div className="flex items-center gap-1.5 text-zinc-400
                                                text-[10px] xl:text-[11px]">
                                                <Clock size={11} className="xl:w-3 xl:h-3" />
                                                {new Date(m.start.dateTime || m.start.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {m.link && (
                                                    <a href={m.link} target="_blank" rel="noreferrer"
                                                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                                                        <Video size={13} />
                                                    </a>
                                                )}
                                                <button onClick={() => handleDeleteMeeting(m.id)}
                                                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )) : <EmptyState text="No upcoming events." icon={Calendar} />}
                            </div>
                        </motion.div>
                    )}

                    {/* ── DRIVE ───────────────────────────────────── */}
                    {activeTab === 'drive' && (
                        <motion.div key="drive" variants={fadeV} initial="hidden" animate="show" exit="exit" className="flex flex-col pt-1">
                            {data?.files?.length ? data.files.map((f, idx) => (
                                <div key={f.id}
                                    className={`group flex items-center justify-between
                                        px-3 py-3 xl:px-4 xl:py-3.5
                                        cursor-pointer transition-colors hover:bg-white/[0.025]
                                        ${idx !== data.files.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-lg bg-[#0a0a0a] border border-white/[0.06] flex items-center justify-center shrink-0">
                                            <img src={f.iconLink} alt="icon" className="w-4 h-4 xl:w-5 xl:h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-zinc-200 group-hover:text-white transition-colors truncate
                                                text-[12px] xl:text-[13px] 2xl:text-[14px] font-medium">
                                                {f.name}
                                            </p>
                                            <p className="text-zinc-500 mt-0.5 text-[10px] xl:text-[11px]">Cloud Storage Document</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <a href={f.webViewLink} target="_blank" rel="noreferrer"
                                            className="p-1.5 xl:p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                                            <ExternalLink size={13} className="xl:w-4 xl:h-4" />
                                        </a>
                                        <button onClick={() => handleDeleteFile(f.id)}
                                            className="p-1.5 xl:p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
                                            <Trash2 size={13} className="xl:w-4 xl:h-4" />
                                        </button>
                                    </div>
                                </div>
                            )) : <EmptyState text="Storage empty." icon={FileText} />}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* ── MODALS ──────────────────────────────────────── */}
            <AnimatePresence>

                {/* Compose */}
                {activeModal === 'compose' && (
                    <Modal onClose={() => setActiveModal(null)} title="Compose Message">
                        <form onSubmit={handleSendEmail} className="space-y-3.5">
                            <Field label="To" placeholder="recipient@example.com" onChange={e => setFormData({ ...formData, to: e.target.value })} />
                            <Field label="Subject" placeholder="Brief subject line"    onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                            <div>
                                <label className="text-[10px] text-zinc-400 font-semibold mb-1.5 block uppercase tracking-wider">Message</label>
                                <textarea rows={5} placeholder="Write your message here…"
                                    className="w-full bg-[#0a0a0a] border border-white/[0.09] rounded-lg py-2.5 px-3.5 text-[12px] xl:text-[13px] text-white outline-none focus:border-[#F3842A]/40 transition-colors resize-none"
                                    onChange={e => setFormData({ ...formData, body: e.target.value })} required />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={handleSaveDraft} disabled={loading}
                                    className="px-4 py-2 text-zinc-300 border border-white/[0.09] rounded-lg font-medium hover:bg-white/5 transition-colors text-[11px] xl:text-[12px]">
                                    Save Draft
                                </button>
                                <button type="submit" disabled={loading}
                                    className="px-5 py-2 bg-[#F3842A] hover:bg-[#e0751c] text-black rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 text-[11px] xl:text-[12px] transition-all active:scale-[0.97]">
                                    {loading ? 'Sending…' : 'Send'} <Send size={12} />
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Schedule Meeting */}
                {activeModal === 'meeting' && (
                    <Modal onClose={() => setActiveModal(null)} title="Schedule Meeting">
                        <form onSubmit={handleCreateMeeting} className="space-y-3.5">
                            <Field label="Event Title"            placeholder="E.g. Weekly Sync"  onChange={e => setFormData({ ...formData, summary: e.target.value })} />
                            <Field label="Description (Optional)" placeholder="Agenda items…"     onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            <div>
                                <label className="text-[10px] text-zinc-400 font-semibold mb-1.5 block uppercase tracking-wider">Start Time</label>
                                <input type="datetime-local"
                                    className="w-full bg-[#0a0a0a] border border-white/[0.09] rounded-lg py-2.5 px-3.5 text-[12px] xl:text-[13px] text-white outline-none focus:border-[#F3842A]/40 transition-colors"
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                            </div>
                            <div className="pt-2">
                                <button disabled={loading}
                                    className="w-full bg-[#F3842A] hover:bg-[#e0751c] text-black py-2.5 rounded-lg font-bold disabled:opacity-50 text-[11px] xl:text-[12px] transition-all active:scale-[0.98]">
                                    {loading ? 'Generating Link…' : 'Create Event & Get Link'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Drive Upload */}
                {activeModal === 'drive_upload' && (
                    <Modal onClose={() => setActiveModal(null)} title="Create Document">
                        <form onSubmit={handleUploadDrive} className="space-y-3.5">
                            <Field label="Document Name" placeholder="Meeting_Notes" onChange={e => setFormData({ ...formData, fileName: e.target.value })} />
                            <div>
                                <label className="text-[10px] text-zinc-400 font-semibold mb-1.5 block uppercase tracking-wider">Content</label>
                                <textarea rows={5} placeholder="Type your document content here…"
                                    className="w-full bg-[#0a0a0a] border border-white/[0.09] rounded-lg py-2.5 px-3.5 text-[12px] xl:text-[13px] text-white outline-none focus:border-[#F3842A]/40 transition-colors resize-none"
                                    onChange={e => setFormData({ ...formData, fileContent: e.target.value })} required />
                            </div>
                            <div className="pt-2">
                                <button disabled={loading}
                                    className="w-full bg-[#F3842A] hover:bg-[#e0751c] text-black py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 text-[11px] xl:text-[12px] transition-all active:scale-[0.98]">
                                    {loading ? 'Saving…' : 'Save to Drive'} <UploadCloud size={13} />
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* View Email / Reply */}
                {activeModal === 'view_email' && selectedItem && (
                    <Modal onClose={() => setActiveModal(null)} title="" wide>
                        <div className="flex flex-col max-h-[78vh]">
                            {/* subject */}
                            <div className="pb-4 mb-4 border-b border-white/[0.07]">
                                <h2 className="font-bold text-white leading-snug mb-3
                                    text-[15px] sm:text-[17px] xl:text-[18px]">
                                    {selectedItem.subject || '(No Subject)'}
                                </h2>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-[#1a1a1a] border border-white/10
                                            flex items-center justify-center font-bold text-zinc-300 text-[12px] xl:text-[13px]">
                                            {selectedItem.from.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[12px] xl:text-[13px] font-semibold text-white">
                                                {selectedItem.from.replace(/<.*>/, '').trim()}
                                            </p>
                                            <p className="text-[10px] xl:text-[11px] text-zinc-500">{extractEmail(selectedItem.from)}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] xl:text-[11px] text-zinc-500 shrink-0">
                                        {new Date(selectedItem.date).toLocaleDateString()} {new Date(selectedItem.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar mb-5 text-zinc-300 leading-relaxed whitespace-pre-wrap
                                text-[12px] xl:text-[13px] 2xl:text-[14px]">
                                {selectedItem.snippet}
                            </div>

                            {/* actions */}
                            <div className="shrink-0 pt-4 border-t border-white/[0.07]">
                                {!isReplying ? (
                                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-2">
                                        <button onClick={() => handleDeleteEmail(selectedItem.id)}
                                            className="w-full sm:w-auto px-4 py-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10
                                                rounded-lg text-[11px] font-medium flex items-center justify-center gap-2 transition-colors">
                                            <Trash2 size={13} /> Delete
                                        </button>
                                        <div className="flex w-full sm:w-auto gap-2">
                                            <a href={`https://mail.google.com/mail/u/0/#inbox/${selectedItem.id}`}
                                                target="_blank" rel="noreferrer"
                                                className="flex-1 sm:flex-none px-4 py-2 bg-[#111] text-zinc-300 border border-white/[0.09]
                                                    font-medium rounded-lg text-[11px] hover:bg-white/10 hover:text-white
                                                    flex items-center justify-center gap-2 transition-colors">
                                                Open in Gmail <ExternalLink size={12} />
                                            </a>
                                            <button onClick={() => setIsReplying(true)}
                                                className="flex-1 sm:flex-none px-5 py-2 bg-white text-black font-bold rounded-lg text-[11px]
                                                    hover:bg-zinc-200 flex items-center justify-center gap-2 transition-colors">
                                                <Reply size={13} /> Reply
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleReplyEmail} className="space-y-3">
                                        <textarea rows={4} required
                                            placeholder={`Reply to ${extractEmail(selectedItem.from)}…`}
                                            value={formData.replyBody || ''}
                                            onChange={e => setFormData({ ...formData, replyBody: e.target.value })}
                                            className="w-full bg-[#0a0a0a] border border-white/[0.09] rounded-lg py-2.5 px-3.5
                                                text-[12px] xl:text-[13px] text-white outline-none focus:border-[#F3842A]/40 resize-none transition-colors" />
                                        <div className="flex gap-2 justify-end">
                                            <button type="button" onClick={() => setIsReplying(false)}
                                                className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg text-[11px] font-medium transition-colors">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={loading}
                                                className="px-5 py-2 bg-[#F3842A] hover:bg-[#e0751c] text-black font-bold rounded-lg text-[11px]
                                                    flex items-center gap-2 transition-all disabled:opacity-50 active:scale-[0.97]">
                                                {loading ? 'Sending…' : 'Send Reply'} <Send size={12} />
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </Modal>
                )}

                {/* Meeting Created */}
                {activeModal === 'meeting_success' && createdMeeting && (
                    <Modal onClose={() => setActiveModal(null)} title="Meeting Created">
                        <div className="py-2">
                            <div className="bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-5 text-center mb-5">
                                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-2.5">
                                    <Video size={18} className="xl:w-5 xl:h-5 text-emerald-400" />
                                </div>
                                <h3 className="text-[14px] xl:text-[15px] font-bold text-emerald-400 mb-1">Google Meet Ready</h3>
                                <p className="text-zinc-400 text-[11px] xl:text-[12px]">Meeting scheduled & link generated.</p>
                            </div>
                            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 px-0.5">Meeting Link</p>
                            <div className="bg-[#0a0a0a] border border-white/[0.09] rounded-lg p-2 pl-3.5 flex items-center justify-between gap-3 mb-5">
                                <code className="text-zinc-200 text-[11px] xl:text-[12px] truncate select-all">{createdMeeting.link}</code>
                                <button onClick={() => copyToClipboard(createdMeeting.link)}
                                    className="p-1.5 xl:p-2 bg-[#1a1a1a] hover:bg-white/10 border border-white/[0.06] rounded-md
                                        text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-[10px] xl:text-[11px] font-medium shrink-0">
                                    <Copy size={12} /> Copy
                                </button>
                            </div>
                            <button onClick={() => setActiveModal(null)}
                                className="w-full bg-white text-black py-2.5 rounded-xl font-bold hover:bg-zinc-200 transition-colors text-[12px] xl:text-[13px]">
                                Done
                            </button>
                        </div>
                    </Modal>
                )}

            </AnimatePresence>
        </div>
    );
}

// ─── Sub-components ──────────────────────────────────────────

function TabBtn({ active, onClick, icon: Icon, label }) {
    return (
        <button onClick={onClick}
            className={`flex items-center gap-1.5 xl:gap-2
                px-3 py-1.5 xl:px-3.5 xl:py-2
                rounded-lg font-medium transition-colors whitespace-nowrap outline-none
                text-[10px] xl:text-[11px] 2xl:text-[12px]
                ${active ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'}`}>
            <Icon size={12} className={`xl:w-3.5 xl:h-3.5 ${active ? 'text-[#F3842A]' : 'text-zinc-500'}`} />
            {label}
        </button>
    );
}

function ActBtn({ icon: Icon, label, onClick }) {
    return (
        <button onClick={onClick}
            className="flex items-center gap-1.5
                px-2.5 py-1.5 xl:px-3 xl:py-2
                bg-[#0a0a0a] border border-white/[0.08] text-zinc-400
                hover:bg-white/[0.07] hover:text-white hover:border-white/[0.12]
                rounded-lg font-medium transition-all whitespace-nowrap
                text-[10px] xl:text-[11px] 2xl:text-[12px]">
            <Icon size={11} className="xl:w-3 xl:h-3" strokeWidth={2} />
            {label}
        </button>
    );
}

function Field({ label, ...props }) {
    return (
        <div>
            <label className="text-[10px] text-zinc-400 font-semibold mb-1.5 block uppercase tracking-wider">{label}</label>
            <input
                className="w-full bg-[#0a0a0a] border border-white/[0.09] rounded-lg py-2.5 px-3.5
                    text-[12px] xl:text-[13px] text-white outline-none focus:border-[#F3842A]/40 transition-colors"
                required {...props} />
        </div>
    );
}

function Modal({ children, onClose, title, wide = false }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className={`w-full ${wide ? 'sm:max-w-xl xl:max-w-2xl' : 'sm:max-w-md xl:max-w-lg'}
                    bg-[#111] border border-white/[0.09] rounded-t-[18px] sm:rounded-[18px]
                    shadow-2xl overflow-hidden flex flex-col relative z-10 max-h-[92vh]`}
            >
                {/* drag handle on mobile */}
                <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mt-3 sm:hidden" />

                {title && (
                    <div className="flex justify-between items-center px-5 py-3.5 xl:py-4 border-b border-white/[0.07] shrink-0">
                        <h2 className="text-[13px] xl:text-[14px] font-bold text-white tracking-tight">{title}</h2>
                        <button onClick={onClose}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <X size={15} />
                        </button>
                    </div>
                )}
                {!title && (
                    <button onClick={onClose}
                        className="absolute top-3.5 right-3.5 z-20 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <X size={15} />
                    </button>
                )}

                <div className={`p-4 sm:p-5 xl:p-6 overflow-y-auto custom-scrollbar ${!title ? 'pt-8 sm:pt-5' : ''}`}>
                    {children}
                </div>
            </motion.div>
        </div>
    );
}

function EmptyState({ text, icon: Icon }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 xl:py-24 px-4 opacity-50">
            <div className="w-10 h-10 xl:w-12 xl:h-12 bg-white/[0.04] rounded-full flex items-center justify-center mb-3">
                <Icon size={16} className="xl:w-5 xl:h-5 text-zinc-500" />
            </div>
            <p className="text-zinc-400 text-[11px] xl:text-[12px] font-medium">{text}</p>
        </div>
    );
}
