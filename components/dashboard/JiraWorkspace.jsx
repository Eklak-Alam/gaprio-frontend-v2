'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ListTodo, ExternalLink, AlertCircle, CheckCircle2, 
    Circle, Plus, MessageSquare, X, Send, Terminal, Hash, AlignLeft
} from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/axios';

// --- Subtle SaaS Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export default function JiraWorkspace({ isConnected, data, user, onRefresh }) {
    
    // --- State ---
    const [activeModal, setActiveModal] = useState(null); // 'create_issue', 'view_issue'
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [formData, setFormData] = useState({});
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // --- Helpers ---
    const showToast = (type, text) => {
        setNotification({ type, text });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleAuth = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/jira?userId=${user?.id}`;
    };

    const getPriorityColor = (p) => {
        const priority = p?.toLowerCase() || '';
        if (priority.includes('high') || priority.includes('critical')) return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (priority.includes('medium')) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    };

    // --- Actions ---

    // 1. Create Issue
    const handleCreateIssue = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/integrations/jira/issues', {
                summary: formData.summary,
                description: formData.description,
                projectKey: formData.projectKey, 
                issueType: 'Task'
            });
            showToast('success', 'Issue deployed to Jira successfully.');
            setActiveModal(null);
            setFormData({});
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
            showToast('error', 'Failed to create issue. Verify Project Key.');
        } finally {
            setLoading(false);
        }
    };

    // 2. Add Comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setLoading(true);
        try {
            await api.post(`/integrations/jira/issues/${selectedIssue.key}/comment`, {
                comment: commentText
            });
            showToast('success', 'Comment appended to issue.');
            setCommentText('');
            setActiveModal(null);
        } catch (err) {
            showToast('error', 'Failed to append comment.');
        } finally {
            setLoading(false);
        }
    };

    const openIssue = (issue) => {
        setSelectedIssue(issue);
        setActiveModal('view_issue');
    };

    // --- RENDER DISCONNECTED STATE ---
    if (!isConnected) {
        return (
            <div className="w-full h-[calc(100vh-140px)] min-h-[500px] flex items-center justify-center p-4 sm:p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="max-w-md w-full bg-[#050505] border border-white/5 rounded-[24px] p-8 sm:p-10 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-[#0a0a0a] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Image src="/companylogo/jira.png" alt="Jira" width={40} height={40} className="object-contain opacity-90" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Initialize Jira Node</h3>
                        <p className="text-zinc-400 text-[13px] leading-relaxed mb-8">
                            Establish a secure connection to your Jira workspace to monitor engineering tasks and deploy issues directly from Gaprio.
                        </p>
                        <button 
                            onClick={handleAuth} 
                            className="w-full bg-white text-black py-3.5 rounded-xl text-[13px] font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-95"
                        >
                            Connect Workspace <ExternalLink size={16} />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // --- RENDER CONNECTED STATE ---
    return (
        <div className="w-full max-w-[1600px] mx-auto pb-20 px-0 sm:px-2">
            
            {/* --- Elite Toast Notification --- */}
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className={`fixed top-6 left-1/2 z-[200] px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md border flex items-center gap-2.5 w-[90%] max-w-sm sm:w-auto ${
                            notification.type === 'success' ? 'bg-[#0a0a0a]/90 border-emerald-500/30 text-emerald-500 shadow-[0_10px_40px_rgba(16,185,129,0.15)]' : 'bg-[#0a0a0a]/90 border-red-500/30 text-red-500 shadow-[0_10px_40px_rgba(239,68,68,0.15)]'
                        }`}
                    >
                        {notification.type === 'success' ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                        <span className="text-[13px] font-semibold text-white tracking-wide truncate">{notification.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">
                
                {/* --- MASTER HEADER --- */}
                <motion.div variants={itemVariants} className="relative w-full bg-[#050505] border border-white/5 rounded-2xl md:rounded-[24px] overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent z-20"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
                    
                    <div className="relative z-10 p-5 sm:p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="w-full md:max-w-2xl">
                            <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
                                <span className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono tracking-wider uppercase">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                    Node Active
                                </span>
                                <span className="text-[10px] sm:text-[11px] font-mono text-zinc-500 uppercase tracking-widest border border-white/5 px-2.5 py-1 rounded-md bg-white/[0.02]">
                                    Jira Software
                                </span>
                            </div>
                            
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight flex items-center gap-3 md:gap-4">
                                <Image src="/companylogo/jira.png" alt="Jira" width={32} height={32} className="object-contain w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
                                Engineering Command
                            </h2>
                        </div>
                        
                        <div className="w-full md:w-auto shrink-0 relative z-10">
                            <button 
                                onClick={() => { setFormData({}); setActiveModal('create_issue'); }} 
                                className="w-full md:w-auto px-5 sm:px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                            >
                                <Plus size={16} className="transition-transform" /> Deploy Issue
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* --- ISSUES LIST (Fully Responsive & Modernized) --- */}
                <motion.div variants={itemVariants} className="bg-[#050505] border border-white/5 rounded-2xl md:rounded-[24px] overflow-hidden flex flex-col relative min-h-[500px]">
                    <div className="p-4 sm:p-6">
                        
                        {/* Header Row (Desktop Only) */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-3 mb-2 border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <div className="col-span-7">Issue Summary</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Priority</div>
                            <div className="col-span-1 text-right">Action</div>
                        </div>

                        {data.issues?.length ? (
                            <div className="flex flex-col gap-2">
                                {data.issues.map(issue => (
                                    <div 
                                        key={issue.id} 
                                        onClick={() => openIssue(issue)}
                                        className="group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 rounded-xl border border-transparent hover:bg-white/[0.02] hover:border-white/5 transition-all cursor-pointer items-center"
                                    >
                                        {/* Summary & Key */}
                                        <div className="md:col-span-7 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0 w-full">
                                            <span className="shrink-0 text-[10px] font-mono text-zinc-400 bg-[#0a0a0a] px-2 py-1 rounded border border-white/5 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors w-max">
                                                {issue.key}
                                            </span>
                                            <span className="text-[13px] font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
                                                {issue.summary}
                                            </span>
                                        </div>

                                        {/* Mobile Metadata Container */}
                                        <div className="flex items-center gap-3 md:contents w-full mt-2 md:mt-0">
                                            
                                            {/* Status */}
                                            <div className="md:col-span-2 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-zinc-400 bg-white/5 md:bg-transparent px-2 py-1 md:p-0 rounded border border-white/5 md:border-transparent w-max">
                                                {issue.status === 'Done' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Circle size={12} className="text-blue-500" />}
                                                <span className={issue.status === 'Done' ? 'text-emerald-500' : ''}>{issue.status}</span>
                                            </div>

                                            {/* Priority */}
                                            <div className="md:col-span-2 flex items-center">
                                                <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest border ${getPriorityColor(issue.priority)} w-max`}>
                                                    {issue.priority}
                                                </span>
                                            </div>

                                            {/* Action Link (Desktop shows on right, Mobile pushes to right) */}
                                            <div className="md:col-span-1 flex justify-end ml-auto">
                                                <a 
                                                    href={issue.link} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()} 
                                                    className="p-2 text-zinc-600 hover:text-white bg-white/[0.02] hover:bg-white/10 rounded-lg transition-all border border-white/5 hover:border-white/20"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={ListTodo} title="Queue is Empty" desc="No issues assigned to you in the synchronized Jira workspace." />
                        )}
                    </div>
                </motion.div>

            </motion.div>

            {/* --- MODALS --- */}
            <AnimatePresence>
                
                {/* 1. CREATE ISSUE MODAL */}
                {activeModal === 'create_issue' && (
                    <Modal onClose={() => setActiveModal(null)} title="Initialize Jira Issue">
                        <form onSubmit={handleCreateIssue} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                            <InputGroup label="Project Key" value={formData.projectKey} onChange={e => setFormData({...formData, projectKey: e.target.value.toUpperCase()})} icon={Hash} placeholder="e.g. GAP, PROJ" required />
                            <InputGroup label="Summary" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} icon={Terminal} placeholder="e.g. Bug: API Response Latency" required />
                            
                            <div className="space-y-2 w-full">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Description / Parameters</label>
                                <textarea 
                                    placeholder="Enter reproduction steps or task details..." 
                                    rows={5} 
                                    value={formData.description || ''} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    className="w-full bg-[#050505] border border-white/10 focus:border-white/30 rounded-xl p-4 text-[13px] text-zinc-200 outline-none transition-colors resize-none font-mono" 
                                />
                            </div>

                            <div className="pt-4 sm:pt-2 border-t border-white/5 sm:border-0 mt-2">
                                <button disabled={loading} className="w-full bg-white text-black py-3.5 rounded-xl text-[13px] font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                                    {loading ? 'Executing...' : 'Deploy Issue'} <Plus size={16} />
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* 2. VIEW ISSUE / ADD COMMENT MODAL */}
                {activeModal === 'view_issue' && selectedIssue && (
                    <Modal onClose={() => setActiveModal(null)} title="Issue Telemetry">
                        <div className="flex flex-col h-[70vh] sm:h-[65vh]">
                            
                            {/* Issue Header */}
                            <div className="border-b border-white/5 px-5 sm:px-8 py-5 sm:py-6 bg-[#0a0a0a] shrink-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">
                                        {selectedIssue.key}
                                    </span>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${getPriorityColor(selectedIssue.priority)}`}>
                                        {selectedIssue.priority}
                                    </span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">{selectedIssue.summary}</h3>
                            </div>
                            
                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#050505] custom-scrollbar space-y-6" data-lenis-prevent="true">
                                <div className="p-5 rounded-xl border border-white/5 bg-[#0a0a0a]">
                                    <div className="flex items-center gap-2 mb-3 text-zinc-500">
                                        <AlignLeft size={14} />
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest">Description</h4>
                                    </div>
                                    <p className="font-mono text-[12px] sm:text-[13px] text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                                        {selectedIssue.description || "No description provided for this issue."}
                                    </p>
                                </div>
                                
                                <div className="p-5 rounded-xl border border-white/5 bg-[#0a0a0a]">
                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <MessageSquare size={14} /> Append Comment
                                    </h4>
                                    <form onSubmit={handleAddComment}>
                                        <textarea 
                                            placeholder="Transmit update..." 
                                            rows={3} 
                                            className="w-full bg-[#050505] border border-white/10 focus:border-blue-500/50 rounded-xl p-4 text-[13px] text-zinc-200 outline-none transition-colors resize-none font-mono mb-3" 
                                            value={commentText}
                                            onChange={e => setCommentText(e.target.value)}
                                            required
                                        />
                                        <div className="flex justify-end gap-3">
                                            <a href={selectedIssue.link} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-colors flex items-center gap-2">
                                                Open in Jira <ExternalLink size={12} />
                                            </a>
                                            <button disabled={loading} className="px-5 py-2 bg-white text-black rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2 active:scale-95 disabled:opacity-50">
                                                {loading ? 'Transmitting...' : 'Post Comment'} <Send size={12} />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </Modal>
                )}

            </AnimatePresence>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function Modal({ children, onClose, title, wide = false }) {
    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`relative w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} bg-[#0a0a0a] sm:border border-white/5 rounded-t-[24px] sm:rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}
            >
                <div className="flex justify-between items-center p-5 sm:p-6 border-b border-white/5 bg-[#050505] z-20 shrink-0">
                    <h2 className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase">{title}</h2>
                    <button onClick={onClose} className="p-1.5 text-zinc-600 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                        <X size={16}/>
                    </button>
                </div>
                <div className="overflow-y-auto no-scrollbar flex-1 w-full" data-lenis-prevent="true">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, desc }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 px-4 w-full h-full min-h-[300px]">
            <div className="w-16 h-16 bg-[#0a0a0a] border border-white/5 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                <Icon size={24} className="text-zinc-600" />
            </div>
            <p className="text-[15px] font-bold text-zinc-300 tracking-tight">{title}</p>
            <p className="text-[12px] text-zinc-600 mt-1 max-w-[220px]">{desc}</p>
        </div>
    );
}

function InputGroup({ label, value, onChange, icon: Icon, type = "text", placeholder, required }) {
    return (
        <div className="space-y-2 w-full">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-zinc-600 transition-colors z-10">
                    <Icon size={16} />
                </div>
                <input 
                    type={type} value={value || ''} onChange={onChange} placeholder={placeholder} required={required}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-[13px] text-zinc-200 placeholder:text-zinc-700 focus:border-white/30 outline-none transition-colors font-mono shadow-inner" 
                />
            </div>
        </div>
    );
}