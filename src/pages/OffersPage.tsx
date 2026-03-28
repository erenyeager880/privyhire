import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from '@/src/components/Sidebar';
import { Lock, Shield, Coins, Loader2, Link as LinkIcon, CheckCircle, Clock, ExternalLink, Briefcase, ArrowRight, Zap } from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { fetchCandidateOffers } from '@/src/lib/subgraph';

interface Offer {
  jobId: string;
  employer: `0x${string}`;
  role: string;
  status: 'applied' | 'settled';
  escrow: string;
}

const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io';

export function OffersPage() {
  const { address, isConnected } = useAccount();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOffers = async () => {
      if (!address) return;
      try {
        setLoading(true);
        const data: any = await fetchCandidateOffers(address);
        
        const jobOffers: Offer[] = data.applications.map((app: any) => {
          const isSettled = app.job.status === 'Settled';
          // Find if this specific application's candidate matches the settlement candidate
          // In a real scenario we'd query the job's settlement.candidate, but simplified here based on job status
          return {
            jobId: app.job.id,
            employer: app.job.employer,
            role: 'Confidential Engineering Role',
            status: isSettled ? 'settled' : 'applied',
            escrow: isSettled && app.job.settlement ? formatEther(app.job.settlement.escrowAmount) : '—',
          };
        });

        setOffers(jobOffers);
      } catch (err) {
        console.error('Error fetching offers from subgraph:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [address]);

  const totalEarned = useMemo(() =>
    offers.filter(o => o.status === 'settled').reduce((acc, o) => acc + parseFloat(o.escrow || '0'), 0),
    [offers]
  );
  const settledCount = offers.filter(o => o.status === 'settled').length;

  return (
    <main className="md:ml-72 p-8 lg:p-12 max-w-7xl relative z-10 min-h-screen bg-black text-white font-body selection:bg-primary/30">
        <header className="mb-12 relative">
          <div className="absolute -top-16 -left-16 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Scanline effect */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-50">
            <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          </div>

          <div className="flex items-center gap-4 mb-3 relative z-10">
            <div className="h-px w-8 bg-primary/50" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-primary">Application Terminal</span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-instrument italic text-white leading-tight mb-4 relative z-10">
            Graph <span className="text-primary">Registry</span>
          </h2>
          <p className="text-white/40 max-w-2xl text-lg font-light leading-relaxed relative z-10">
            Live indexing of your confidential interactions via <span className="text-primary/80 font-mono text-sm underline decoration-primary/30 underline-offset-4">THE_GRAPH_PROTOCOL</span>.
          </p>
        </header>

        {/* Stats Strip */}
        {isConnected && !loading && offers.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="liquid-glass p-6 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Briefcase size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-barlow">Total Applied</p>
                <p className="text-2xl font-headline italic text-white">{offers.length}</p>
              </div>
            </div>
            <div className="liquid-glass p-6 rounded-2xl border border-green-400/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center border border-green-400/20">
                <CheckCircle size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-barlow">Settled</p>
                <p className="text-2xl font-headline italic text-white">{settledCount}</p>
              </div>
            </div>
            <div className="liquid-glass p-6 rounded-2xl border border-primary/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Coins size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-barlow">Earned</p>
                <p className="text-2xl font-headline italic text-white">{totalEarned.toFixed(4)} <span className="text-sm text-primary">ETH</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center p-16 liquid-glass rounded-3xl border border-white/5 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Lock size={28} className="text-primary/50" />
            </div>
            <p className="text-on-surface-variant uppercase tracking-widest text-sm font-bold font-barlow">Connect Wallet to View Applications</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="font-barlow uppercase tracking-widest text-xs text-on-surface-variant text-center">
              Querying Subgraph Endpoint...
            </p>
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 liquid-glass rounded-3xl border border-dashed border-white/10 text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
              <Zap size={28} className="text-primary/50" />
            </div>
            <div>
              <p className="text-white font-headline italic text-2xl mb-2">No Applications Found</p>
              <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
                Check the Matches Engine to find roles that align with your encrypted profile.
              </p>
            </div>
            <Link to="/matches" className="flex items-center gap-2 px-8 py-3 bg-primary text-black font-bold font-barlow uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all">
              Find Matches <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {offers.map((offer, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={cn(
                  'liquid-glass p-7 rounded-2xl border transition-all duration-300 group',
                  offer.status === 'settled'
                    ? 'border-green-400/15 bg-green-400/3 hover:border-green-400/25'
                    : 'border-white/5 hover:border-primary/20'
                )}
              >
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0',
                      offer.status === 'settled'
                        ? 'bg-green-400/10 border-green-400/20'
                        : 'bg-primary/10 border-primary/20'
                    )}>
                      {offer.status === 'settled'
                        ? <CheckCircle className="text-green-400" size={24} />
                        : <Clock className="text-primary" size={24} />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-headline italic text-white">{offer.role}</h3>
                        <span className={cn(
                          'text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border font-barlow',
                          offer.status === 'settled'
                            ? 'bg-green-400/10 text-green-400 border-green-400/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                        )}>
                          {offer.status === 'settled' ? '✓ Settled' : '● Pending Review'}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-mono flex items-center gap-1.5">
                        <LinkIcon size={10} className="text-primary/50" />
                        Employer: {offer.employer.substring(0, 10)}...{offer.employer.substring(32)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full md:w-auto">
                    <div className="w-full md:w-48">
                      <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest text-on-surface-variant mb-1.5 font-barlow">
                        <span>Application Progress</span>
                        <span>{offer.status === 'settled' ? '100%' : '50%'}</span>
                      </div>
                      <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: offer.status === 'settled' ? '100%' : '50%' }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                          className={cn('h-full rounded-full', offer.status === 'settled' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-primary')}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2.5 bg-black/40 rounded-xl border border-white/5">
                      <Coins size={14} className={offer.status === 'settled' ? 'text-green-400' : 'text-primary'} />
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-barlow font-bold">Escrow</p>
                        <p className="text-sm font-mono text-white font-bold">{offer.escrow} {offer.escrow !== '—' ? 'ETH' : ''}</p>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {offer.status === 'settled' ? (
                      <div className="px-4 py-2.5 bg-green-400/10 border border-green-400/25 text-green-400 rounded-xl text-[9px] font-bold uppercase tracking-widest font-barlow text-center">
                        Escrow Released
                      </div>
                    ) : (
                      <div className="px-4 py-2.5 bg-white/5 border border-white/10 text-on-surface-variant rounded-xl text-[9px] font-bold uppercase tracking-widest font-barlow cursor-not-allowed text-center">
                        Awaiting Selection
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
  );
}
