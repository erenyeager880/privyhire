import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, Loader2, ShieldCheck, Zap, ArrowRight, Activity,
  Clock, CheckCircle, Terminal, Eye, EyeOff, Copy, Gift,
  Star, Shield, AlertCircle, ChevronRight, ExternalLink
} from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useWalletClient, useSwitchChain, useChainId } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { getCofheClient, connectCofhe } from '@/src/lib/fhe';
import { Encryptable, FheTypes } from '@cofhe/sdk';
import { PRIVY_HIRE_ADDRESS, PRIVY_HIRE_ABI } from '@/src/lib/contracts';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { fetchCandidate, fetchCandidateActivityLog, fetchCandidateStats } from '../lib/subgraph';
import { formatEther } from 'viem';
import { useToast } from '@/src/components/Toast';

const SKILL_MAP: Record<string, number> = {
  "React": 1 << 0, "Solidity": 1 << 1, "Node.js": 1 << 2, "Rust": 1 << 3,
  "Python": 1 << 4, "Zero-Knowledge": 1 << 5, "AWS": 1 << 6, "Go": 1 << 7,
};

const BOOT_LINES = [
  "PRIVY//HIRE SECURE NODE v2.0",
  "Initializing Fhenix CoFHE runtime...",
  "Connecting to Arbitrum Sepolia...",
  "Loading encrypted identity vault...",
  "ACL permission matrix loaded.",
  "TERMINAL READY ▋",
];

// Animated scrambling ciphertext
function Ciphertext({ length = 6, className = "" }: { length?: number; className?: string }) {
  const [text, setText] = useState("");
  const chars = "ABCDEF0123456789!@#$%^&*_+{}|?<>";
  useEffect(() => {
    const iv = setInterval(() => {
      setText(Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join(''));
    }, 80);
    return () => clearInterval(iv);
  }, [length]);
  return <span className={cn("font-mono tracking-[0.2em] font-bold", className)}>{text}</span>;
}

