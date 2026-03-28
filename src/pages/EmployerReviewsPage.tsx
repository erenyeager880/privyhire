import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '@/src/components/Sidebar';
import { 
  Star, UserCheck, Shield, Loader2, CheckCircle, 
  MessageSquare, TrendingUp, Award, Clock, ArrowRight,
  Plus, AlertCircle
} from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useWalletClient } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { connectCofhe } from '@/src/lib/fhe';
import { Encryptable } from '@cofhe/sdk';
import { REPUTATION_VAULT_ADDRESS, REPUTATION_VAULT_ABI } from '@/src/lib/contracts';
import { fetchEmployerJobs } from '../lib/subgraph';
import { useToast } from '@/src/components/Toast';
import { cn } from '@/src/lib/utils';
import { formatEther } from 'viem';

export function EmployerReviewsPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: arbitrumSepolia.id });
  const { data: walletClient } = useWalletClient({ chainId: arbitrumSepolia.id });
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { success: toastSuccess, error: toastError } = useToast();

  const [settledHires, setSettledHires] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{ candidate: string; jobId: number } | null>(null);
  const [ratingValue, setRatingValue] = useState('10');
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    if (!address) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const data: any = await fetchEmployerJobs(address);
        // Filter only settled jobs
        const settled = data.jobs
          .filter((j: any) => j.status === 'Settled' && j.settlement)
          .map((j: any) => ({
            jobId: Number(j.id.split('-')[1]),
            candidate: j.settlement.candidate,
            settledAt: j.settlement.settledAt,
            escrowAmount: j.settlement.escrowAmount
          }));
        setSettledHires(settled);
      } catch (err) {
        console.error("Error loading settled hires:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [address]);

  useEffect(() => {
    if (isSuccess) {
      toastSuccess('Rating submitted!', 'Encrypted reputation updated on-chain');
      setRatingTarget(null);
    }
  }, [isSuccess]);

  const handleRateCandidate = async () => {
    if (!ratingTarget || !address) return;
    try {
      setIsRating(true);
      const client = await connectCofhe();
      const encryptedInputs = await client.encryptInputs([
        Encryptable.uint32(BigInt(ratingValue))
      ]).execute();

      writeContract({
        address: REPUTATION_VAULT_ADDRESS,
        abi: REPUTATION_VAULT_ABI,
        functionName: 'submitRating',
        args: [
          ratingTarget.candidate as `0x${string}`, 
          BigInt(ratingTarget.jobId), 
          encryptedInputs[0] as any
        ],
        account: address,
        chain: arbitrumSepolia
      });
    } catch (err: any) {
      toastError('Rating failed', err.shortMessage || err.message);
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30">
      <Sidebar userType="employer" />

      <main className="md:ml-72 pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <header className="mb-12 relative">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-10 bg-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary font-barlow">Reputation Portal</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-headline italic text-white mb-3 flex items-center gap-4">
                Assign <span className="text-primary focus-glow">Reputation</span>
                <Star className="text-primary" size={32} />
              </h2>
              <p className="text-on-surface-variant text-lg max-w-xl font-light">
                Contribute to the decentralized trust network. Assign encrypted performance scores to your settled hires on Arbitrum Sepolia.
              </p>
            </div>
          </div>
        </header>

        {!isConnected ? (
          <div className="p-16 liquid-glass rounded-3xl border border-white/5 text-center">
            <Shield className="mx-auto text-primary/20 mb-4" size={48} />
            <h3 className="text-xl font-headline italic text-white mb-2">Connect Wallet</h3>
            <p className="text-on-surface-variant text-sm font-mono uppercase tracking-widest">Authorized Access Only</p>
          </div>
        ) : loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-on-surface-variant text-sm font-mono uppercase tracking-widest">Reading Settlement History...</p>
          </div>
        ) : settledHires.length === 0 ? (
          <div className="p-16 liquid-glass rounded-3xl border border-dashed border-white/10 text-center">
             <Clock className="mx-auto text-white/5 mb-4" size={48} />
             <h3 className="text-2xl font-headline italic text-white mb-2">No Hires Yet</h3>
             <p className="text-on-surface-variant text-sm mb-8">You can only rate candidates after a job has been settled and the escrow released.</p>
             <button onClick={() => window.location.href='/employer'} className="px-8 py-3 bg-primary text-black font-bold font-barlow uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all shadow-lg">
                Go to Pipeline
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settledHires.map((hire, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="liquid-glass p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <Award size={120} />
                </div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                      <UserCheck className="text-primary" size={20} />
                    </div>
                    <div>
                      <h4 className="text-xl font-headline italic text-white">Hire #{hire.jobId}</h4>
                      <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        Settled {new Date(Number(hire.settledAt) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                    <CheckCircle size={12} className="text-emerald-400" />
                    <span className="text-emerald-400 font-bold font-barlow text-[10px] uppercase tracking-widest">Settled</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 font-barlow flex items-center gap-2">
                       <Clock size={12} /> Payroll Transferred
                    </div>
                    <div className="text-white font-mono text-sm font-bold">{formatEther(BigInt(hire.escrowAmount))} ETH</div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 font-barlow flex items-center gap-2">
                       <Shield size={12} /> Candidate ID
                    </div>
                    <div className="text-primary font-mono text-xs font-bold">{hire.candidate.slice(0, 8)}...{hire.candidate.slice(-6)}</div>
                  </div>
                </div>

                <button 
                  onClick={() => setRatingTarget(hire)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-black font-bold font-barlow uppercase tracking-widest text-xs rounded-2xl hover:shadow-[0_0_20px_rgba(197,154,255,0.3)] transition-all transform active:scale-[0.98]"
                >
                  <Star size={14} /> Assign Reputation Score <Plus size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Analytics Section */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="liquid-glass p-6 rounded-2xl border border-white/5 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                 <Award className="text-orange-500" size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 font-barlow">Ecosystem Contribution</p>
                 <p className="text-2xl font-headline italic text-white">{settledHires.length} Feedback Points</p>
              </div>
           </div>
           <div className="liquid-glass p-6 rounded-2xl border border-white/5 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                 <Shield className="text-indigo-500" size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 font-barlow">Encryption Layer</p>
                 <p className="text-2xl font-headline italic text-white flex items-center gap-2">Fhenix CoFHE <CheckCircle size={16} className="text-emerald-400" /></p>
              </div>
           </div>
           <div className="liquid-glass p-6 rounded-2xl border border-white/5 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                 <TrendingUp className="text-primary" size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 font-barlow">Network Growth</p>
                 <p className="text-2xl font-headline italic text-white">4.2k Daily Ratings</p>
              </div>
           </div>
        </section>

        {/* Rating Modal */}
        <AnimatePresence>
          {ratingTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRatingTarget(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-[#0A0A0B] border border-white/10 p-10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden shadow-[0_0_100px_rgba(197,154,255,0.1)]"
              >
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><Star size={200} /></div>
                
                <h3 className="text-3xl font-headline italic text-white mb-2">Submit Rating</h3>
                <p className="text-sm text-white/40 mb-8 font-light">
                   Assign a confidential performance score to <span className="text-primary font-mono">{ratingTarget.candidate.slice(0, 10)}...</span>
                </p>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary font-barlow">Performance Metric (1–10)</label>
                    <span className="text-4xl font-headline italic text-white">{ratingValue}</span>
                  </div>
                  
                  <input 
                    type="range" min="1" max="10" step="1" 
                    value={ratingValue} 
                    onChange={(e) => setRatingValue(e.target.value)} 
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  
                  <div className="flex justify-between text-[10px] font-mono text-white/20 uppercase tracking-widest">
                    <span>Unsatisfactory</span>
                    <span>Exemplary</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 mb-10 flex items-start gap-4">
                   <Shield className="text-primary shrink-0 mt-0.5" size={18} />
                   <p className="text-[10px] text-primary/80 leading-relaxed font-mono uppercase tracking-widest">
                     Security Notice: Your rating is homomorphically encrypted. Not even the protocol admin can see the raw score you assign.
                   </p>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setRatingTarget(null)} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors font-barlow">Cancel</button>
                  <button 
                    onClick={handleRateCandidate} 
                    disabled={isRating || isPending || isWaiting}
                    className="flex-[2] py-4 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                  >
                    {isRating || isPending || isWaiting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                    Submit Encrypted
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
