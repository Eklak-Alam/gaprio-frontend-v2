'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Network, BrainCircuit, Activity, ShieldAlert } from 'lucide-react';

const problems = [
  {
    id: '01',
    title: 'Data Fragmentation',
    description: 'Information lives across disconnected tools. Each system holds a partial truth, but no system understands the whole picture. Teams act on assumptions because context never fully converges.',
    icon: Network,
  },
  {
    id: '02',
    title: 'Cognitive Decay',
    description: 'Knowledge workers are forced to constantly shift attention between tools, conversations, and priorities. Focus fragments. Understanding degrades. Important details slip through.',
    icon: BrainCircuit,
  },
  {
    id: '03',
    title: 'Manual Overhead',
    description: 'Routine coordination work still depends on human intervention. Tasks are copied, updates are repeated, and follow-ups are manual. High-skill teams spend time doing low-leverage work.',
    icon: Activity,
  },
  {
    id: '04',
    title: 'Security Blindspots',
    description: 'When systems operate independently, visibility breaks down. Permissions drift, dependencies are missed, and actions happen without full context. Risk accumulates quietly.',
    icon: ShieldAlert,
  },
];

export default function LandingPage() {
  const containerRef = useRef(null);
  
  // Track scroll position for the separating parallax effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Outer cards move more, Inner cards move less to create a "separating" slide effect on scroll
  const outerCardY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const innerCardY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <main className="bg-[#050505] min-h-screen text-white overflow-hidden font-sans selection:bg-zinc-700 selection:text-white">
      <section className="relative pt-40 md:pt-36 pb-8 px-4 sm:px-6 flex flex-col items-center justify-center">
        
        {/* -- Background Effects -- */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-500/15 blur-[120px] rounded-[100%] pointer-events-none" />
        <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-dark.svg')] opacity-[0.03] bg-center pointer-events-none [mask-image:linear-gradient(to_bottom,white_40%,transparent)]" />
        
        <div className="relative z-10 w-full max-w-[900px] mx-auto flex flex-col items-center text-center">
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-6 leading-[1.1]"
          >
            The AI Brain <br className="hidden sm:block" />
            for Your Enterprise.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="w-full max-w-3xl mx-auto text-base sm:text-lg md:text-xl lg:text-[22px] text-zinc-400 mb-8 sm:mb-10 leading-[1.6]"
          >
            Gaprio sits above your existing tools, understands conversations, documents, and tasks together, and turns everyday coordination <strong className="text-orange-400 font-medium">into automated outcomes.</strong>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/waitlist"
              className="flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-white text-black text-[15px] sm:text-[16px] font-bold rounded-xl transition-colors duration-200 hover:bg-zinc-200 active:scale-95"
            >
              Request Early Access
            </Link>

            <Link
              href="/demo"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#111] border border-white/10 text-white text-[15px] sm:text-[16px] font-medium rounded-xl transition-all duration-200 hover:bg-[#1a1a1a] hover:border-orange-500/50 active:scale-95"
            >
              See How It Works
              <ArrowRight size={18} className="text-zinc-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. UNIVERSAL RESPONSIVE FANNED CARDS                      */}
      {/* ========================================================= */}
      <section ref={containerRef} className="relative pb-32 pt-16 w-full max-w-[100vw] overflow-hidden">

        {/* Fanned Overlapping Cards (Responsive for ALL screens) */}
        <div className="relative w-full h-[280px] sm:h-[400px] lg:h-[500px] flex justify-center items-center max-w-6xl mx-auto">
          {problems.map((problem, index) => {
            const rotate = [-12, -4, 4, 12][index];
            
            // Using percentages of the card's width/height means it naturally scales on mobile without breaking!
            const x = ["-105%", "-35%", "35%", "105%"][index];
            const y = ["15%", "0%", "0%", "15%"][index];
            
            const scrollParallaxY = (index === 0 || index === 3) ? outerCardY : innerCardY;

            return (
              <motion.div
                key={problem.id}
                initial={{ zIndex: 10 + index }}
                whileHover={{ zIndex: 50 }}
                style={{ y: scrollParallaxY }}
                className="absolute flex justify-center items-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: "50%" }}
                  animate={{ opacity: 1, x, y, rotate }}
                  transition={{ duration: 0.8, delay: index * 0.1, type: "spring", bounce: 0.3 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: "-10%", 
                    rotate: 0, 
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  className="w-[42vw] max-w-[170px] min-h-[220px] sm:w-[220px] sm:max-w-none sm:min-h-[300px] lg:w-[320px] lg:min-h-[400px] bg-gradient-to-b from-[#1c1c1c] to-[#0a0a0a] rounded-[16px] sm:rounded-[24px] lg:rounded-[32px] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center border border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_20px_40px_-15px_rgba(0,0,0,0.8)] cursor-pointer"
                >
                  <div className="mb-3 sm:mb-5 lg:mb-8 text-orange-500 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12">
                    <problem.icon className="w-full h-full" strokeWidth={1.5} />
                  </div>
                  
                  <h3 className="text-[13px] sm:text-lg lg:text-[26px] font-bold text-white tracking-tight mb-2 lg:mb-4 leading-[1.1]">
                    {problem.title}
                  </h3>
                  
                  <p className="text-[10px] sm:text-xs lg:text-[15px] text-zinc-400 leading-[1.4] lg:leading-[1.6]">
                    {problem.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

      </section>
    </main>
  );
}