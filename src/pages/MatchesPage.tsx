import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from '@/src/components/Sidebar';
import { Search, Filter, Briefcase, MapPin, Coins, UserCheck, ChevronRight, Lock, Loader2, Link as LinkIcon } from 'lucide-react';
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt, useWalletClient, useChainId, useSwitchChain } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { PRIVY_HIRE_ADDRESS, PRIVY_HIRE_ABI } from '@/src/lib/contracts';
import { connectCofhe } from '@/src/lib/fhe';
import { FheTypes } from '@cofhe/sdk';
import { cn } from '@/src/lib/utils';
import { fetchAllOpenJobs } from '../lib/subgraph';
import { formatEther } from 'viem';

interface Match {
  id: string; // employer:jobId
  employer: `0x${string}`;
  jobId: number;
  role: string;
  company: string;
  matchStatus: 'unknown' | 'matched' | 'nomatch';
  escrow: string;
  status: 'pending' | 'revealed' | 'declined';
}

export function MatchesPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [jobs, setJobs] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingInProgress, setMatchingInProgress] = useState<Record<string, boolean>>({});

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isApplying } = useWaitForTransactionReceipt({ hash });
  const { isConnecting } = useAccount();
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Open Jobs from Subgraph
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data: any = await fetchAllOpenJobs();
        
        const jobList: Match[] = data.jobs.map((job: any) => {
          // Parse the jobId from the subgraph ID (usually employer-jobId)
          const parts = job.id.split('-');
          const jobIdNum = parts.length > 1 ? Number(parts[1]) : 0;
          
          return {
            id: job.id,
            employer: job.employer as `0x${string}`,
            jobId: jobIdNum,
            role: "Confidential Engineering Role",
            company: `${job.employer.substring(0, 6)}...${job.employer.substring(38)}`,
            matchStatus: 'unknown',
            escrow: formatEther(BigInt(job.escrowAmount)),
            status: 'pending'
          };
        });

        setJobs(jobList);
      } catch (err: any) {
        console.error("Error fetching jobs from subgraph:", err);
        setError("Failed to fetch jobs from the indexed protocol. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleCheckMatch = async (matchId: string, force: boolean = false) => {
    console.log("handleCheckMatch triggered for:", matchId, "force:", force);
    if (!address || !publicClient || !walletClient) {
      console.warn("Missing wallet state:", { address: !!address, publicClient: !!publicClient, walletClient: !!walletClient });
      setError("Wallet state not fully initialized. Please wait a moment or reconnect your wallet.");
      return;
    }
    const match = jobs.find(j => j.id === matchId);
    if (!match) {
      console.error("Match not found in state:", matchId);
      return;
    }

    setMatchingInProgress(prev => ({ ...prev, [matchId]: true }));
    setError(null);

    if (chainId !== arbitrumSepolia.id) {
      setError('Wrong network detection. Please switch to Arbitrum Sepolia.');
      switchChain({ chainId: arbitrumSepolia.id });
      setMatchingInProgress(prev => ({ ...prev, [matchId]: false }));
      return;
    }

    try {
      let shouldEvaluate = force;
      
      if (!force) {
        console.log("Step 1: Checking if match is already evaluated on-chain...");
        // Check if evaluation already exists
        const hasResult = await (publicClient as any).readContract({
          address: PRIVY_HIRE_ADDRESS,
          abi: PRIVY_HIRE_ABI,
          functionName: 'hasMatchResult',
          args: [match.employer, BigInt(match.jobId), address]
        }) as boolean;
        shouldEvaluate = !hasResult;
      }

      if (shouldEvaluate) {
        console.log(force ? "Forcing re-evaluation via transaction..." : "Match result NOT found on-chain. Evaluating via transaction...");
        const { request } = await (publicClient as any).simulateContract({
          address: PRIVY_HIRE_ADDRESS,
          abi: PRIVY_HIRE_ABI,
          functionName: 'evaluateMatch',
          args: [BigInt(match.jobId), match.employer],
          account: address
        });
        
        const hash = await walletClient.writeContract(request);
        console.log("Evaluation transaction submitted:", hash);
        await (publicClient as any).waitForTransactionReceipt({ hash });
        console.log("Evaluation completed successfully.");
      } else {
        console.log("Using existing match result from chain.");
      }

      // Step 2: Fetch the stored ebool handle
      const encryptedMatchHandle = await (publicClient as any).readContract({
        address: PRIVY_HIRE_ADDRESS,
        abi: PRIVY_HIRE_ABI,
        functionName: 'getMatchResult',
        args: [match.employer, BigInt(match.jobId), address]
      }) as bigint;
      console.log("Match Handle fetched:", encryptedMatchHandle);

      // Step 3: Decrypt using Fhenix Client
      const client = await connectCofhe();
      
      console.log(`DEBUG: Requesting permit for contract: ${PRIVY_HIRE_ADDRESS}`);
      const permit = await client.permits.getOrCreateSelfPermit();

      // Use decryptForView with the established permit object
      if (encryptedMatchHandle === 0n) {
        console.warn("[FHE DEBUG] Match handle is zero, skipping decryption.");
        setJobs(prev => prev.map(j => 
          j.id === matchId ? { ...j, matchStatus: 'nomatch' } : j
        ));
        return;
      }
      const isMatch = await client.decryptForView(encryptedMatchHandle, FheTypes.Bool)
        .withPermit(permit) 
        .execute();
      
      console.log("Decrypted Match Result:", isMatch);

      setJobs(prev => prev.map(j => 
        j.id === matchId ? { ...j, matchStatus: isMatch ? 'matched' : 'nomatch' } : j
      ));
    } catch (err: any) {
      console.error("[FHE DEBUG] Match evaluation failed:", err);
      if (err.response?.data) {
        console.error("[FHE DEBUG] Node response:", err.response.data);
      }
      setError(err.message || "Match evaluation failed. Please ensure your wallet is connected and active.");
    } finally {
      setMatchingInProgress(prev => ({ ...prev, [matchId]: false }));
    }
  };

  const handleApply = (matchId: string) => {
    const match = jobs.find(j => j.id === matchId);
    if (!match) return;

    writeContract({
      address: PRIVY_HIRE_ADDRESS,
      abi: PRIVY_HIRE_ABI,
      functionName: 'applyForJob',
      args: [BigInt(match.jobId), match.employer],
      account: address,
      chain: arbitrumSepolia,
    });
  };

  return (
    <main className="md:ml-72 p-8 lg:p-12 max-w-7xl relative z-10 min-h-screen">
        <header className="mb-12 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 blur-[120px] pointer-events-none opacity-30" />
          
          {/* Scanline effect */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-50">
            <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px w-8 bg-primary/50" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-primary">Match Engine v2.4</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-instrument italic text-white leading-tight">
                Protocol <span className="text-primary">Matches</span>
              </h2>
              <p className="text-white/40 mt-4 max-w-2xl text-lg font-light leading-relaxed">
                Evaluating your <span className="text-primary/80 font-mono text-sm underline decoration-primary/30 underline-offset-4">ENCRYPTED_PROFILE</span> against live job escrows via CoFHE.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-xs font-mono">
            {error}
            {error.includes('Disconnected') && (
              <p className="mt-2 text-white/60">Tip: Your browser extension (Phantom/MetaMask) connection timed out. Please refresh the page.</p>
            )}
          </div>
        )}

        {isConnecting ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="font-barlow uppercase tracking-widest text-xs text-on-surface-variant text-center">Connecting Wallet...</p>
          </div>
        ) : !isConnected ? (
          <div className="liquid-glass p-12 rounded-3xl border border-white/5 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
              <Lock className="text-primary" size={32} />
            </div>
            <h2 className="text-2xl font-headline italic text-white mb-4">Matches Locked</h2>
            <p className="text-on-surface-variant max-w-md mx-auto mb-8">Please connect your wallet to evaluate your encrypted profile against open job escrows.</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="font-barlow uppercase tracking-widest text-xs text-on-surface-variant text-center">Scanning Arbitrum Event Logs<br/>for Job Postings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.length === 0 ? (
              <div className="liquid-glass p-12 rounded-3xl border border-white/5 text-center">
                <p className="text-on-surface-variant uppercase tracking-widest text-sm font-bold">No active job postings found on-chain.</p>
              </div>
            ) : (
              jobs.map((match) => (
                <motion.div 
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="liquid-glass p-8 rounded-2xl group hover:bg-surface-container-highest/40 transition-all duration-500 border border-white/5"
                >
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Role Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Briefcase className="text-primary" size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-3xl font-headline italic text-white">{match.role}</h3>
                            {match.matchStatus === 'matched' && (
                              <span className="bg-green-400/10 text-green-400 text-[10px] font-bold px-3 py-1 rounded-full border border-green-400/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                MATCH CONFIRMED
                              </span>
                            )}
                            {match.matchStatus === 'nomatch' && (
                              <span className="bg-red-400/10 text-red-400 text-[10px] font-bold px-3 py-1 rounded-full border border-red-400/20">
                                NO MATCH
                              </span>
                            )}
                          </div>
                          <p className="text-on-surface-variant text-sm tracking-wide font-mono flex items-center gap-2">
                            <LinkIcon size={12} /> Employer: {match.company}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <Coins size={18} className="text-primary/60" />
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Escrow Bounty</span>
                            <span className="text-sm font-mono text-white">{match.escrow} ETH</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <Lock size={18} className="text-primary/60" />
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Salary Data</span>
                            <span className="text-sm font-medium text-primary">Encrypted (FHE)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <UserCheck size={18} className="text-primary/60" />
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Experience Req</span>
                            <span className="text-sm font-medium text-primary">Encrypted (FHE)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <MapPin size={18} className="text-primary/60" />
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Location</span>
                            <span className="text-sm font-medium">Remote / On-Chain</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Visualizer */}
                    <div className="lg:w-80 flex flex-col justify-center border-l border-white/5 lg:pl-8">
                      <div className="space-y-4">
                        {match.matchStatus === 'unknown' ? (
                          <button 
                            onClick={() => handleCheckMatch(match.id)}
                            disabled={matchingInProgress[match.id]}
                            className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-barlow uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                          >
                            {matchingInProgress[match.id] ? (
                              <><Loader2 className="animate-spin" size={16} /> Evaluating FHE...</>
                            ) : (
                              <>Verify Match Probability</>
                            )}
                          </button>
                        ) : match.matchStatus === 'matched' ? (
                          <button 
                            onClick={() => handleApply(match.id)}
                            className="w-full py-4 bg-gradient-to-r from-primary to-primary-dim text-black rounded-xl text-xs font-barlow uppercase tracking-[0.2em] font-bold hover:shadow-[0_0_20px_rgba(197,154,255,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            Apply For Reward
                            <ChevronRight size={16} />
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-full py-4 bg-red-400/10 border border-red-400/30 text-red-400 rounded-xl text-xs font-barlow uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                              Requirements Not Met
                            </div>
                            <button 
                              onClick={() => handleCheckMatch(match.id, true)}
                              disabled={matchingInProgress[match.id]}
                              className="w-full py-3 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                              {matchingInProgress[match.id] ? (
                                <><Loader2 className="animate-spin" size={12} /> Re-checking...</>
                              ) : (
                                <>Re-evaluate Match</>
                              )}
                            </button>
                          </div>
                        )}
                        
                        <p className="text-[9px] text-on-surface-variant text-center uppercase tracking-widest leading-relaxed">
                          {match.matchStatus === 'unknown' 
                            ? "Click to run zero-knowledge comparison against your encrypted profile."
                            : "Match results are cryptographically proven and only visible to you."}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>
  );
}
