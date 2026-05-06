import { User, Building2, Zap, Mail, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

export default function InfoCards({ user, org }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Identity Card */}
            <div className="glass-morphism rounded-2xl p-6 border border-white/10 hover:border-[#FF7F11]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(255,127,17,0.15)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[#FF7F11]/10 flex items-center justify-center border border-[#FF7F11]/20 text-[#FF7F11]">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold tracking-wide">Identity</h3>
                        <p className="text-[11px] text-[#ACBFA4] uppercase tracking-wider">Active Profile</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] text-[#ACBFA4]/60 uppercase tracking-widest mb-1">Full Name</p>
                        <p className="text-[#E2E8CE] font-medium text-sm">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-[#ACBFA4]/60 uppercase tracking-widest mb-1">Email Address</p>
                        <div className="flex items-center gap-2 text-[#E2E8CE] font-medium text-sm">
                            <Mail className="w-3.5 h-3.5 text-[#ACBFA4]" /> {user.email}
                        </div>
                    </div>
                </div>
            </div>

            {/* Workspace Card */}
            <div className="glass-morphism rounded-2xl p-6 border border-white/10 hover:border-[#FF7F11]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(255,127,17,0.15)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/10 text-white">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold tracking-wide">Workspace</h3>
                        <p className="text-[11px] text-[#ACBFA4] uppercase tracking-wider">Assigned Network</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {org ? (
                        <>
                            <div>
                                <p className="text-[10px] text-[#ACBFA4]/60 uppercase tracking-widest mb-1">Org Name</p>
                                <p className="text-[#E2E8CE] font-medium text-sm">{org.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#ACBFA4]/60 uppercase tracking-widest mb-1">Domain</p>
                                <p className="text-[#E2E8CE] font-medium text-sm">{org.domain}</p>
                            </div>
                        </>
                    ) : (
                        <div className="py-4 flex items-center text-[#ACBFA4] text-sm"><Activity className="w-4 h-4 animate-spin mr-2"/> Fetching...</div>
                    )}
                </div>
            </div>

            {/* Actions Card */}
            <div className="glass-morphism rounded-2xl p-6 border border-white/10 hover:border-[#FF7F11]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(255,127,17,0.15)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/10 text-white">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold tracking-wide">Command Center</h3>
                        <p className="text-[11px] text-[#ACBFA4] uppercase tracking-wider">Quick Actions</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors text-sm text-[#E2E8CE]">
                        <span>Edit Profile</span> <ArrowRight className="w-4 h-4 text-[#ACBFA4]" />
                    </button>
                    <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#FF7F11]/10 hover:bg-[#FF7F11]/20 border border-[#FF7F11]/20 transition-colors text-sm text-[#FF7F11] font-semibold">
                        <span>Upgrade to Pro</span> <Zap className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}