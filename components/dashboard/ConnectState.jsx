'use client';
import { Plus, Lock } from 'lucide-react';

export default function ConnectState({ icon: Icon, title, onClick }) {
    return (
        // KEY FIX: Changed to h-full flex-1 min-h-0 to prevent layout breaking
        <div className="h-full w-full flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-[#050505] relative overflow-hidden group min-h-0 transition-colors hover:bg-[#080808]">
            
            {/* Ambient Background Glow on Hover */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative mb-5 md:mb-6 cursor-pointer z-10" onClick={onClick}>
                <div className="relative w-14 h-14 md:w-16 md:h-16 bg-[#0a0a0a] border border-white/5 group-hover:border-orange-500/30 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl group-hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] group-hover:-translate-y-1">
                    <Icon className="text-zinc-500 group-hover:text-orange-500 transition-colors duration-300 w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                    
                    {/* Floating Lock Badge */}
                    <div className="absolute -top-2 -right-2 bg-[#050505] p-1.5 rounded-lg border border-white/10 group-hover:border-orange-500/40 transition-colors shadow-lg">
                        <Lock className="text-orange-500 w-3 h-3" />
                    </div>
                </div>
            </div>

            <h2 className="text-lg md:text-xl font-bold text-zinc-100 mb-2 tracking-tight z-10">
                {title}
            </h2>
            <p className="text-zinc-500 mb-6 max-w-xs text-[12px] md:text-[13px] leading-relaxed z-10 group-hover:text-zinc-400 transition-colors">
                Initialize your node to unlock real-time data sync, automation features, and unified control.
            </p>

            <button 
                onClick={onClick} 
                className="group/btn flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-black rounded-xl font-bold text-[13px] hover:opacity-90 transition-all active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.2)] z-10"
            >
                <Plus size={16} className="group-hover/btn:rotate-90 transition-transform duration-300" /> 
                <span>Connect Node</span>
            </button>
            
        </div>
    );
}