// Boot animation component
function BootSequence({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      setLines(prev => [...prev, BOOT_LINES[i]]);
      i++;
      if (i >= BOOT_LINES.length) { clearInterval(iv); setTimeout(onDone, 400); }
    }, 280);
    return () => clearInterval(iv);
  }, []);
  return (
    <motion.div className="fixed inset-0 z-50 bg-black flex items-center justify-center" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <div className="font-mono text-sm space-y-2 p-8 max-w-lg w-full">
        <div className="text-primary/50 text-[10px] uppercase tracking-[0.4em] mb-6">PRIVY//HIRE SECURE BOOT</div>
        {lines.map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={cn("flex items-center gap-3", i === lines.length - 1 ? "text-primary" : "text-green-400/80")}>
            <span className="text-primary/30">{'>'}</span>{line}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Stat card
function StatCard({ label, value, icon: Icon, color = "primary", sub }: { label: string; value: React.ReactNode; icon: any; color?: string; sub?: string }) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 border-primary/20 text-primary",
    emerald: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400",
    amber: "bg-amber-400/10 border-amber-400/20 text-amber-400",
    blue: "bg-blue-400/10 border-blue-400/20 text-blue-400",
  };
  return (
    <motion.div whileHover={{ y: -3 }} className="bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-2xl p-5 flex items-center gap-4 transition-all hover:border-white/15">
      <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center shrink-0", colorMap[color])}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 font-mono mb-1">{label}</p>
        <p className="text-lg font-bold text-white leading-none">{value}</p>
        {sub && <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

type TerminalTab = 'PROFILE' | 'CLEARANCES' | 'ACTIVITY LOG' | 'REPUTATION';

export function CandidateDashboard() {
  const { address, isConnected, isConnecting } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });
  const publicClient = usePublicClient({ chainId: arbitrumSepolia.id });
  const { data: walletClient } = useWalletClient({ chainId: arbitrumSepolia.id });
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  // Boot
  const [booting, setBooting] = useState(true);
  const [activeTab, setActiveTab] = useState<TerminalTab>('PROFILE');

  // Profile form state
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptStep, setEncryptStep] = useState<'idle' | 'encrypt' | 'sign' | 'broadcast'>('idle');
  const [error, setError] = useState<string | null>(null);

  // ProfileSet state
  const [profileSet, setProfileSet] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [decryptedData, setDecryptedData] = useState<{ salary: bigint | null; experience: bigint | null; skills: bigint | null } | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Stats
  const [stats, setStats] = useState({ matches: 0, applied: 0, earned: '0', shieldActive: true });
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Clearances
  const [clearances, setClearances] = useState({ salary: true, skills: true, experience: true, reputation: false });

  // Referral
  const [referralCopied, setReferralCopied] = useState(false);
  const referralCode = address ? `PRIVY-${address.slice(2, 8).toUpperCase()}` : '---';

  const [profileData, setProfileData] = useState<any>(null);

  const loadProfileStatus = useCallback(async () => {
    if (!address) return;
    try {
      setIsLoadingProfile(true);
      const data: any = await fetchCandidate(address);
      setProfileSet(!!(data && data.candidate));
      
      // Load raw reputation data from contract
      const contractData = await (publicClient as any)?.readContract({
        address: PRIVY_HIRE_ADDRESS,
        abi: PRIVY_HIRE_ABI,
        functionName: 'candidates',
        args: [address]
      });
      setProfileData(contractData);
    } catch { setProfileSet(false); }
    finally { setIsLoadingProfile(false); }
  }, [address, publicClient]);

  const loadStats = useCallback(async () => {
    if (!address) return;
    try {
      const data: any = await fetchCandidateStats(address);
      const apps = data?.applications || [];
      const settled = apps.filter((a: any) => a.job.status === 'Settled');
      const earned = settled.reduce((acc: number, a: any) => acc + parseFloat(formatEther(BigInt(a.job.settlement?.escrowAmount || '0'))), 0);
      setStats({ matches: apps.length, applied: apps.length, earned: earned.toFixed(4), shieldActive: true });
    } catch { }
  }, [address]);

  const loadActivity = useCallback(async () => {
    if (!address) return;
    setLoadingActivity(true);
    try {
      const data: any = await fetchCandidateActivityLog(address);
      const entries: any[] = [];
      (data?.applications || []).forEach((a: any) => {
        entries.push({ type: 'APPLIED', jobId: a.job.id, employer: a.job.employer, timestamp: a.appliedAt, txHash: null });
        if (a.job.status === 'Settled') entries.push({ type: 'SETTLED', jobId: a.job.id, employer: a.job.employer, timestamp: a.job.settlement?.settledAt, escrow: a.job.settlement?.escrowAmount });
      });
      entries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setActivityLog(entries.slice(0, 12));
    } catch { }
    finally { setLoadingActivity(false); }
  }, [address]);

  useEffect(() => { loadProfileStatus(); loadStats(); }, [address]);
  useEffect(() => { if (activeTab === 'ACTIVITY LOG') loadActivity(); }, [activeTab, address]);
  useEffect(() => { if (isSuccess) { toastSuccess('Transaction confirmed!', 'Profile updated on Arbitrum Sepolia'); setTimeout(() => loadProfileStatus(), 2500); } }, [isSuccess]);

  const toggleSkill = (skill: string) =>
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);

  const handleDecryptProfile = async () => {
    if (!address || !publicClient || !walletClient) return;
    try {
      setIsDecrypting(true); setError(null);
      toastInfo('Decrypting payload...', 'Connecting to Fhenix CoFHE');
      const client = await connectCofhe();
      const data = await (publicClient as any).readContract({ address: PRIVY_HIRE_ADDRESS, abi: PRIVY_HIRE_ABI, functionName: 'candidates', args: [address] });
      const [tSalaryHandle, expHandle, skillsHandle, repSumHandle, repCount, exists] = data as [bigint, bigint, bigint, bigint, bigint, boolean];
      console.log("[FHE DEBUG] Candidate Handles fetched:", {
        tSalaryHandle: tSalaryHandle.toString(),
        expHandle: expHandle.toString(),
        skillsHandle: skillsHandle.toString(),
        repSumHandle: repSumHandle.toString(),
        repCount: repCount.toString(),
        exists
      });
      if (!exists) { setError("Profile data not found on-chain."); return; }
      // Do NOT pass explicit args — let the SDK use its internally connected walletClient account.
      // Passing mismatched chainId/address causes the 403 Forbidden on sealoutput.
      console.log(`DEBUG: Requesting permit for contract: ${PRIVY_HIRE_ADDRESS}`);
      const permit = await client.permits.getOrCreateSelfPermit();
      console.log("DEBUG: Generated Permit:", permit);
      console.log("DEBUG: _signedDomain chainId:", permit._signedDomain?.chainId);
      
      const [sal, exp, skills] = await Promise.all([
        client.decryptForView(tSalaryHandle, FheTypes.Uint32).withPermit(permit).execute(),
        client.decryptForView(expHandle, FheTypes.Uint32).withPermit(permit).execute(),
        client.decryptForView(skillsHandle, FheTypes.Uint32).withPermit(permit).execute(),
      ]);

      let avgRep = 0;
      if (repCount > 0n && repSumHandle !== 0n) {
          const repSum = await client.decryptForView(repSumHandle, FheTypes.Uint32)
              .withPermit(permit)
              .execute();
          avgRep = Number(repSum) / Number(repCount);
      }

      setDecryptedData({ salary: sal as bigint, experience: exp as bigint, skills: skills as bigint, reputation: avgRep } as any);
      setSalary(sal.toString()); setExperience(exp.toString());
      const skillsNum = Number(skills);
      setSelectedSkills(Object.keys(SKILL_MAP).filter(s => (skillsNum & SKILL_MAP[s]) !== 0));
      toastSuccess('Profile decrypted!');
    } catch (err: any) {
      console.error("[FHE DEBUG] Decryption Failed!", err);
      if (err.response?.data) {
        console.error("[FHE DEBUG] Node response:", err.response.data);
      }
      setError(err.message || 'Decryption failed.');
      toastError('Decryption failed', err.message?.slice(0, 60));
    } finally { setIsDecrypting(false); }
  };

  const handleUpdateProfile = async () => {
    if (chainId !== arbitrumSepolia.id) { switchChain({ chainId: arbitrumSepolia.id }); return; }
    if (!publicClient || !walletClient) { setError('Wallet not fully connected.'); return; }
    if (!salary || !experience) { setError('Please fill in all fields.'); return; }
    try {
      setIsEncrypting(true); setError(null); setEncryptStep('encrypt');
      toastInfo('Encrypting profile...', 'Wrapping data with Fhenix CoFHE');
      const client = await connectCofhe();
      const skillsBitmask = BigInt(selectedSkills.reduce((acc, skill) => acc | SKILL_MAP[skill], 0));
      const encryptedInputs = await client.encryptInputs([
        Encryptable.uint32(BigInt(salary)),
        Encryptable.uint32(BigInt(experience)),
        Encryptable.uint32(skillsBitmask)
      ]).execute();
      const [encSalary, encExp, encSkills] = encryptedInputs;
      setEncryptStep('sign');
      setIsEncrypting(false);
      setEncryptStep('broadcast');
      writeContract({
        address: PRIVY_HIRE_ADDRESS, abi: PRIVY_HIRE_ABI, functionName: 'setCandidateProfile',
        args: [encSalary as any, encExp as any, encSkills as any],
        account: address, chain: arbitrumSepolia,
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      toastError('Encryption failed', err.message?.slice(0, 60));
      setIsEncrypting(false); setEncryptStep('idle');
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setReferralCopied(true);
    toastSuccess('Referral code copied!');
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const tabs: TerminalTab[] = ['PROFILE', 'CLEARANCES', 'ACTIVITY LOG', 'REPUTATION'];
  const isBusy = isEncrypting || isPending || isWaiting;

  if (booting) return (
    <AnimatePresence>
      <BootSequence onDone={() => setBooting(false)} />
    </AnimatePresence>
  );

  if (isConnecting) return (
    <main className="md:ml-72 min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/40 font-mono">Connecting Wallet...</p>
    </main>
  );

  if (!isConnected) return (
    <main className="md:ml-72 min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/[0.02] backdrop-blur-md p-10 rounded-2xl border border-white/10 text-center max-w-md shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 mx-auto">
          <Lock className="text-white/60" size={24} />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-4">Secure Terminal Locked</h2>
        <p className="text-sm text-white/40 mb-8 leading-relaxed font-mono">Connect your wallet to access your encrypted identity terminal.</p>
        <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-wider">Requires Arbitrum Sepolia</div>
      </motion.div>
    </main>
  );

  if (isLoadingProfile) return (
    <main className="md:ml-72 min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/40 font-mono">Accessing Encrypted Profile</p>
    </main>
  );

  return (
    <main className="md:ml-72 p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      {renderDashboardContent()}
    </main>
  );

  function renderDashboardContent() {
    return (
      <div className="relative">
        <header className="mb-8 relative">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/15 blur-[100px] rounded-full pointer-events-none opacity-50" />
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-3">
            <Terminal size={14} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary font-mono">SECURE NODE ALPHA — ARBITRUM SEPOLIA</span>
            <span className="flex items-center gap-1.5 ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Online</span>
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-5xl md:text-6xl font-instrument italic tracking-tight text-white mb-3">
            Identity <span className="text-primary">Terminal</span>
          </motion.h1>
          <p className="text-white/40 max-w-xl text-base font-light leading-relaxed">
            Your identity and expectations are shielded by <span className="text-white font-medium">Fhenix CoFHE</span>. Matches are computed via on-chain homomorphic operations.
          </p>
        </header>

        {/* Hero Stats (shown when profile is set) */}
        {profileSet && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatCard label="Active Matches" value={stats.matches} icon={Zap} color="primary" sub="via subgraph" />
            <StatCard label="Total Applied" value={stats.applied} icon={Activity} color="blue" sub="on-chain" />
            <StatCard label="ETH Earned" value={`${stats.earned}`} icon={CheckCircle} color="emerald" sub="from escrows" />
            <StatCard label="Shield Status" value="FHE Active" icon={ShieldCheck} color="emerald" sub="CoFHE encrypted" />
          </motion.div>
        )}

        {/* Terminal Frame */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[1.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">

          {/* Terminal title bar */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/8 bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            </div>
            <span className="text-[10px] font-mono text-white/30 ml-2 tracking-widest">PRIVY//HIRE — identity.terminal</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[9px] font-mono text-primary/60 tracking-widest">{address?.slice(0, 10)}...{address?.slice(-6)}</span>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-white/8 bg-white/[0.01] overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] font-mono transition-all whitespace-nowrap border-b-2",
                  activeTab === tab
                    ? "text-primary border-primary bg-primary/5"
                    : "text-white/30 border-transparent hover:text-white/60 hover:bg-white/5"
                )}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">

              {/* ─── PROFILE TAB ─── */}
              {activeTab === 'PROFILE' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  {!profileSet ? (
                    // First-time setup
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-white/8" />
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Initialize Identity Shield</span>
                        <div className="h-px flex-1 bg-white/8" />
                      </div>
                      {renderProfileForm(false)}
                    </div>
                  ) : (
                    // Active profile view
                    <div className="space-y-8">
                      {/* Decrypted data cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Salary */}
                        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all">
                          <div className="absolute top-4 right-4 opacity-10"><Lock size={40} /></div>
                          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Target Compensation</p>
                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-primary text-xl">$</span>
                            <span className="text-3xl font-bold tracking-tight">
                              {decryptedData ? decryptedData.salary!.toLocaleString() : <Ciphertext length={6} className="text-primary text-2xl" />}
                            </span>
                          </div>
                          {decryptedData && (
                            <div className="text-[10px] text-white/40 font-mono">
                              {decryptedData.experience!.toString()} yrs exp &nbsp;·&nbsp; {selectedSkills.slice(0, 2).join(', ')}{selectedSkills.length > 2 ? ` +${selectedSkills.length - 2}` : ''}
                            </div>
                          )}
                          <button onClick={handleDecryptProfile} disabled={isDecrypting}
                            className="mt-5 w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-primary hover:border-primary text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                            {isDecrypting ? <Loader2 className="animate-spin" size={12} /> : decryptedData ? <Eye size={12} /> : <Lock size={12} />}
                            {decryptedData ? 'Refresh Decrypt' : 'Decrypt Payload'}
                          </button>
                        </div>

                        {/* Network sync (spans 2) */}
                        <div className="md:col-span-2 bg-white/[0.02] border border-white/8 rounded-2xl p-6 flex flex-col justify-between">
                          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Network Synchronization</p>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-[9px] uppercase font-mono font-bold text-white/30 mb-2">
                                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping inline-block" />Background Scanner</span>
                                <span className="text-primary">Subgraph Active</span>
                              </div>
                              <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-gradient-to-r from-transparent via-primary to-transparent w-1/3"
                                  animate={{ x: ["-100%", "300%"] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} />
                              </div>
                            </div>
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                              <p className="text-xs text-white/30 leading-relaxed font-light">
                                Your FHE-encrypted profile is actively intersecting with employer budget escrows. Mathematical overlap is evaluated entirely on-chain.
                              </p>
                            </div>
                          </div>
                          <Link to="/matches" className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                            View Active Matches <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>

                      {/* Update Profile */}
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-px flex-1 bg-white/8" />
                          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Update Identity Setup</span>
                          <div className="h-px flex-1 bg-white/8" />
                        </div>
                        {renderProfileForm(true)}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ─── CLEARANCES TAB ─── */}
              {activeTab === 'CLEARANCES' && (
                <motion.div key="clearances" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-6">FHE ACL Permission Matrix</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {([
                      { key: 'salary', label: 'Salary Visibility', desc: 'Allow employers to initiate homomorphic salary comparisons against your encrypted value.', icon: Lock },
                      { key: 'skills', label: 'Skill Disclosure', desc: 'Allow FHE bitmask operations to evaluate your encoded skill primitives against job requirements.', icon: Shield },
                      { key: 'experience', label: 'Experience Tier', desc: 'Permit FHE comparison of your years-of-experience handle against encrypted job minimums.', icon: CheckCircle },
                      { key: 'reputation', label: 'Reputation Score', desc: 'Allow employers to view your aggregated encrypted rating score from past settlements.', icon: Star },
                    ] as const).map(({ key, label, desc, icon: Icon }) => {
                      const active = clearances[key as keyof typeof clearances];
                      return (
                        <motion.div key={key} whileHover={{ scale: 1.01 }}
                          className={cn("p-6 rounded-2xl border transition-all relative overflow-hidden",
                            active ? "border-emerald-400/25 bg-emerald-400/3" : "border-white/8 bg-white/[0.02]")}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center",
                                active ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/40")}>
                                <Icon size={16} />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">{label}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
                                  <span className={cn("text-[9px] font-bold uppercase tracking-widest font-mono", active ? "text-emerald-400" : "text-red-400")}>
                                    {active ? 'GRANTED' : 'REVOKED'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button onClick={() => setClearances(prev => ({ ...prev, [key]: !prev[key as keyof typeof clearances] }))}
                              className={cn("relative w-11 h-6 rounded-full transition-all shrink-0 border", active ? "bg-emerald-400 border-emerald-300" : "bg-white/10 border-white/15")}>
                              <motion.div animate={{ x: active ? 20 : 2 }} transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
                            </button>
                          </div>
                          <p className="text-xs text-white/35 leading-relaxed">{desc}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="mt-6 p-4 bg-amber-400/5 border border-amber-400/15 rounded-xl flex items-start gap-3">
                    <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-white/50 leading-relaxed">
                      Clearance changes here are <span className="text-white font-medium">UI-local only</span> in this version. On-chain ACL grants via <code className="font-mono text-primary">FHE.allow()</code> will be wired in a follow-up deployment.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ─── ACTIVITY LOG TAB ─── */}
              {activeTab === 'ACTIVITY LOG' && (
                <motion.div key="activity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">On-Chain Event Stream</p>
                    <button onClick={loadActivity} className="text-[9px] font-mono text-primary/60 hover:text-primary uppercase tracking-widest flex items-center gap-1 transition-colors">
                      <Activity size={10} /> Refresh
                    </button>
                  </div>
                  {loadingActivity ? (
                    <div className="flex items-center justify-center py-16 gap-3 text-white/30 font-mono text-xs">
                      <Loader2 className="animate-spin" size={16} /> Syncing subgraph events...
                    </div>
                  ) : activityLog.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-white/20 font-mono text-sm">No on-chain events found.</p>
                      <p className="text-white/15 font-mono text-xs mt-2">Apply to jobs to generate activity.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activityLog.map((entry, i) => {
                        const isSettled = entry.type === 'SETTLED';
                        const ts = entry.timestamp ? new Date(Number(entry.timestamp) * 1000).toLocaleString() : '—';
                        return (
                          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className={cn("flex items-start gap-4 p-4 rounded-xl border font-mono text-xs transition-colors",
                              isSettled ? "border-emerald-400/15 bg-emerald-400/3" : "border-white/5 bg-white/[0.01] hover:bg-white/[0.02]")}>
                            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", isSettled ? "bg-emerald-400" : entry.type === 'APPLIED' ? "bg-primary" : "bg-white/30")} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={cn("font-bold", isSettled ? "text-emerald-400" : "text-primary")}>[{entry.type}]</span>
                                <span className="text-white/60 truncate">Job #{entry.jobId?.split('-')[1] || entry.jobId}</span>
                                {isSettled && entry.escrow && (
                                  <span className="text-emerald-400 ml-auto shrink-0">+{formatEther(BigInt(entry.escrow))} ETH</span>
                                )}
                              </div>
                              <div className="text-white/25 text-[10px]">{ts}</div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ─── REPUTATION TAB ─── */}
              {activeTab === 'REPUTATION' && (
                <motion.div key="reputation" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-6">FHE-Encrypted Reputation Score</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Score card */}
                    <div className="p-8 bg-white/[0.02] border border-white/8 rounded-2xl text-center flex flex-col items-center gap-5">
                      <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/25 flex items-center justify-center">
                        <Star className="text-primary fill-primary/20" size={36} />
                      </div>
                      <div>
                        {decryptedData && 'reputation' in decryptedData ? (
                          <div className="flex flex-col items-center">
                            <p className="text-4xl font-bold text-white">{(decryptedData as any).reputation.toFixed(1)}</p>
                            <div className="flex gap-1 mt-2 text-primary">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={14} fill={i < Math.round((decryptedData as any).reputation) ? 'currentColor' : 'none'} className={i < Math.round((decryptedData as any).reputation) ? 'opacity-100' : 'opacity-20'} />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-4xl font-bold text-white">—</p>
                            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-2">
                              {profileData && profileData[4] > 0n ? 'Decryption Required' : 'Awaiting Ratings'}
                            </p>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-white/30 leading-relaxed text-center max-w-xs">
                        Employers submit FHE-encrypted ratings after job settlement. Ratings are aggregated homomorphically on-chain as a rolling sum divided by count.
                      </p>
                      
                      {!decryptedData ? (
                        <button onClick={handleDecryptProfile} disabled={isDecrypting}
                          className="w-full py-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                          {isDecrypting ? <Loader2 className="animate-spin" size={14} /> : <Lock size={14} />}
                          Unlock Protocol Reputation
                        </button>
                      ) : (
                        <div className="w-full p-3 bg-emerald-400/5 border border-emerald-400/15 rounded-xl flex items-center gap-2">
                          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                          <p className="text-[10px] text-emerald-400/60 font-mono tracking-wider uppercase">Reputation FHE Verified</p>
                        </div>
                      )}
                    </div>

                    {/* Referral panel */}
                    <div className="p-8 bg-white/[0.02] border border-white/8 rounded-2xl flex flex-col gap-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Gift size={16} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">Referral Program</h3>
                          <p className="text-[10px] text-white/30 font-mono">Earn 5% on referred hires</p>
                        </div>
                      </div>
                      <div className="p-4 bg-black/40 border border-white/8 rounded-xl">
                        <p className="text-[9px] text-white/30 font-mono uppercase tracking-widest mb-2">Your Referral Code</p>
                        <div className="flex items-center gap-3">
                          <code className="text-primary font-mono text-base font-bold flex-1">{referralCode}</code>
                          <button onClick={copyReferral} className={cn("p-2 rounded-lg border transition-all", referralCopied ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400" : "bg-white/5 border-white/10 text-white/40 hover:text-white")}>
                            {referralCopied ? <CheckCircle size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/[0.02] border border-white/8 rounded-xl text-center">
                          <p className="text-lg font-bold text-white">0</p>
                          <p className="text-[9px] text-white/30 font-mono uppercase tracking-widest">Referred</p>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/8 rounded-xl text-center">
                          <p className="text-lg font-bold text-white">0 ETH</p>
                          <p className="text-[9px] text-white/30 font-mono uppercase tracking-widest">Pending</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/20 font-mono leading-relaxed">
                        Referral rewards wired to <span className="text-primary">PrivyHireReferrals.sol</span> after deployment.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Protocol Synchronized footer */}
        {profileSet && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center py-16 mt-6 border-t border-white/5">
            <div className="p-5 bg-emerald-400/5 border border-emerald-400/20 rounded-full mb-6 relative">
              <div className="absolute inset-0 bg-emerald-400/10 blur-2xl rounded-full" />
              <CheckCircle className="text-emerald-400 relative z-10" size={32} />
            </div>
            <h3 className="text-xl font-instrument italic text-white mb-2">Protocol Synchronized</h3>
            <p className="text-white/35 text-sm text-center max-w-md font-light leading-relaxed">
              Your primitives are resident on Arbitrum Sepolia.{' '}
              <Link to="/matches" className="text-primary hover:underline">Navigate to Matches Center</Link> to initiate discovery.
            </p>
          </motion.div>
        )}
      </div>
    );
  }

  // ─── Profile Form renderer (shared between new/update) ───
  function renderProfileForm(isUpdate: boolean) {
    return (
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-400/8 border border-red-400/20 rounded-xl text-red-400 text-xs font-mono flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          <div className="group">
            <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2.5 font-mono group-focus-within:text-primary transition-colors">
              Target Annual Salary (USDC)
            </label>
            <div className="relative">
              <input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 150000"
                className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-mono" />
              {salary && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono">
                  <span className="text-primary/60 mr-2">FHE Preview:</span>
                  <Ciphertext length={5} className="text-primary/40 text-[10px]" />
                </div>
              )}
            </div>
          </div>
          <div className="group">
            <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2.5 font-mono group-focus-within:text-primary transition-colors">
              Professional Experience (Years)
            </label>
            <input type="number" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 5"
              className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-mono" />
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3 font-mono">
            Skill Primitives (Bitmask Encoding)
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(SKILL_MAP).map(skill => (
              <button key={skill} onClick={() => toggleSkill(skill)}
                className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border font-mono active:scale-95",
                  selectedSkills.includes(skill)
                    ? "bg-primary text-black border-primary shadow-[0_0_12px_rgba(197,154,255,0.3)]"
                    : "bg-white/3 border-white/8 text-white/40 hover:border-white/20 hover:bg-white/8")}>
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-5 border-t border-white/8">
          <div className="flex items-start gap-3 text-xs text-white/30 max-w-sm">
            <Lock className="shrink-0 text-primary mt-0.5" size={13} />
            <span className="leading-relaxed font-mono">Values are <span className="text-white">FHE-encrypted natively</span>. The smart contract only receives randomized ciphertexts.</span>
          </div>
          {/* Multi-step button */}
          <button onClick={handleUpdateProfile}
            disabled={!isConnected || !walletClient || isBusy || !salary || !experience}
            className={cn("w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-xl",
              encryptStep === 'idle' ? "bg-white text-black hover:bg-primary hover:text-black" : "bg-primary text-black")}>
            {encryptStep === 'encrypt' || isEncrypting ? (
              <><Loader2 className="animate-spin" size={14} /> Encrypting FHE...</>
            ) : encryptStep === 'sign' ? (
              <><Loader2 className="animate-spin" size={14} /> Signing...</>
            ) : encryptStep === 'broadcast' || isPending || isWaiting ? (
              <><Loader2 className="animate-spin" size={14} /> Broadcasting to Arbitrum...</>
            ) : (
              <>{isUpdate ? 'Commit New Ciphertexts' : 'Activate Profile'}<ChevronRight size={14} /></>
            )}
          </button>
        </div>
      </div>
    );
  }
}
