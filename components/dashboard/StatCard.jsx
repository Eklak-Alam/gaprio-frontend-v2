'use client';
import { ArrowUpRight } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, trend, sub }) {
    return (
        // KEY FIX: Added h-full and optimized padding for dashboard grids
        <div className="relative h-full p-4 sm:p-5 bg-[#050505] border border-white/5 rounded-2xl flex flex-col group overflow-hidden shadow-md transition-all duration-300 hover:bg-[#0a0a0a] hover:border-white/10 hover:-translate-y-0.5">
            
            {/* Subtle Top Hover Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] transition-opacity duration-500 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>

            <div className="flex items-start justify-between mb-4 z-10">
                <div className="p-2 sm:p-2.5 rounded-lg border border-white/5 bg-[#000] text-zinc-500 group-hover:text-orange-500 transition-colors shadow-inner">
                    <Icon size={16} strokeWidth={1.5} />
                </div>
                
                {trend && (
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold text-zinc-500 group-hover:text-orange-500 transition-colors bg-white/[0.02] px-2 py-1 rounded-md border border-white/5 group-hover:border-orange-500/20 group-hover:bg-orange-500/10">
                        <ArrowUpRight size={12} strokeWidth={2.5} /> 
                        {trend}
                    </div>
                )}
            </div>
            
            <div className="mt-auto z-10">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 group-hover:text-zinc-400 transition-colors">
                    {label}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight group-hover:text-white transition-colors">
                    {value}
                </p>
                {sub && (
                    <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 font-medium group-hover:text-zinc-400 transition-colors">
                        {sub}
                    </p>
                )}
            </div>
            
        </div>
    );
}