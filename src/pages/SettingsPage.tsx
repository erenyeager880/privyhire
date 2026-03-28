import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from '@/src/components/Sidebar';
import { 
  Shield, LockOpen, UserCheck, Wallet, ShieldCheck, 
  Info, Lock, Fingerprint, RefreshCw, AlertCircle, Settings
} from 'lucide-react';
import { useAccount, useDisconnect, useSwitchChain, useChainId } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { cn } from '@/src/lib/utils';
import { useToast } from '@/src/components/Toast';

export function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const { success: toastSuccess, info: toastInfo } = useToast();

  const [toggles, setToggles] = useState({
    anonymous: true,
    autoReveal: false,
    zkValidation: true,
    emailAccess: false,
    githubHistory: true,
    salaryData: false
  });

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    toastInfo(`Permission Updated`, `${String(key).replace(/([A-Z])/g, ' $1').toLowerCase()} changed.`);
  };

  const handleDisconnect = () => {
    disconnect();
    toastInfo('Wallet Terminated', 'Secure session ended.');
  };

  const truncateAddress = (addr: string) => 
    addr ? `${addr.slice(0, 10)}...${addr.slice(-6)}` : 'UNAUTHORIZED';

  return (
    <main className="md:ml-72 pt-16 pb-20 px-6 min-h-screen relative z-10">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 relative">
             <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="flex items-center gap-3 mb-3">
              <Settings size={14} className="text-primary" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-primary">System Config</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-instrument italic text-white mb-3">Privacy <span className="text-primary text-6xl">Shield</span></h1>
            <p className="text-white/40 text-base font-light leading-relaxed max-w-xl">
              Configure your homomorphic access control list (ACL) and identity masking parameters.
            </p>
          </header>

          <div className="bg-white/[0.02] border border-white/8 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden">
             {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* Identity Shield Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Shield className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Identity Masking</h2>
                </div>
                <p className="text-sm text-white/40 leading-relaxed font-light">
                  Control your visibility in the discovery pool. Stealth mode hides your PII until an FHE-confirmed match occurs.
                </p>
              </div>
              <div className="flex justify-end">
                <button onClick={() => toggle('anonymous')}
                  className={cn("flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all font-mono text-[10px] font-bold tracking-widest",
                    toggles.anonymous ? "bg-primary border-primary text-black shadow-[0_0_20px_rgba(197,154,255,0.3)]" : "bg-white/5 border-white/10 text-white/40")}>
                  {toggles.anonymous ? <ShieldCheck size={14} /> : <Shield size={14} />}
                  {toggles.anonymous ? 'STEALTH_ACTIVE' : 'STEALTH_DISABLED'}
                </button>
              </div>
            </section>

            <div className="h-px w-full bg-white/5 mb-12" />

            {/* Encryption Controls Section */}
            <section className="space-y-8 mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <LockOpen className="text-violet-400" size={20} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">FHE Access Logic</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'autoReveal', label: 'Auto-Reveal on Match', desc: 'Homomorphically decrypt profile data once a high-probability match is confirmed.', icon: LockOpen },
                  { key: 'zkValidation', label: 'ZK-Credential Proofs', desc: 'Verify employment and education history without revealing source credentials.', icon: UserCheck },
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
                      {toggles[item.key as keyof typeof toggles] ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-px w-full bg-white/5 mb-12" />

            {/* Wallet Status & Permissions */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 p-8 rounded-3xl bg-primary/5 border border-primary/20 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all" />
                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(197,154,255,0.2)]">
                    <Fingerprint className="text-primary" size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-primary mb-1">Authenticated Node ID</p>
                    <p className="text-2xl font-mono font-bold text-white tracking-tight">{truncateAddress(address!)}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                       <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">ARBITRUM_SEPOLIA_CONNECTED</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 relative z-10 mt-auto">
                  <button onClick={handleDisconnect} className="flex-1 bg-white/5 hover:bg-red-400/10 border border-white/10 hover:border-red-400/20 text-white/60 hover:text-red-400 py-3 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all">
                    Terminate Session
                  </button>
                  <button onClick={() => switchChain({ chainId: arbitrumSepolia.id })} 
                    className={cn("flex-1 py-3 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                      chainId === arbitrumSepolia.id ? "bg-primary/20 border border-primary/30 text-primary cursor-default" : "bg-white text-black hover:bg-primary border border-transparent")}>
                    {chainId === arbitrumSepolia.id ? <ShieldCheck size={14} /> : <RefreshCw size={14} />}
                    {chainId === arbitrumSepolia.id ? 'NETWORK_SYNCED' : 'RESYNC_NODE'}
                  </button>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/8">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white/30 mb-6 flex items-center gap-2">
                  <ShieldCheck size={14} /> Access Matrix
                </h3>
                <ul className="space-y-5">
                  {[
                    { key: 'emailAccess', label: 'Email PII' },
                    { key: 'githubHistory', label: 'Code History' },
                    { key: 'salaryData', label: 'Salary Primitives' },
                  ].map(perm => (
                    <li key={perm.key} onClick={() => toggle(perm.key as keyof typeof toggles)} 
                      className="flex items-center justify-between group cursor-pointer">
                      <span className={cn("text-xs font-mono transition-colors", toggles[perm.key as keyof typeof toggles] ? "text-white" : "text-white/20")}>
                        {perm.label}
                      </span>
                      {toggles[perm.key as keyof typeof toggles] ? 
                        <LockOpen className="text-primary" size={14} /> : 
                        <Lock className="text-white/10" size={14} />
                      }
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Footer Action */}
            <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
                <Info size={14} className="text-primary" />
                Config state resident on Arbitrum Sepolia.
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl border border-white/10 text-white/40 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                  REVERT_CHANGES
                </button>
                <button onClick={() => toastSuccess('Settings Synchronized', 'FHE ACL updated on-chain')} 
                  className="flex-[2] md:flex-none px-10 py-3.5 rounded-2xl bg-white text-black font-mono text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-primary transition-all active:scale-[0.98]">
                  COMMIT_CONFIG
                </button>
              </div>
            </footer>
          </div>
        </div>
      </main>
  );
}
