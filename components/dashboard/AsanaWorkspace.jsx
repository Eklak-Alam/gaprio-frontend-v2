'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckSquare, Briefcase, List, Calendar as CalIcon, 
    ArrowRight, Plus, X, CheckCircle2, Circle, AlertCircle, Loader2
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

export default function AsanaWorkspace({ isConnected, data, user, onRefresh }) {
    
    // --- State ---
    const [activeModal, setActiveModal] = useState(null); // 'create_task'
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [completingTask, setCompletingTask] = useState(null); 
    const [notification, setNotification] = useState(null);

    // --- Helpers ---
    const showToast = (type, text) => {
        setNotification({ type, text });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleAuth = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/asana?userId=${user?.id}`;
    };

    // --- Actions ---

    // 1. Create Task
    const handleCreateTask = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/integrations/asana/tasks', {
                name: formData.name,
                notes: formData.notes,
                date: formData.date
            });
            showToast('success', 'Task successfully injected.');
            setActiveModal(null);
            setFormData({});
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
            showToast('error', 'Failed to create task. Check parameters.');
        } finally {
            setLoading(false);
        }
    };

    // 2. Mark Complete
    const handleCompleteTask = async (taskId) => {
        setCompletingTask(taskId);
        try {
            await api.put(`/integrations/asana/tasks/${taskId}/complete`);
            showToast('success', 'Task execution verified.');
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
            showToast('error', 'Failed to verify task execution.');
        } finally {
            setCompletingTask(null);
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
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-[#0a0a0a] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Image src="/companylogo/asana.png" alt="Asana" width={40} height={40} className="object-contain opacity-90" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Initialize Asana Node</h3>
                        <p className="text-zinc-400 text-[13px] leading-relaxed mb-8">
                            Establish a secure connection to your Asana workspace to synchronize projects and execute tasks directly from the Gaprio command center.
                        </p>
                        <button 
                            onClick={handleAuth} 
                            className="w-full bg-white text-black py-3.5 rounded-xl text-[13px] font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-95"
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
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
                    
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
                                    Asana Sync
                                </span>
                            </div>
                            
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight flex items-center gap-3 md:gap-4">
                                <Image src="/companylogo/asana.png" alt="Asana" width={32} height={32} className="object-contain w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
                                Project Command
                            </h2>
                        </div>
                        
                        <div className="w-full md:w-auto shrink-0 relative z-10">
                            <button 
                                onClick={() => { setFormData({}); setActiveModal('create_task'); }} 
                                className="w-full md:w-auto px-5 sm:px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                            >
                                <Plus size={16} className="transition-transform" /> Initialize Task
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* --- CONTENT GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* 1. PROJECTS LIST */}
                    <motion.div variants={itemVariants} className="h-full">
                        <WidgetCard title="Active Projects" icon={Briefcase} count={data.projects?.length || 0}>
                            {data.projects?.length ? data.projects.slice(0, 10).map(project => (
                                <div key={project.gid} className="p-4 bg-[#0a0a0a] hover:bg-white/[0.03] rounded-xl border border-white/5 hover:border-white/10 group transition-all flex justify-between items-center cursor-pointer">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: project.color || '#F97316' }} />
                                        <div className="min-w-0">
                                            <h4 className="text-[14px] font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">{project.name}</h4>
                                            <p className="text-[10px] text-zinc-600 font-mono mt-0.5 tracking-wider uppercase">PID: {project.gid.slice(-6)}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-[#050505] border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-orange-500 group-hover:border-orange-500/30 transition-colors shrink-0 ml-3">
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            )) : <EmptyState icon={Briefcase} title="No Active Projects" desc="Zero project vectors found in the synchronized workspace." />}
                        </WidgetCard>
                    </motion.div>

                    {/* 2. TASKS LIST */}
                    <motion.div variants={itemVariants} className="h-full">
                        <WidgetCard title="Task Directives" icon={CheckSquare} count={data.tasks?.length || 0}>
                            {data.tasks?.length ? data.tasks.slice(0, 10).map(task => (
                                <div key={task.gid} className={`p-4 bg-[#0a0a0a] rounded-xl border group transition-all ${task.completed ? 'opacity-50 border-transparent' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.03]'}`}>
                                    <div className="flex items-start gap-4">
                                        
                                        {/* Checkbox / Loading Spinner */}
                                        <button 
                                            disabled={task.completed || completingTask === task.gid}
                                            onClick={() => handleCompleteTask(task.gid)}
                                            className={`mt-0.5 shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-zinc-600 hover:text-orange-500'}`}
                                        >
                                            {completingTask === task.gid ? (
                                                <Loader2 size={18} className="animate-spin text-orange-500" />
                                            ) : task.completed ? (
                                                <CheckCircle2 size={18} />
                                            ) : (
                                                <Circle size={18} />
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-[14px] font-semibold truncate transition-all ${task.completed ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-zinc-200 group-hover:text-white'}`}>
                                                {task.name}
                                            </h4>
                                            
                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                {task.due_on && (
                                                    <div className={`flex items-center gap-1.5 text-[11px] font-mono tracking-wide ${new Date(task.due_on) < new Date() && !task.completed ? 'text-red-500' : 'text-zinc-500'}`}>
                                                        <CalIcon size={12} />
                                                        <span>{new Date(task.due_on).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                )}
                                                {task.projects && task.projects[0] && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-[#050505] border border-white/5 px-2 py-0.5 rounded-md font-medium uppercase tracking-widest">
                                                        <Briefcase size={10} className="text-zinc-500" />
                                                        <span className="truncate max-w-[150px]">{task.projects[0].name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : <EmptyState icon={CheckSquare} title="Directive Clear" desc="No pending tasks assigned to your profile." />}
                        </WidgetCard>
                    </motion.div>
                </div>
            </motion.div>

            {/* --- MODALS --- */}
            <AnimatePresence>
                {activeModal === 'create_task' && (
                    <Modal onClose={() => setActiveModal(null)} title="Initialize Task Directive">
                        <form onSubmit={handleCreateTask} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                            <InputGroup label="Directive Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} icon={CheckSquare} placeholder="e.g. Optimize Database Queries" required />
                            <InputGroup label="Deadline" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} icon={CalIcon} type="date" />
                            
                            <div className="space-y-2 w-full">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Parameters (Notes)</label>
                                <textarea 
                                    placeholder="Enter detailed execution parameters..." 
                                    rows={5} 
                                    value={formData.notes || ''} 
                                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                                    className="w-full bg-[#050505] border border-white/10 focus:border-white/30 rounded-xl p-4 text-[13px] text-zinc-200 outline-none transition-colors resize-none font-mono" 
                                />
                            </div>

                            <div className="pt-4 sm:pt-2 border-t border-white/5 sm:border-0 mt-2">
                                <button disabled={loading} className="w-full bg-white text-black py-3.5 rounded-xl text-[13px] font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                                    {loading ? 'Executing...' : 'Initialize Task'}
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

function WidgetCard({ title, icon: Icon, children, count }) {
    return (
        <div className="bg-[#050505] border border-white/5 rounded-[24px] flex flex-col h-full overflow-hidden relative shadow-lg">
            <div className="px-5 sm:px-6 py-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <Icon size={16} className="text-zinc-500" />
                    <h3 className="text-[13px] font-bold text-zinc-200 uppercase tracking-widest">{title}</h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">{count}</span>
            </div>
            {/* INVISIBLE SCROLLBAR APPLIED HERE */}
            <div className="flex-1 p-4 sm:p-5 flex flex-col space-y-2 overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" data-lenis-prevent="true">
                {children}
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, desc }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 sm:py-20 px-4 w-full h-full min-h-[250px]">
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