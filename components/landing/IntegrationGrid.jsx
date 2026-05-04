"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// 9 nodes ordered exactly to flow outward from Google at the top
const nodes = [
  // Outer Left
  { name: "Salesforce", icon: "/companylogo/google.webp", left: "20%", top: "60%", delay: 0.8, size: "md" }, // using your placeholder
  // Mid-Lower Left
  { name: "Jira", icon: "/companylogo/jira.png", left: "27.5%", top: "48%", delay: 0.7, size: "sm" },
  // Mid-Upper Left
  { name: "Microsoft 365", icon: "/companylogo/microsoft.webp", left: "35%", top: "36%", delay: 0.5, size: "md" },
  // Inner Left
  { name: "Slack", icon: "/companylogo/slack.png", left: "42.5%", top: "28%", delay: 0.4, size: "sm" },
  
  // Center Top (Hub - The starting point)
  { name: "Google", icon: "/companylogo/google.webp", left: "50%", top: "20%", delay: 0.2, size: "lg" },
  
  // Inner Right
  { name: "Asana", icon: "/companylogo/asana.png", left: "57.5%", top: "28%", delay: 0.4, size: "sm" },
  // Mid-Upper Right
  { name: "Zoho", icon: "/companylogo/zoho.png", left: "65%", top: "36%", delay: 0.5, size: "md" },
  // Mid-Lower Right
  { name: "ClickUp", icon: "/companylogo/clickup.png", left: "72.5%", top: "48%", delay: 0.7, size: "sm" },
  // Outer Right
  { name: "Miro", icon: "/companylogo/miro.png", left: "80%", top: "60%", delay: 0.8, size: "md" },
];

export default function StructuralIntegrations() {
  return (
    <section className="relative w-full min-h-screen bg-[#030303] flex flex-col items-center justify-center py-24 overflow-hidden font-sans selection:bg-white/20">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.03] blur-[120px] rounded-[100%] pointer-events-none" />

      {/* --- 1. HEADER SECTION --- */}
      <div className="relative text-center z-20 px-6 mb-16 md:mb-24 flex flex-col items-center">
        
        {/* Two-line Heading */}
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-gray-200 mb-6 leading-[1.15]"
        >
          Works With Tools You <br />
          Already Use
        </motion.h2>

        {/* Two-line Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-zinc-500 text-base sm:text-lg md:text-[19px] font-medium leading-relaxed max-w-2xl mx-auto"
        >
          Gaprio connects with your favorite apps, so you don't <br className="hidden sm:block" />
          have to start from scratch or change your flow.
        </motion.p>
      </div>

      {/* --- 2. THE DIAGRAM SECTION --- */}
      {/* Adjusted aspect ratio for mobile so logos have room to breathe */}
      <div className="relative w-full max-w-[1100px] mx-auto aspect-[1.1/1] sm:aspect-[1.5/1] md:aspect-[2.2/1] min-h-[450px] z-10 px-4 sm:px-0">
        
        {/* SVG Paths representing the connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 500" preserveAspectRatio="none">
          <defs>
            <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="80%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
          </defs>

          {/* Left Arc (From Center to Left) */}
          <motion.path 
            d="M 500 100 C 425 100, 425 180, 350 180 C 275 180, 275 300, 200 300" 
            fill="none" 
            stroke="url(#line-grad)" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Right Arc (From Center to Right) */}
          <motion.path 
            d="M 500 100 C 575 100, 575 180, 650 180 C 725 180, 725 300, 800 300" 
            fill="none" 
            stroke="url(#line-grad)" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Bottom Left bracket down to badge */}
          <motion.path 
            d="M 200 300 L 200 420 C 200 450, 230 450, 260 450 L 420 450" 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
          />

          {/* Bottom Right bracket down to badge */}
          <motion.path 
            d="M 800 300 L 800 420 C 800 450, 770 450, 740 450 L 580 450" 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
          />
        </svg>

        {/* The 9 App Icons mapped to exact SVG coordinates */}
        {nodes.map((node, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.4, delay: node.delay + 0.5 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
            style={{ left: node.left, top: node.top }}
          >
            {/* The Glassy Square Panel with responsive Sizes for mobile */}
            <div className={`
              ${node.size === "lg" ? "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-[14px] md:rounded-[24px]" : ""}
              ${node.size === "md" ? "w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-[12px] md:rounded-[20px]" : ""}
              ${node.size === "sm" ? "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-[10px] md:rounded-[16px] opacity-80 hover:opacity-100" : ""}
              bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.8)] 
              flex items-center justify-center relative overflow-hidden transition-all duration-300 
              hover:scale-110 hover:border-white/30 hover:bg-[#1a1a1a] cursor-pointer
            `}>
              {/* Inner highlight simulating premium glass */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <Image 
                src={node.icon} 
                alt={node.name} 
                width={40} 
                height={40} 
                className={`
                  object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110
                  ${node.size === "lg" ? "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" : ""}
                  ${node.size === "md" ? "w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" : ""}
                  ${node.size === "sm" ? "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" : ""}
                `} 
              />
            </div>
            
            {/* Hover Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-zinc-900 border border-white/10 text-white text-[10px] sm:text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
              {node.name}
            </div>
          </motion.div>
        ))}

        {/* Center Text Block */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 }}
          className="absolute left-1/2 top-[66%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center w-full max-w-[250px] md:max-w-[350px] z-10"
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-2 tracking-tight">
            Your tools. <br /> We automate.
          </h3>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 font-medium leading-relaxed">
            Stop wasting time on manual updates. Bridge the gap between your apps and let data flow effortlessly.        
          </p>
        </motion.div>

        {/* Bottom Badge (Clean, No Blur/Shadow) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.5 }}
          className="absolute left-1/2 top-[90%] -translate-x-1/2 -translate-y-1/2 z-30 bg-[#050505] p-2"
        >
          {/* Removed shadow and backdrop-blur, solid color with border */}
          <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#111111] border border-white/10 hover:bg-[#1a1a1a] hover:border-white/20 transition-all cursor-pointer">
            <Image 
              src="/logo1.png" 
              alt="Gaprio Logo" 
              width={20} 
              height={20} 
              className="object-contain w-4 h-4 sm:w-5 sm:h-5" 
            />
            <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
              Gaprio
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}