import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from '@/src/components/Sidebar';
import { Lock, Link as LinkIcon, ExternalLink, ShieldCheck, Loader2, Coins, CheckCircle, Clock, Zap, BarChart3, Plus } from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { Link } from 'react-router-dom';
import { fetchEmployerEscrows } from '@/src/lib/subgraph';
import { PRIVY_HIRE_ADDRESS } from '@/src/lib/contracts';

const SEPOLIA_EXPLORER = 'https://sepolia.arbiscan.io';

export function EmployerEscrowsPage() {
  const { address, isConnected } = useAccount();
  const [jobsData, setJobsData] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  useEffect(() => {
    const loadEscrows = async () => {
      if (!address) return;
      try {
        setIsLoadingJobs(true);
        const data: any = await fetchEmployerEscrows(address);
        setJobsData(data.jobs || []);
      } catch (err) {
        console.error('Error fetching escrows from subgraph:', err);
      } finally {
        setIsLoadingJobs(false);
      }
    };
    loadEscrows();
  }, [address]);

  const { tvl, activeCount, settledCount } = useMemo(() => {
    let tvl = 0, activeCount = 0, settledCount = 0;
    jobsData.forEach(job => {
      const escrow = Number(formatEther(job.escrowAmount));
      if (job.status === 'Posted') {
        tvl += escrow;
        activeCount++;
      } else if (job.status === 'Settled') {
        settledCount++;
      }
    });
    return { tvl, activeCount, settledCount };
  }, [jobsData]);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30">
      <Sidebar userType="employer" />

      <main className="md:ml-72 pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <header className="mb-12 relative">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-10 bg-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary font-barlow">Escrow Vault</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-headline italic text-white mb-3">Active Escrows</h2>
              <p className="text-on-surface-variant text-lg max-w-xl font-light">
                Smart contract funds locked for confirmed hires. Every escrow is trustlessly settled on Arbitrum Sepolia — verified by The Graph.
              </p>
            </div>
            <Link to="/employer"
              className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-bold font-barlow uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg">
              <Plus size={14} /> Post New Role
            </Link>
          </div>
        </header>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* TVL Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="liquid-glass p-8 rounded-2xl border border-primary/20 relative overflow-hidden shadow-[0_0_40px_rgba(197,154,255,0.05)] md:col-span-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-4 right-4 opacity-5"><Coins size={80} /></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-barlow flex items-center gap-2">
              <Lock size={12} className="text-primary" /> Total Value Locked
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-headline italic text-primary">ETH</span>
              <span className="text-5xl font-headline italic tracking-widest text-white">{tvl.toFixed(4)}</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-green-400 font-bold uppercase tracking-widest font-barlow">Live on Arbitrum Sepolia</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-rows-2 gap-4 md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              {/* Active Escrows */}
              <div className="liquid-glass p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  <Clock className="text-primary" size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-barlow">Active</p>
                  <p className="text-3xl font-headline italic text-white">{activeCount}</p>
                </div>
              </div>
              {/* Settled */}
              <div className="liquid-glass p-6 rounded-2xl border border-green-400/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center border border-green-400/20 shrink-0">
                  <CheckCircle className="text-green-400" size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-barlow">Settled</p>
                  <p className="text-3xl font-headline italic text-white">{settledCount}</p>
                </div>
              </div>
            </div>
            {/* Security info */}
            <div className="liquid-glass p-5 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                <ShieldCheck className="text-indigo-400" size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white mb-0.5">Trustless Settlement Guarantee</p>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">Escrow funds are governed by <span className="text-primary font-mono">PrivyHire.sol</span> on Arbitrum Sepolia. No admin key. Funds auto-release.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contract Address */}
        <div className="mb-10 flex items-center gap-3 p-4 bg-black/40 rounded-xl border border-white/5 w-fit">
          <LinkIcon size={14} className="text-primary shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-barlow">Contract:</span>
          <a href={`${SEPOLIA_EXPLORER}/address/${PRIVY_HIRE_ADDRESS}`} target="_blank" rel="noreferrer"
            className="text-xs font-mono text-primary hover:underline flex items-center gap-1">
            {PRIVY_HIRE_ADDRESS.substring(0, 16)}...{PRIVY_HIRE_ADDRESS.substring(36)}
            <ExternalLink size={10} />
          </a>
        </div>

        {/* Escrow List */}
        <div className="space-y-5">
          <h3 className="font-barlow uppercase tracking-widest text-xs text-primary font-bold px-1 flex items-center gap-2">
            <BarChart3 size={14} /> Subgraph Contract Registry
          </h3>

          {!isConnected ? (
            <div className="flex flex-col items-center justify-center p-16 liquid-glass rounded-2xl border border-white/5 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Lock size={28} className="text-primary/50" />
              </div>
              <p className="text-on-surface-variant uppercase tracking-widest text-xs font-bold font-barlow">Connect Wallet to View Escrows</p>
            </div>
          ) : isLoadingJobs ? (
            <div className="flex flex-col justify-center items-center p-16 liquid-glass rounded-2xl border border-white/5 gap-4">
              <Loader2 className="animate-spin text-primary" size={36} />
              <p className="text-on-surface-variant uppercase tracking-widest text-xs font-bold font-barlow">Fetching Analytics from The Graph...</p>
            </div>
          ) : jobsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 liquid-glass rounded-2xl border border-dashed border-white/10 text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                <Coins size={28} className="text-primary/50" />
              </div>
              <div>
                <p className="text-white font-headline italic text-2xl mb-2">No Escrows Yet</p>
                <p className="text-on-surface-variant text-sm">Post a confidential role to initialize your first FHE-secured escrow contract.</p>
              </div>
              <Link to="/employer" className="px-8 py-3 bg-primary text-black font-bold font-barlow uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all">
                Post First Role
              </Link>
            </div>
          ) : (
            jobsData.map((job, idx) => {
              const escrowAmount = formatEther(job.escrowAmount);
              const isActive = job.status === 'Posted';
              const selectedCandidate = job.settlement?.candidate;

              return (
                <motion.div key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className={`liquid-glass p-6 md:p-8 rounded-2xl border transition-all duration-300 group ${isActive ? 'border-white/5 hover:border-primary/20' : 'border-green-400/10 bg-green-400/5'}`}
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                          Job #{job.id}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border font-barlow ${isActive ? 'bg-primary/10 text-primary border-primary/20' : 'bg-green-400/10 text-green-400 border-green-400/20 shadow-[0_0_10px_rgba(74,222,128,0.15)]'}`}>
                          {isActive ? '● Funding Locked' : '✓ Settled'}
                        </span>
                      </div>

                      <h4 className="text-2xl font-headline italic text-white mb-2">Confidential Engineering Role</h4>
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
                          <Lock size={10} className="text-primary/60" />
                          Salary Range: <span className="text-primary">FHE Encrypted</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
                          <Zap size={10} className="text-primary/60" />
                          Skills Requirement: <span className="text-primary">FHE Encoded Bitmask</span>
                        </div>
                        {!isActive && selectedCandidate && (
                          <div className="flex items-center gap-2 text-xs text-green-400 font-mono mt-1">
                            <CheckCircle size={10} />
                            Disbursed to: {selectedCandidate.substring(0, 10)}...{selectedCandidate.substring(32)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 font-barlow">Escrow Amount</p>
                        <div className="flex items-center gap-2 bg-black/40 px-5 py-3 rounded-xl border border-white/5">
                          <Coins size={16} className="text-primary" />
                          <span className="text-white font-mono font-bold text-lg">{escrowAmount} ETH</span>
                        </div>
                      </div>
                      <a
                        href={`${SEPOLIA_EXPLORER}/address/${PRIVY_HIRE_ADDRESS}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-barlow"
                      >
                        View on Arbiscan <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-6 pt-5 border-t border-white/5">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 font-barlow">
                        <span>Escrow Lifecycle</span>
                        <span className="text-primary">Awaiting Candidate Selection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {['Posted', 'Matched', 'Applied', 'Settled'].map((stage, si) => (
                          <React.Fragment key={stage}>
                            <div className={`flex-1 h-1 rounded-full ${si < 1 ? 'bg-primary' : 'bg-white/10'}`} />
                            {si < 3 && (
                              <div className={`w-2 h-2 rounded-full shrink-0 ${si < 1 ? 'bg-primary shadow-[0_0_6px_rgba(197,154,255,0.6)]' : 'bg-white/10'}`} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        {['Posted', 'Matched', 'Applied', 'Settled'].map(stage => (
                          <span key={stage} className="text-[8px] uppercase tracking-widest text-on-surface-variant font-barlow">{stage}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
