import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from '@/src/components/Sidebar';
import { 
  Shield, Wallet, Info, Key, Fingerprint, 
  Settings, Briefcase, RefreshCw, CheckCircle, Database, Lock
} from 'lucide-react';
import { useAccount, useDisconnect, useSwitchChain, useChainId } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { cn } from '@/src/lib/utils';
import { useToast } from '@/src/components/Toast';

export function EmployerSettingsPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const { success: toastSuccess, info: toastInfo } = useToast();

  const [toggles, setToggles] = useState({
    stealthMode: true,
    dataRetention: false,
    autoEscrow: true,
    publicRatings: true
  });

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    toastInfo(`Corporate Policy Updated`, `${String(key).replace(/([A-Z])/g, ' $1').toLowerCase()} changed.`);
  };

  const truncateAddress = (addr: string) => 
    addr ? `${addr.slice(0, 10)}...${addr.slice(-6)}` : 'UNKNOWN_ENTITY';

  return (
    <main className="md:ml-72 pt-16 pb-20 px-6 min-h-screen relative z-10">
      <div className="max-w-4xl mx-auto">
          <header className="mb-12 relative">
             <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="flex items-center gap-3 mb-3">
              <Settings size={14} className="text-primary" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-primary">Enterprise Command</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-headline italic text-white mb-3">Company <span className="text-primary text-6xl">Config</span></h1>
            <p className="text-white/40 text-base font-light leading-relaxed max-w-xl">
              Configure corporate stealth parameters, escrow authorization, and GenAI parser integrations.
            </p>
          </header>

          <div className="bg-white/[0.02] border border-white/8 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden">
             {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* Escrow Source Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Wallet className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Escrow Source</h2>
                </div>
                <p className="text-sm text-white/40 leading-relaxed font-light">
                  The primary funding node authorized to collateralize job escrows on-chain.
                </p>
              </div>
              <div className="bg-black/30 p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
                <div className="flex justify-between items-center mb-1">
                   <p className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-widest">Active Wallet Node</p>
                   <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-400/10 border border-emerald-400/20 rounded">SYNCED</span>
                </div>
                <p className="text-sm font-mono font-bold text-primary truncate">{truncateAddress(address!)}</p>
                <button className="w-full mt-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[9px] font-mono font-bold uppercase tracking-widest transition-all">
                  AUTHORIZE_NEW_SOURCE
                </button>
              </div>
            </section>

            <div className="h-px w-full bg-white/5 mb-12" />

            {/* Corporate Stealth Section */}
            <section className="space-y-8 mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Shield className="text-violet-400" size={20} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Corporate Stealth</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'stealthMode', label: 'Company Name Masking', desc: 'Maintain anonymity until a cryptographic match is confirmed by the protocol.', icon: Lock },
                  { key: 'dataRetention', label: 'Data Retention Policy', desc: 'Auto-purge candidate datasets if matching probability falls below threshold.', icon: Database },
                ].map(item => (
                  <div key={item.key} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="max-w-[80%]">
                        <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider mb-1">{item.label}</h3>
                        <p className="text-xs text-white/30 leading-relaxed font-light">{item.desc}</p>
                      </div>
                      <item.icon className="text-white/20 group-hover:text-primary transition-colors" size={18} />
                    </div>
                    <button onClick={() => toggle(item.key as keyof typeof toggles)}
                      className={cn("w-full py-2.5 rounded-xl border font-mono text-[9px] font-bold tracking-widest transition-all",
                        toggles[item.key as keyof typeof toggles] ? "bg-primary/20 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-white/30")}>
                      {toggles[item.key as keyof typeof toggles] ? 'POLICY_ACTIVE' : 'POLICY_DISABLED'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-px w-full bg-white/5 mb-12" />

            {/* API Integrations */}
            <section className="p-8 rounded-3xl bg-primary/5 border border-primary/20 relative overflow-hidden group">
               <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all" />
               <div className="flex flex-col md:flex-row gap-8 relative z-10">
                 <div className="flex-1">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Key className="text-primary" size={24} /> GenAI Parser Integration
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed font-light mb-6">
                      Authorize our homomorphic resume parser to interface with your existing ATS or inbound pipeline.
                    </p>
                    <div className="flex flex-col gap-2">
                      <p className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-[0.3em]">API KEY_PROD</p>
                      <div className="flex items-center gap-3">
                        <code className="bg-black/40 border border-white/8 px-4 py-3 rounded-xl text-primary font-mono text-xs flex-1">ph_live_••••••••••••••••••••</code>
                        <button className="px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white/40 font-mono text-[10px] font-bold uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all">
                          REGEN
                        </button>
                      </div>
                    </div>
                 </div>
                 <div className="w-full md:w-64 space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/8">
                       <p className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                         <Fingerprint size={12} /> Parser Identity
                       </p>
                       <p className="text-xs font-mono text-white/80 truncate mb-1">0x8B7...F9a1</p>
                       <span className="text-[8px] font-mono text-primary font-bold tracking-widest">AUTHORIZED</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/8">
                       <p className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                         <Briefcase size={12} /> Active Jobs
                       </p>
                       <p className="text-lg font-mono font-bold text-white">4</p>
                       <span className="text-[8px] font-mono text-neutral-500 font-bold tracking-widest uppercase">Escrow Locked</span>
                    </div>
                 </div>
               </div>
            </section>

            {/* Footer Action */}
            <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
                <Info size={14} className="text-primary" />
                Enterprise configs require cryptographic signature.
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl border border-white/10 text-white/40 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                  DISCARD_CHANGES
                </button>
                <button onClick={() => toastSuccess('Policy Synchronized', 'Corporate shield parameters updated.')} 
                  className="flex-[2] md:flex-none px-10 py-3.5 rounded-2xl bg-white text-black font-mono text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-primary transition-all active:scale-[0.98]">
                  SIGN_&_SAVE
                </button>
              </div>
            </footer>
          </div>
        </div>
      </main>
  );
}
