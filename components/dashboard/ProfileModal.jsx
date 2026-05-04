'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, User, Mail, Shield, Key, Camera, Check, 
    ChevronRight, AlertCircle, LogOut, Smartphone 
} from 'lucide-react';
import api from '@/lib/axios';

export default function ProfileModal({ user, isOpen, onClose, onUpdate }) {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const [formData, setFormData] = useState({ fullName: '', email: '' });
    const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        if (isOpen && user) {
            setFormData({ fullName: user.full_name || '', email: user.email || '' });
            setNotification(null);
            setActiveTab('general'); 
        }
    }, [isOpen, user]);

    // Prevent background scrolling on mobile when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const showToast = (type, text) => {
        setNotification({ type, text });
        setTimeout(() => setNotification(null), 3500);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/auth/me', formData);
            onUpdate(res.data.data);
            showToast('success', 'Profile updated successfully');
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Update failed');
        } finally { setLoading(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (securityData.newPassword !== securityData.confirmPassword) {
            showToast('error', "New passwords don't match");
            setLoading(false);
            return;
        }
        try {
            await api.put('/auth/password', { 
                oldPassword: securityData.currentPassword, 
                newPassword: securityData.newPassword 
            });
            showToast('success', 'Password changed successfully');
            setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed to change password');
        } finally { setLoading(false); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-6 lg:p-10">
                    
                    {/* Modal Overlay for Click-to-Close */}
                    <motion.div 
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    {/* Modal Container - STRICT HEIGHT LOCK */}
                    <motion.div
                        key="modal-content"
                        initial={{ scale: 0.98, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.98, opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        // h-[100dvh] forces full height on mobile (accounting for browser UI)
                        // md:h-[650px] locks the height on desktop so it never jumps
                        className="w-full h-[100dvh] md:h-[650px] md:max-h-[85vh] md:max-w-4xl lg:max-w-5xl bg-[#09090b] md:rounded-2xl flex flex-col md:flex-row overflow-hidden relative border-0 md:border border-zinc-800 z-10"
                    >
                        
                        {/* --- SIDEBAR / MOBILE HEADER --- */}
                        <div className="w-full md:w-72 bg-[#09090b] border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col shrink-0 z-10">
                            
                            {/* User Profile Section */}
                            <div className="p-5 md:p-8 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-6 text-left">
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                                        <span className="text-xl md:text-2xl font-bold text-orange-500 uppercase">
                                            {user?.full_name?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-zinc-800 text-white p-1.5 rounded-full border border-zinc-700 cursor-pointer hover:bg-zinc-700 transition-colors">
                                        <Camera size={12} className="md:w-3.5 md:h-3.5" />
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-base md:text-xl font-bold text-white truncate w-full">{user?.full_name || 'User'}</h2>
                                    <p className="text-xs md:text-sm text-zinc-500 truncate w-full">{user?.email}</p>
                                    <div className="inline-block mt-1 md:mt-2 px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                                        <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">Free Tier</p>
                                    </div>
                                </div>

                                {/* Mobile Close Button */}
                                <button 
                                    onClick={onClose} 
                                    className="md:hidden p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-all ml-auto border border-zinc-800"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Navigation Tabs */}
                            <nav className="flex-none md:flex-1 flex flex-row md:flex-col gap-1 p-3 md:p-4 overflow-x-auto md:overflow-x-visible overflow-y-hidden md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <SidebarTab 
                                    active={activeTab === 'general'} 
                                    onClick={() => setActiveTab('general')} 
                                    icon={User} 
                                    label="General Info" 
                                />
                                <SidebarTab 
                                    active={activeTab === 'security'} 
                                    onClick={() => setActiveTab('security')} 
                                    icon={Shield} 
                                    label="Security" 
                                />
                            </nav>

                            {/* Bottom Actions (Desktop Only) */}
                            <div className="hidden md:block mt-auto p-4 border-t border-zinc-800">
                                <button className="flex items-center gap-3 w-full p-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors text-sm font-medium border border-transparent hover:border-zinc-800">
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        </div>

                        {/* --- RIGHT CONTENT AREA --- */}
                        <div className="flex-1 flex flex-col relative min-w-0 bg-[#09090b]">
                            
                            {/* Desktop Close Button */}
                            <button 
                                onClick={onClose} 
                                className="hidden md:flex absolute top-6 right-6 z-20 p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all border border-zinc-800"
                            >
                                <X size={20} />
                            </button>

                            {/* STRICT SCROLL CONTAINER:
                                flex-1 makes it take up remaining vertical space
                                overflow-y-auto enables independent scrolling inside this box 
                            */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 relative [scrollbar-width:thin] [scrollbar-color:#3f3f46_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                                <AnimatePresence mode="wait">
                                    
                                    {/* 1. GENERAL TAB */}
                                    {activeTab === 'general' && (
                                        <motion.div 
                                            key="general"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="max-w-2xl mx-auto space-y-8 pb-10"
                                        >
                                            <Header title="General Information" sub="Update your personal details and public profile." />
                                            
                                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <InputGroup 
                                                        label="Full Name" 
                                                        value={formData.fullName} 
                                                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                                                        icon={User} 
                                                    />
                                                    <InputGroup 
                                                        label="Email Address" 
                                                        value={formData.email} 
                                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                                        icon={Mail} 
                                                        type="email"
                                                    />
                                                </div>
                                                
                                                <div className="pt-6 flex justify-end border-t border-zinc-800 mt-6">
                                                    <button 
                                                        disabled={loading} 
                                                        className="w-full md:w-auto bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium disabled:opacity-50"
                                                    >
                                                        {loading ? 'Saving...' : <>Save Changes <Check size={18}/></>}
                                                    </button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}

                                    {/* 2. SECURITY TAB */}
                                    {activeTab === 'security' && (
                                        <motion.div 
                                            key="security"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="max-w-2xl mx-auto space-y-8 pb-10"
                                        >
                                            <Header title="Login & Security" sub="Manage your password and account protection settings." />

                                            <form onSubmit={handleChangePassword} className="space-y-6">
                                                <div className="p-5 md:p-6 bg-[#0c0c0e] border border-zinc-800 rounded-xl space-y-6">
                                                    <div className="flex items-center gap-2 text-orange-500 text-sm font-medium mb-2">
                                                        <Key size={16} /> Password Update
                                                    </div>
                                                    
                                                    <InputGroup 
                                                        label="Current Password" 
                                                        value={securityData.currentPassword} 
                                                        onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})}
                                                        type="password"
                                                        placeholder="••••••••"
                                                    />
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                                                        <InputGroup 
                                                            label="New Password" 
                                                            value={securityData.newPassword} 
                                                            onChange={e => setSecurityData({...securityData, newPassword: e.target.value})}
                                                            type="password"
                                                            placeholder="••••••••"
                                                        />
                                                        <InputGroup 
                                                            label="Confirm Password" 
                                                            value={securityData.confirmPassword} 
                                                            onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})}
                                                            type="password"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-2 flex flex-col-reverse md:flex-row items-center justify-end gap-4 md:gap-6">
                                                    <button type="button" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors">
                                                        Forgot Password?
                                                    </button>
                                                    <button disabled={loading} className="w-full md:w-auto bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center justify-center transition-colors font-medium disabled:opacity-50">
                                                        {loading ? 'Updating...' : 'Update Password'}
                                                    </button>
                                                </div>
                                            </form>

                                            {/* Two Factor Teaser */}
                                            <div className="mt-8 p-5 md:p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-700">
                                                        <Smartphone size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-medium text-white">Two-Factor Auth</h4>
                                                        <p className="text-sm text-zinc-400">Add an extra layer of security.</p>
                                                    </div>
                                                </div>
                                                <button className="w-full sm:w-auto text-sm bg-zinc-800 text-zinc-500 border border-zinc-700 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
                                                    Coming Soon
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Toast Notification Area */}
                            <AnimatePresence>
                                {notification && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        exit={{ opacity: 0, y: 10 }}
                                        className={`absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg flex items-center gap-3 border shadow-xl w-max max-w-[90vw] ${
                                            notification.type === 'success' 
                                                ? 'bg-zinc-900 border-green-500/50 text-green-400' 
                                                : 'bg-zinc-900 border-red-500/50 text-red-400'
                                        }`}
                                    >
                                        {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                                        <span className="text-sm font-medium">{notification.text}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// --- SUB-COMPONENTS ---

function SidebarTab({ active, onClick, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 p-2.5 md:p-3 rounded-lg transition-colors min-w-[140px] md:min-w-0 ${
                active 
                ? 'bg-zinc-800 text-white' 
                : 'bg-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
            }`}
        >
            <Icon size={18} className={active ? "text-orange-500" : ""} />
            <span className="text-sm font-medium">{label}</span>
            {active && <ChevronRight size={16} className="hidden md:block ml-auto text-zinc-500" />}
        </button>
    );
}

function InputGroup({ label, value, onChange, icon: Icon, type = "text", placeholder }) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>
            <div className="relative group">
                {Icon && (
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors" size={18} />
                )}
                <input 
                    type={type} 
                    value={value} 
                    onChange={onChange} 
                    placeholder={placeholder}
                    className={`w-full bg-[#0c0c0e] border border-zinc-800 rounded-lg py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors ${Icon ? 'pl-10 pr-4' : 'px-4'}`} 
                />
            </div>
        </div>
    );
}

function Header({ title, sub }) {
    return (
        <div className="border-b border-zinc-800 pb-4 mb-2">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1">{title}</h1>
            <p className="text-zinc-400 text-xs md:text-sm">{sub}</p>
        </div>
    );
}