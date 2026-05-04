'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutTemplate, ExternalLink, Clock, Plus, 
    X, CheckCircle2, AlertCircle, ArrowRight
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

export default function MiroWorkspace({ isConnected, data, user, onRefresh }) {
    
    // --- State ---
    const [activeModal, setActiveModal] = useState(null); // 'create_board'
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // --- Helpers ---
    const showToast = (type, text) => {
        setNotification({ type, text });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleAuth = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/miro?userId=${user?.id}`;
    };

    // --- Actions ---
    const handleCreateBoard = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/integrations/miro/boards', {
                name: formData.name,
                description: formData.description
            });
            
            // Success: Open the new board immediately
            if (res.data.data.viewLink) {
                window.open(res.data.data.viewLink, '_blank');
            }
            
            showToast('success', 'Visual vector initialized.');
            setActiveModal(null);
            setFormData({});
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
            showToast('error', 'Failed to initialize board.');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER DISCONNECTED STATE ---
    if (!isConnected) {
        return (
            <div className="w-full h-[calc(100vh-140px)] min-h-[500px] flex items-center justify-center p-4 sm:p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="max-w-md w-full bg-[#050505] border border-white/5 rounded-[24px] p-8 sm:p-10 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-[#0a0a0a] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Image src="/companylogo/miro.png" alt="Miro" width={40} height={40} className="object-contain opacity-90" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Initialize Miro Node</h3>
                        <p className="text-zinc-400 text-[13px] leading-relaxed mb-8">
                            Establish a secure connection to your Miro workspace to monitor visual networks and deploy new boards directly from Gaprio.
                        </p>
                        <button 
                            onClick={handleAuth} 
                            className="w-full bg-white text-black py-3.5 rounded-xl text-[13px] font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                        >
                            Connect Workspace <ArrowRight size={16} />
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
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent z-20"></div>
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
                                    Miro Sync
                                </span>
                            </div>
                            
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight flex items-center gap-3 md:gap-4">
                                <Image src="/companylogo/miro.png" alt="Miro" width={32} height={32} className="object-contain w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
                                Visual Command
                            </h2>
                        </div>
                        
                        <div className="w-full md:w-auto shrink-0 relative z-10">
                            <button 
                                onClick={() => { setFormData({}); setActiveModal('create_board'); }} 
                                className="w-full md:w-auto px-5 sm:px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                            >
                                <Plus size={16} className="transition-transform" /> Deploy Board
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* --- BOARDS GRID --- */}
                {/* RESPONSIVE FIX: Removed hardcoded heights and inner scrollbars. Allowed grid to flow naturally. */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {data.boards?.length ? data.boards.map(board => (
                        <a 
                            href={board.url} 
                            target="_blank" 
                            rel="noreferrer"
                            key={board.id} 
                            className="group relative bg-[#050505] border border-white/5 hover:border-white/20 rounded-[24px] overflow-hidden transition-all duration-300 flex flex-col h-[280px]"
                        >
                            {/* Thumbnail Area */}
                            <div className="flex-[2] w-full flex items-center justify-center relative overflow-hidden bg-[#0a0a0a] border-b border-white/5">
                                {board.thumbnail ? (
                                    <img 
                                        src={board.thumbnail} 
                                        alt={board.name} 
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50 pointer-events-none" />
                                )}
                                
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
                                
                                {/* Hover Open Badge */}
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    <ExternalLink size={16} className="text-white" />
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 p-5 relative z-10 flex flex-col justify-center">
                                <h3 className="text-[15px] font-bold text-zinc-200 group-hover:text-white transition-colors truncate mb-2">{board.name}</h3>
                                <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono tracking-wide">
                                    <Clock size={12} className="text-zinc-600" />
                                    <span>{new Date(board.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </a>
                    )) : (
                        <div className="col-span-full">
                            <EmptyState icon={LayoutTemplate} title="No Visuals Found" desc="Zero board vectors found in the synchronized workspace." />
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* --- MODALS --- */}
            <AnimatePresence>
                {activeModal === 'create_board' && (
                    <Modal onClose={() => setActiveModal(null)} title="Initialize Board">
                        <form onSubmit={handleCreateBoard} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                            <InputGroup label="Vector Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} icon={LayoutTemplate} placeholder="e.g. Q3 Architecture Map" required />
                            
                            <div className="space-y-2 w-full">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Context</label>
                                <textarea 
                                    placeholder="Enter board parameters..." 
                                    rows={4} 
                                    value={formData.description || ''} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    className="w-full bg-[#050505] border border-white/10 focus:border-white/30 rounded-xl p-4 text-[13px] text-zinc-200 outline-none transition-colors resize-none font-mono" 
                                />
                            </div>

                            <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl flex items-start gap-3 mt-2">
                                <ExternalLink size={16} className="text-orange-500 mt-0.5 shrink-0" /> 
                                <div>
                                    <p className="text-[12px] font-bold text-orange-500">Auto-Deploy</p>
                                    <p className="text-[11px] text-zinc-400 mt-1">The new visual environment will launch in a separate secure tab immediately.</p>
                                </div>
                            </div>

                            <div className="pt-4 sm:pt-2 border-t border-white/5 sm:border-0 mt-2">
                                <button disabled={loading} className="w-full bg-white text-black py-3.5 rounded-xl text-[13px] font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                                    {loading ? 'Executing...' : 'Deploy Board'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

        </div>
    );
}

// --- SUB-COMPONENTS ---

function Modal({ children, onClose, title }) {
    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full sm:max-w-md bg-[#0a0a0a] sm:border border-white/5 rounded-t-[24px] sm:rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
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