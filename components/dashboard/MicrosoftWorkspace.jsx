'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, FileSpreadsheet, Presentation, Calendar, 
    ExternalLink, Clock, Plus, X, Search, Filter, 
    Layers, Zap, CalendarPlus, FilePlus, CheckCircle2, AlertCircle
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

export default function MicrosoftWorkspace({ isConnected, data, user, onRefresh }) {

    // --- State ---
    const [activeModal, setActiveModal] = useState(null); // 'create_doc', 'create_event'
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [notification, setNotification] = useState(null);

    // --- Derived State ---
    const documents = data?.documents || [];
    
    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || doc.type === filterType;
        return matchesSearch && matchesType;
    });

    // --- Helpers ---
    const showToast = (type, text) => {
        setNotification({ type, text });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleAuth = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft?userId=${user?.id}`;
    };

    const getDocIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'excel': return <FileSpreadsheet size={18} className="text-green-500" />;
            case 'powerpoint': return <Presentation size={18} className="text-orange-500" />;
            case 'word': default: return <FileText size={18} className="text-blue-500" />;
        }
    };

    // --- Actions ---
    const handleCreateDocument = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/integrations/microsoft/documents', {
                name: formData.name,
                type: formData.type || 'Word'
            });
            
            if (res.data.data.webUrl) {
                window.open(res.data.data.webUrl, '_blank');
            }
            
            showToast('success', 'Document initialized in OneDrive.');
            setActiveModal(null);
            setFormData({});
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
            showToast('error', 'Failed to initialize document.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/integrations/microsoft/events', {
                title: formData.title,
                date: formData.date,
                time: formData.time
            });
            
            showToast('success', 'Event successfully injected to Outlook.');
            setActiveModal(null);
            setFormData({});
        } catch (err) {
            console.error(err);
            showToast('error', 'Failed to schedule event.');
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
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-[#0a0a0a] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Image src="/companylogo/microsoft.webp" alt="Microsoft 365" width={40} height={40} className="object-contain opacity-90" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Initialize Microsoft Node</h3>
                        <p className="text-zinc-400 text-[13px] leading-relaxed mb-8">
                            Establish a secure connection to your Microsoft 365 account to manage OneDrive files and deploy Outlook events directly from Gaprio.
                        </p>
                        <button 
                            onClick={handleAuth} 
                            className="w-full bg-white text-black py-3.5 rounded-xl text-[13px] font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-lg"
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
                                    Microsoft 365
                                </span>
                            </div>
                            
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight flex items-center gap-3 md:gap-4">
                                <Image src="/companylogo/microsoft.webp" alt="Microsoft" width={32} height={32} className="object-contain w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
                                Office Command
                            </h2>
                        </div>
                        
                        <div className="w-full md:w-auto shrink-0 relative z-10 flex flex-col sm:flex-row gap-3">
                            <button onClick={() => setActiveModal('create_event')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white rounded-xl text-sm font-medium transition-all active:scale-95">
                                <CalendarPlus size={16} /> New Event
                            </button>
                            <button onClick={() => { setFormData({}); setActiveModal('create_doc'); }} className="flex-1 sm:flex-none bg-white text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg">
                                <FilePlus size={16} /> Deploy Document
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* --- TOOLBAR & SEARCH --- */}
                <motion.div variants={itemVariants} className="bg-[#050505] border border-white/5 rounded-2xl md:rounded-[24px] p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center relative z-20 shadow-xl">
                    <div className="relative w-full sm:w-80 shrink-0">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                            type="text" 
                            placeholder="Search directory..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-zinc-600 font-mono shadow-inner"
                        />
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                        <select 
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-zinc-300 focus:outline-none focus:border-white/30 appearance-none cursor-pointer shadow-inner font-mono"
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="All">All File Types</option>
                            <option value="Word">Word Documents</option>
                            <option value="Excel">Excel Spreadsheets</option>
                            <option value="PowerPoint">Presentations</option>
                        </select>
                    </div>
                </motion.div>

                {/* --- DOCUMENTS GRID (Flat, No inner scrollbar) --- */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    <AnimatePresence mode='popLayout'>
                        {filteredDocs.length > 0 ? filteredDocs.map((doc, index) => (
                            <motion.a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noreferrer"
                                key={doc.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="group bg-[#050505] border border-white/5 rounded-[24px] p-5 sm:p-6 hover:border-white/20 transition-all hover:-translate-y-1 shadow-lg flex flex-col h-full relative"
                            >
                                <div className="absolute top-5 right-5 text-zinc-600 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100">
                                    <ExternalLink size={16} />
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center mb-5 shadow-inner group-hover:border-white/10 transition-colors">
                                    {getDocIcon(doc.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[15px] font-bold text-zinc-200 group-hover:text-white transition-colors mb-2 line-clamp-2" title={doc.name}>
                                        {doc.name}
                                    </h3>
                                    <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">{doc.type}</p>
                                </div>

                                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 pt-5 border-t border-white/5 mt-5">
                                    <Clock size={12} className="text-zinc-600" />
                                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </motion.a>
                        )) : (
                            <div className="col-span-full h-64 flex flex-col items-center justify-center text-center py-20 px-4">
                                <div className="w-16 h-16 bg-[#050505] border border-white/5 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                    <Layers size={24} className="text-zinc-600" />
                                </div>
                                <h3 className="text-[15px] font-bold text-zinc-300 tracking-tight mb-1">Directory Empty</h3>
                                <p className="text-[12px] text-zinc-600">Try adjusting your filters or deploy a new document vector.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>

            {/* --- MODALS --- */}
            <AnimatePresence>
                
                {/* 1. CREATE DOCUMENT MODAL */}
                {activeModal === 'create_doc' && (
                    <Modal onClose={() => setActiveModal(null)} title="Initialize Document">
                        <form onSubmit={handleCreateDocument} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                            <InputGroup label="Document Identifier" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} icon={FileText} placeholder="e.g. Q4 Financial Report" required autoFocus />
                            
                            <div className="space-y-2 w-full">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Data Type</label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-zinc-600 transition-colors z-10 pointer-events-none">
                                        <Layers size={16} />
                                    </div>
                                    <select 
                                        className="w-full bg-[#050505] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-[13px] text-zinc-200 focus:border-white/30 outline-none transition-colors font-mono shadow-inner appearance-none cursor-pointer"
                                        onChange={e => setFormData({...formData, type: e.target.value})}
                                    >
                                        <option value="Word">Microsoft Word (.docx)</option>
                                        <option value="Excel">Microsoft Excel (.xlsx)</option>
                                        <option value="PowerPoint">PowerPoint (.pptx)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-3 mt-2">
                                <ExternalLink size={16} className="text-blue-500 mt-0.5 shrink-0" /> 
                                <div>
                                    <p className="text-[12px] font-bold text-blue-500">Auto-Deploy</p>
                                    <p className="text-[11px] text-zinc-400 mt-1">The secure file will open automatically in OneDrive upon initialization.</p>
                                </div>
                            </div>

                            <div className="pt-4 sm:pt-2 border-t border-white/5 sm:border-0 mt-2">
                                <button disabled={loading} className="w-full bg-white text-black py-3.5 rounded-xl text-[13px] font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                                    {loading ? 'Executing...' : 'Deploy Document'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* 2. CREATE EVENT MODAL */}
                {activeModal === 'create_event' && (
                    <Modal onClose={() => setActiveModal(null)} title="Schedule Event">
                        <form onSubmit={handleCreateEvent} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                            <InputGroup label="Event Designation" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} icon={CalendarPlus} placeholder="e.g. Product Sync" required autoFocus />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} icon={Calendar} type="date" required />
                                <InputGroup label="Time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} icon={Clock} type="time" required />
                            </div>

                            <div className="pt-4 sm:pt-2 border-t border-white/5 sm:border-0 mt-2">
                                <button disabled={loading} className="w-full bg-white text-black py-3.5 rounded-xl text-[13px] font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                                    {loading ? 'Transmitting...' : 'Inject into Outlook'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

        </div>
    );
}

// --- REUSABLE SUB-COMPONENTS ---

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
                <div className="overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1 w-full" data-lenis-prevent="true">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}

function InputGroup({ label, value, onChange, icon: Icon, type = "text", placeholder, required, autoFocus }) {
    return (
        <div className="space-y-2 w-full">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-zinc-600 transition-colors z-10 pointer-events-none">
                    <Icon size={16} />
                </div>
                <input 
                    type={type} value={value || ''} onChange={onChange} placeholder={placeholder} required={required} autoFocus={autoFocus}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-[13px] text-zinc-200 placeholder:text-zinc-700 focus:border-white/30 outline-none transition-colors font-mono shadow-inner" 
                />
            </div>
        </div>
    );
}