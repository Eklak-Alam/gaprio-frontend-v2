'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Loader2, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import DraftReviewCard from './DraftReviewCard';

export default function AiAssistant() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Gaprio AI Systems Online. Ready to execute workflows, draft emails, or create tasks across your connected nodes.' }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        const text = (typeof e === 'string' ? e : input).trim();
        if (!text) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        if (typeof e !== 'string') setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', { message: userMsg.content });
            const data = res.data;

            const aiResponseMsg = {
                role: 'assistant',
                content: data.message || "Execution path calculated.",
                actions: data.plan || [], 
                data: data.data || null  
            };

            setMessages(prev => [...prev, aiResponseMsg]);

        } catch (err) {
            console.error("AI Chat Error:", err);
            let errorMsg = "System Error: Unable to establish connection with AI Neural Core.";

            if (err.response?.status === 404) errorMsg = "Error 404: AI Core unreachable. Verify neural pathways.";
            if (err.response?.status === 503) errorMsg = "Status 503: AI Brain is in sleep mode. Wake up python agent.";

            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (action, messageIndex, actionIndex) => {
        try {
            let actionId = action.id;

            if (!actionId) {
                const pendingRes = await api.get('/ai/actions');
                const pendingActions = pendingRes.data.actions || [];
                if (pendingActions.length > 0) {
                    actionId = pendingActions[0].id;
                }
            }

            if (!actionId) {
                alert("Action ID not found. Payload may have already been dispatched.");
                return;
            }

            await api.post('/ai/approve', { actionId });
            
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[messageIndex].actions = newMessages[messageIndex].actions.filter((_, idx) => idx !== actionIndex);
                return newMessages;
            });

            setMessages(prev => [...prev, { role: 'assistant', content: `✅ Successfully executed: **${action.tool}**` }]);

        } catch (err) {
            console.error(err);
            alert("Execution Failed: " + (err.response?.data?.message || err.message));
        }
    };

    const handleReject = (messageIndex, actionIndex) => {
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[messageIndex].actions = newMessages[messageIndex].actions.filter((_, idx) => idx !== actionIndex);
            return newMessages;
        });

        setInput("Wait, change that. Please update the ");
        
        setTimeout(() => {
            const inputEl = document.querySelector('input[placeholder="Message Gaprio..."]');
            if (inputEl) inputEl.focus();
        }, 100);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] relative overflow-hidden">
            
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            <header className="flex-none px-6 py-4 border-b border-white/5 bg-[#050505] flex justify-between items-center relative z-20">
                <div className="flex items-center gap-3">
                    <img src="/logo1.png" alt="Gaprio" className="w-7 h-7 object-contain" />
                    <h2 className="text-[15px] font-semibold text-zinc-100 tracking-wide">
                        Gaprio Assistant
                    </h2>
                </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative z-10" data-lenis-prevent="true">
                <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8 pb-10">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => {
                            
                            // 🌟 Specialized draft card check
                            const isDraftReview = msg.data && msg.data.type === 'draft_review';

                            // 🔥 THE FIX: Filter out "Ghost" actions that the backend agent already successfully executed!
                            const validActions = msg.actions ? msg.actions.filter(act => {
                                const contentLower = msg.content.toLowerCase();
                                const isAlreadySent = contentLower.includes('successfully') || contentLower.includes('email sent');
                                
                                // If the text says it sent successfully, HIDE the generic send approval card!
                                if (isAlreadySent && act.tool.includes('google_send')) {
                                    return false; 
                                }
                                return true;
                            }) : [];

                            return (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mr-4">
                                            <img src="/logo1.png" alt="AI" className="w-4 h-4 object-contain opacity-80" />
                                        </div>
                                    )}

                                    <div className={`max-w-[90%] sm:max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        
                                        <div className={`px-5 py-3.5 text-[14px] sm:text-[15px] leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-[#1a1a1a] text-zinc-100 border border-white/5 rounded-2xl rounded-tr-sm'
                                                : 'bg-transparent text-zinc-300 pt-1'
                                        }`}>
                                            <div className="whitespace-pre-wrap">
                                                {isDraftReview 
                                                    ? "I have prepared the draft. Please review and approve it below:" 
                                                    : msg.content}
                                            </div>

                                            {/* Specialized Draft Card */}
                                            {isDraftReview && (
                                                <div className="mt-4 w-full">
                                                    <DraftReviewCard
                                                        draft={msg.data}
                                                        onSend={handleSend}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* 🌟 UPGRADED UI: We only map over validActions now! */}
                                        {validActions.length > 0 && !isDraftReview && (
                                            <div className="mt-4 space-y-4 w-full max-w-2xl">
                                                {validActions.map((act, j) => (
                                                    <div key={j} className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-lg">
                                                        
                                                        <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-[#0f0f0f]">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                                                                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Awaiting Approval: {act.tool}</span>
                                                            </div>
                                                            <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                                                                {act.provider || 'system'}
                                                            </span>
                                                        </div>

                                                        <div className="p-4">
                                                            <pre className="text-[12px] text-zinc-400 bg-black/60 p-4 rounded-lg border border-white/5 font-mono custom-scrollbar overflow-x-auto">
                                                                {JSON.stringify(act.parameters, null, 2).replace(/{|}|"/g, '')}
                                                            </pre>

                                                            <div className="flex gap-3 mt-4">
                                                                <button
                                                                    onClick={() => handleReject(i, j)}
                                                                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-200 border border-red-500/20"
                                                                >
                                                                    <X size={16} /> Edit / Cancel
                                                                </button>
                                                                
                                                                <button
                                                                    onClick={() => handleApprove(act, i, j)}
                                                                    className="flex-[2] bg-white hover:bg-zinc-200 text-black py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-200"
                                                                >
                                                                    <Play size={14} fill="currentColor" /> Approve Execution
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {loading && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                            className="flex w-full justify-start items-center"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mr-4">
                                <Loader2 size={14} className="animate-spin text-zinc-400" />
                            </div>
                            <div className="text-[13px] font-mono text-zinc-500 pt-1">
                                Processing request...
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="flex-none p-4 sm:p-6 bg-[#050505] border-t border-white/5 relative z-20">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3">
                    <div className="flex-1 bg-[#0a0a0a] border border-white/10 focus-within:border-white/30 rounded-2xl transition-colors flex items-center pr-2 shadow-sm">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Message Gaprio..."
                            className="w-full bg-transparent text-[14px] sm:text-[15px] text-white outline-none placeholder:text-zinc-600 px-5 py-4 font-medium"
                            autoFocus
                            autoComplete="off"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="p-4 rounded-2xl bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white transition-colors shrink-0 flex items-center justify-center"
                    >
                        <ArrowRight size={18} strokeWidth={2.5} />
                    </button>
                </form>
            </div>
        </div>
    );
}