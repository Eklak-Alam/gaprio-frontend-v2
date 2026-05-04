'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, DollarSign, Calendar, TrendingUp, 
    Plus, UserPlus, X, Search, Filter, Layers, BarChart3,
    CheckCircle2, AlertCircle, ArrowRight, User, Mail, Building,
    ExternalLink
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

export default function ZohoWorkspace({ isConnected, data, user, onRefresh }) {
    
    // --- State ---
    const [activeModal, setActiveModal] = useState(null); 
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStage, setFilterStage] = useState('All');
    const [notification, setNotification] = useState(null);

    // --- Derived State (Metrics & Filtering) ---
    const deals = data.deals || [];
    
    // Calculate Total Pipeline Value
    const totalPipeline = useMemo(() => {
        return deals.reduce((acc, deal) => {
            const val = parseFloat(String(deal.amount).replace(/[^0-9.-]+/g,"")) || 0;
            return acc + val;
        }, 0).toLocaleString();
    }, [deals]);

    // Filter Logic
    const filteredDeals = deals.filter(deal => {
        const matchesSearch = deal.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStage = filterStage === 'All' || deal.stage === filterStage;
        return matchesSearch && matchesStage;
    });

    // --- Helpers ---
    const showToast = (type, text) => {
        setNotification({ type, text });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleAuth = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/zoho?userId=${user?.id}`;
    };

    const getStageColor = (stage) => {
        const s = stage?.toLowerCase() || '';
        if (s.includes('won') || s.includes('closed')) return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
        if (s.includes('negotiation') || s.includes('review')) return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
        if (s.includes('lost')) return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
    };

    // --- Actions ---
    const handleCreateDeal = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/integrations/zoho/deals', {
                dealName: formData.dealName,
                amount: formData.amount,
                stage: formData.stage
            });
            showToast('success', 'Deal successfully injected into pipeline.');
            setActiveModal(null);
            setFormData({});
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast('error', 'Failed to create deal.');
        } finally { setLoading(false); }
    };

    const handleCreateLead = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/integrations/zoho/leads', {
                lastName: formData.lastName,
                company: formData.company,
                email: formData.email
            });
            showToast('success', 'Lead captured and synced.');
            setActiveModal(null);
            setFormData({});
        } catch (err) {
            showToast('error', 'Failed to capture lead.');
        } finally { setLoading(false); }
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
                            <Image src="/companylogo/zoho.png" alt="Zoho" width={40} height={40} className="object-contain opacity-90" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Initialize Zoho Node</h3>
                        <p className="text-zinc-400 text-[13px] leading-relaxed mb-8">
                            Establish a secure connection to your Zoho CRM workspace to monitor pipeline data and deploy leads directly from Gaprio.
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
                                    Zoho CRM
                                </span>
                            </div>
                            
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight flex items-center gap-3 md:gap-4">
                                <Image src="/companylogo/zoho.png" alt="Zoho" width={32} height={32} className="object-contain w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
                                Sales Command
                            </h2>
                        </div>
                        
                        <div className="flex gap-3 w-full md:w-auto relative z-10 shrink-0">
                            <button onClick={() => setActiveModal('create_lead')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white rounded-xl text-sm font-medium transition-all active:scale-95">
                                <UserPlus size={16} /> Capture Lead
                            </button>
                            <button onClick={() => { setFormData({}); setActiveModal('create_deal'); }} className="flex-1 md:flex-none bg-white text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg">
                                <Plus size={16} className="transition-transform" /> Deploy Deal
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* --- TOOLBAR & STATS --- */}
                <motion.div variants={itemVariants} className="bg-[#050505] border border-white/5 rounded-2xl md:rounded-[24px] p-4 sm:p-6 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center relative z-20 shadow-xl">
                    
                    {/* Pipeline Stats */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full xl:w-auto">
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl px-5 py-3 flex-1 sm:w-48 shadow-inner">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Pipeline Value</p>
                            <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">${totalPipeline}</p>
                        </div>
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl px-5 py-3 flex-1 sm:w-40 shadow-inner">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Active Deals</p>
                            <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{deals.length}</p>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto shrink-0">
                        <div className="relative w-full sm:w-64">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input 
                                type="text" 
                                placeholder="Search pipeline..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[13px] text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-zinc-600 font-mono shadow-inner"
                            />
                        </div>
                        <div className="relative w-full sm:w-56">
                            <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                            <select 
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[13px] text-zinc-300 focus:outline-none focus:border-white/30 appearance-none cursor-pointer shadow-inner font-mono"
                                onChange={(e) => setFilterStage(e.target.value)}
                            >
                                <option value="All">All Stages</option>
                                <option value="Identify Decision Makers">Discovery</option>
                                <option value="Proposal/Price Quote">Proposal</option>
                                <option value="Negotiation/Review">Negotiation</option>
                                <option value="Closed Won">Closed Won</option>
                                <option value="Closed Lost">Closed Lost</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* --- DEALS GRID (Flat, No inner scrollbar) --- */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    <AnimatePresence mode='popLayout'>
                        {filteredDeals.length > 0 ? filteredDeals.map((deal, index) => {
                            const style = getStageColor(deal.stage);
                            return (
                                <motion.div 
                                    key={deal.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="group bg-[#050505] border border-white/5 rounded-[24px] p-5 sm:p-6 hover:border-white/10 transition-all hover:-translate-y-1 shadow-lg flex flex-col h-full"
                                >
                                    {/* Top Row */}
                                    <div className="flex justify-between items-start mb-5">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${style.bg} ${style.border}`}>
                                            <DollarSign size={18} className={style.text} />
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md border tracking-widest uppercase ${style.bg} ${style.text} ${style.border}`}>
                                            {deal.stage === 'Identify Decision Makers' ? 'Discovery' : deal.stage}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[15px] font-bold text-zinc-200 group-hover:text-white transition-colors mb-1 truncate" title={deal.name}>
                                            {deal.name}
                                        </h3>
                                        <p className="text-2xl font-bold text-white tracking-tight">{deal.amount}</p>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-4 border-t border-white/5 mt-5">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-zinc-600" />
                                            <span>{deal.date || 'No Date'}</span>
                                        </div>
                                        {deal.probability != null && (
                                            <div className="flex items-center gap-1.5">
                                                <BarChart3 size={12} className={deal.probability >= 50 ? 'text-emerald-500' : 'text-zinc-600'} />
                                                <span className={deal.probability >= 50 ? 'text-emerald-400' : ''}>{deal.probability}%</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="col-span-full h-64 flex flex-col items-center justify-center text-center py-20 px-4">
                                <div className="w-16 h-16 bg-[#050505] border border-white/5 rounded-2xl flex items-center justify-center mb-4">
                                    <Layers size={24} className="text-zinc-600" />
                                </div>
                                <h3 className="text-[15px] font-bold text-zinc-300 tracking-tight mb-1">Pipeline Empty</h3>
                                <p className="text-[12px] text-zinc-600">Try adjusting your filters or deploy a new deal vector.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>

            {/* --- MODALS --- */}
            <AnimatePresence>
                {activeModal && (
                    <Modal onClose={() => setActiveModal(null)} title={activeModal === 'create_deal' ? "Initialize Deal Vector" : "Capture Lead Telemetry"}>
                        <form onSubmit={activeModal === 'create_deal' ? handleCreateDeal : handleCreateLead} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                            
                            {/* Form Fields - Deal */}
                            {activeModal === 'create_deal' && (
                                <>
                                    <InputGroup label="Deal Identifier" value={formData.dealName} onChange={e => setFormData({...formData, dealName: e.target.value})} icon={Briefcase} placeholder="e.g. Q4 Marketing Contract" required autoFocus />
                                    <InputGroup label="Projected Value ($)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} icon={DollarSign} type="number" placeholder="5000" required />
                                    <div className="space-y-2 w-full">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Pipeline Stage</label>
                                        <div className="relative group">
                                            <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-zinc-600 transition-colors z-10 pointer-events-none">
                                                <TrendingUp size={16} />
                                            </div>
                                            <select 
                                                className="w-full bg-[#050505] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-[13px] text-zinc-200 focus:border-white/30 outline-none transition-colors font-mono shadow-inner appearance-none cursor-pointer"
                                                onChange={e => setFormData({...formData, stage: e.target.value})}
                                            >
                                                <option value="Identify Decision Makers">Discovery</option>
                                                <option value="Proposal/Price Quote">Proposal / Quote</option>
                                                <option value="Negotiation/Review">Negotiation</option>
                                                <option value="Closed Won">Closed Won</option>
                                                <option value="Closed Lost">Closed Lost</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Form Fields - Lead */}
                            {activeModal === 'create_lead' && (
                                <>
                                    <InputGroup label="Contact Identifier" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} icon={User} placeholder="e.g. Doe" required autoFocus />
                                    <InputGroup label="Organization" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} icon={Building} placeholder="e.g. Acme Corp" required />
                                    <InputGroup label="Comms Vector (Email)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} icon={Mail} type="email" placeholder="contact@domain.com" required />
                                </>
                            )}

                            <div className="pt-4 sm:pt-2 border-t border-white/5 sm:border-0 mt-2">
                                <button disabled={loading} className="w-full bg-white text-black py-3.5 rounded-xl text-[13px] font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                                    {loading ? 'Executing...' : (activeModal === 'create_deal' ? 'Deploy Deal' : 'Store Lead')}
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