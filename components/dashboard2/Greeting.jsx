import { Zap } from 'lucide-react';

export default function Greeting({ user }) {
    return (
        <>
            <div className="inline-flex items-center gap-1.5 text-[#FF7F11] bg-[#FF7F11]/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border border-[#FF7F11]/20">
                <Zap className="w-3 h-3" /> User Authorized
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                Welcome back, {user.firstName}.
            </h1>
            <p className="text-[#ACBFA4] text-sm max-w-xl">
                Your enterprise intelligence hub is ready. Here is a summary of your current session and active profile data.
            </p>
        </>
    );
}