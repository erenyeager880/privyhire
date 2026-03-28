import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Zap, FileText, Coins, BarChart3, ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const BentoCard = ({ 
  children, 
  className, 
  title, 
  description, 
  icon: Icon,
  trend 
}: { 
  children?: React.ReactNode; 
  className?: string; 
  title: string; 
  description: string;
  icon: any;
  trend?: string;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className={cn(
      "group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-xl p-6 md:p-10 transition-all hover:border-primary/40 shadow-2xl flex flex-col",
      className
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(197,154,255,0.1)]">
          <Icon className="text-primary" size={24} />
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-primary px-3 py-1 bg-primary/10 border border-primary/20 rounded-full uppercase tracking-widest font-barlow animate-pulse">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-instrument italic text-white mb-2">{title}</h3>
      <p className="text-on-surface-variant text-sm font-light leading-relaxed max-w-[280px]">{description}</p>
    </div>

    <div className="relative z-10 flex-1 flex flex-col justify-between">
      {children}
    </div>
  </motion.div>
);

const OrbitalMatch = () => (
  <div className="relative w-full h-32 md:h-40 flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute w-40 h-40 border border-primary/30 rounded-full border-dashed"
    />
    <motion.div 
      animate={{ rotate: -360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute w-28 h-28 border border-primary/20 rounded-full"
    />
    <div className="relative">
      <div className="w-16 h-16 rounded-3xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_40px_rgba(197,154,255,0.3)]">
        <Shield className="text-primary" size={32} />
      </div>
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -inset-4 bg-primary/10 blur-xl rounded-full -z-10"
      />
    </div>
    
    {/* Orbital Nodes */}
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      className="absolute w-40 h-40"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(197,154,255,0.8)]" />
    </motion.div>
    <motion.div 
      animate={{ rotate: -360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="absolute w-28 h-28"
    >
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
    </motion.div>
  </div>
);

const ScanningBeam = () => (
  <div className="relative w-full h-32 bg-black/40 rounded-3xl border border-white/5 overflow-hidden p-6">
    <div className="space-y-3">
      {[70, 90, 60, 80].map((w, i) => (
        <div key={i} className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-white/10" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
    <motion.div 
      animate={{ y: ["-100%", "300%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_rgba(197,154,255,0.8)]"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
  </div>
);

const FloatingCube = () => (
  <div className="h-32 md:h-40 flex items-center justify-center py-2">
    <motion.div 
      animate={{ 
        y: [0, -10, 0],
        rotateX: [0, 10, 0],
        rotateY: [0, 20, 0]
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="w-24 h-24 bg-gradient-to-br from-primary/40 to-indigo-500/20 rounded-2xl border border-white/20 relative shadow-[0_0_50px_rgba(197,154,255,0.2)]"
    >
      <div className="absolute inset-2 border border-white/10 rounded-lg flex items-center justify-center">
        <div className="grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, i) => (
            <motion.div 
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ delay: i * 0.1, duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          ))}
        </div>
      </div>
    </motion.div>
  </div>
);

export const BentoGrid = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-32">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[350px] md:auto-rows-[400px]">
        <BentoCard 
          className="md:col-span-2"
          title="FHE Extraction Engine"
          description="Google Gemini-powered parsing detects skills and experience, wrapping them into production-ready ciphertexts on the fly."
          icon={FileText}
          trend="Gemini AI"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-center mt-6">
            <div className="w-full sm:w-1/2">
              <ScanningBeam />
            </div>
            <div className="hidden sm:block space-y-2 flex-1">
              <p className="text-[9px] font-mono text-primary/60">NODE_ID: P7482</p>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[9px] font-mono text-on-surface-variant leading-tight">
                STATUS: ENCRYPTING...<br/>
                PAYLOAD: 0x1A4B...<br/>
                LATENCY: 1.2ms
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Match Engine */}
        <BentoCard 
          title="On-Chain Matcher"
          description="Arithmetic overlap evaluation performed natively in the Fhenix CoFHE environment."
          icon={Zap}
        >
          <OrbitalMatch />
        </BentoCard>

        {/* Card 3: Privacy */}
        <BentoCard 
          title="Selective Reveal"
          description="Decryption is only possible after mutual cryptographic confirmation."
          icon={Lock}
          trend="Native FHE"
        >
          <div className="mt-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Shield className="text-indigo-400" size={18} />
            </div>
            <div className="flex-1">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-indigo-400"
                />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mt-2">Privacy Shield Active</p>
            </div>
          </div>
        </BentoCard>

        {/* Card 4: Settlement */}
        <BentoCard 
          className="md:col-span-2"
          title="Trustless Settlement Loop"
          description="Escrow funding is locked in the smart contract and atomically released upon match selection — no human interference possible."
          icon={Coins}
        >
          <div className="flex flex-col md:flex-row items-center gap-8 px-4 pb-4">
             <FloatingCube />
             <div className="flex-1 space-y-4 w-full">
               <div className="flex justify-between items-end">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-barlow">Vault Initialization</p>
                 <p className="text-emerald-400 font-mono text-xs">0.5 ETH LOCKED</p>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                  />
               </div>
               <p className="text-[10px] text-on-surface-variant leading-relaxed opacity-60">The `PrivyHire.sol` contract acts as a neutral third-party arbitrator, enforcing payout conditions via FHE-derived match results.</p>
             </div>
          </div>
        </BentoCard>

        {/* Card 5: Analytics */}
        <BentoCard 
          title="Network Pulse"
          description="Subgraph-indexed visibility into live job matches and candidate activity."
          icon={BarChart3}
        >
          <div className="h-32 flex items-end gap-1 px-2 pb-6 self-center w-full max-w-[200px]">
            {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-colors border-t border-primary/40"
              />
            ))}
          </div>
        </BentoCard>
      </div>
    </section>
  );
};
