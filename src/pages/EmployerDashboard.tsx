import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '@/src/components/Sidebar';
import {
  Lock, Briefcase, BarChart2, UserCheck, Plus, Shield, CheckCircle,
  Wallet, Loader2, Link as LinkIcon, XCircle, Coins, Clock,
  TrendingUp, Users, AlertCircle, Star
} from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useWalletClient, useSwitchChain, useChainId } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { getCofheClient, connectCofhe } from '@/src/lib/fhe';
import { Encryptable } from '@cofhe/sdk';
import { PRIVY_HIRE_ADDRESS, PRIVY_HIRE_ABI, REPUTATION_VAULT_ADDRESS, REPUTATION_VAULT_ABI } from '@/src/lib/contracts';
import { parseEther, formatEther } from 'viem';
import { cn } from '@/src/lib/utils';
import { fetchEmployerJobs, fetchApplicationsForJobs, fetchAllApplications, SUBGRAPH_URL } from '../lib/subgraph';
import { useToast } from '@/src/components/Toast';

const SKILL_MAP: Record<string, number> = {
  "React": 1 << 0, "Solidity": 1 << 1, "Node.js": 1 << 2, "Rust": 1 << 3,
  "Python": 1 << 4, "Zero-Knowledge": 1 << 5, "AWS": 1 << 6, "Go": 1 << 7,
};

type Tab = 'pipeline' | 'jobs' | 'post';

interface Applicant { candidate: `0x${string}`; jobId: number; role: string; }
interface JobEntry { id: string; jobId: number; escrowAmount: string; status: string; createdAt: string; settlement?: { candidate: string; escrowAmount: string; settledAt: string }; }

export function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('pipeline');
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: arbitrumSepolia.id });
  const { data: walletClient } = useWalletClient({ chainId: arbitrumSepolia.id });
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { success: toastSuccess, error: toastError } = useToast();

  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [minExp, setMinExp] = useState('');
  const [escrowAmount, setEscrowAmount] = useState('0.1');
  const [roleTitle, setRoleTitle] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingPipeline, setLoadingPipeline] = useState(false);
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Analytics derived from jobs
  const totalEscrowed = jobs.reduce((a, j) => a + parseFloat(formatEther(BigInt(j.escrowAmount || '0'))), 0);
  const totalHires = jobs.filter(j => j.status === 'Settled').length;
  const activeJobs = jobs.filter(j => j.status === 'Posted').length;

  const [ratingTarget, setRatingTarget] = useState<{ candidate: string; jobId: number } | null>(null);
  const [ratingValue, setRatingValue] = useState('5');
  const [isRating, setIsRating] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!address) return;
    const loadAllEmployerData = async () => {
      setLoadingJobs(true);
      setLoadingPipeline(true);
      try {
        const data: any = await fetchEmployerJobs(address);
        
        // Map Jobs
        const formattedJobs = data.jobs.map((j: any) => ({
          id: j.id, 
          jobId: Number(j.id.split('-')[1]),
          escrowAmount: j.escrowAmount, 
          status: j.status,
          createdAt: j.createdAt, 
          settlement: j.settlement
        }));
        setJobs(formattedJobs);
        setDebugData(prev => ({ ...prev, jobs: data.jobs, address, subgraphUrl: SUBGRAPH_URL }));

        // Stage 2: Explicitly fetch all applications for these jobs
        const jobIds = formattedJobs.map(j => j.id);
        if (jobIds.length > 0) {
          const appData: any = await fetchApplicationsForJobs(jobIds);
          const globalApps: any = await fetchAllApplications();
          setDebugData(prev => ({ 
            ...prev, 
            rawApplications: appData.applications,
            allGlobalApps: globalApps.applications.map((a: any) => a.id)
          }));
          const allApplicants: Applicant[] = appData.applications.map((app: any) => ({
            candidate: app.candidate.id as `0x${string}`,
            jobId: Number(app.job.id.split('-')[1]),
            role: `Job #${app.job.id.split('-')[1]}`
          }));
          setApplicants(allApplicants);
        } else {
          setApplicants([]);
        }
      } catch (err) {
        console.error("Error loading employer data:", err);
        toastError('Failed to load dashboard data');
      } finally {
        setLoadingJobs(false);
        setLoadingPipeline(false);
      }
    };

    loadAllEmployerData();
  }, [address]);

  useEffect(() => {
    if (isSuccess && activeTab === 'post') { toastSuccess('Role posted & escrow locked!', 'Homomorphic encryption confirmed on Arbitrum'); }
    if (isSuccess && activeTab === 'pipeline') { toastSuccess('Settlement complete!', 'Escrow released to candidate'); }
  }, [isSuccess]);

  const toggleSkill = (s: string) => setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (chainId !== arbitrumSepolia.id) { switchChain({ chainId: arbitrumSepolia.id }); return; }
    if (!publicClient || !walletClient) { setError('Wallet not fully connected.'); return; }
    if (!minSalary || !maxSalary || !minExp || !escrowAmount) { setError('Please fill in all fields.'); return; }
    try {
      setIsEncrypting(true);
      const client = await connectCofhe();
      const skillsBitmask = BigInt(selectedSkills.reduce((acc, s) => acc | SKILL_MAP[s], 0));
      const encryptedInputs = await client.encryptInputs([
        Encryptable.uint32(BigInt(minSalary)), Encryptable.uint32(BigInt(maxSalary)),
        Encryptable.uint32(BigInt(minExp)), Encryptable.uint32(skillsBitmask)
      ]).execute();
      const [encMin, encMax, encExp, encSkills] = encryptedInputs;
      setIsEncrypting(false);
      writeContract({
        address: PRIVY_HIRE_ADDRESS, abi: PRIVY_HIRE_ABI, functionName: 'createJobWithEscrow',
        args: [encMin as any, encMax as any, encExp as any, encSkills as any],
        value: parseEther(escrowAmount), account: address, chain: arbitrumSepolia,
      });
    } catch (err: any) {
      setError(err.shortMessage || err.message || 'An unexpected error occurred.');
      toastError('Post failed', err.message?.slice(0, 60));
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleSettle = (jobId: number, candidate: `0x${string}`) => {
    writeContract({ address: PRIVY_HIRE_ADDRESS, abi: PRIVY_HIRE_ABI, functionName: 'selectCandidateAndSettle', args: [BigInt(jobId), candidate], account: address, chain: arbitrumSepolia });
  };

  const handleRateCandidate = async () => {
    if (!ratingTarget || !publicClient || !walletClient) return;
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
        args: [ratingTarget.candidate as `0x${string}`, BigInt(ratingTarget.jobId), encryptedInputs[0] as any],
        account: address,
        chain: arbitrumSepolia
      });
      setRatingTarget(null);
    } catch (err: any) {
      toastError('Rating failed', err.message?.slice(0, 60));
    } finally {
      setIsRating(false);
    }
  };

  const handleCancelJob = (jobId: number) => {
    writeContract({ address: PRIVY_HIRE_ADDRESS, abi: PRIVY_HIRE_ABI, functionName: 'cancelJob', args: [BigInt(jobId)], account: address, chain: arbitrumSepolia });
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pipeline', label: 'Pipeline' },
    { key: 'jobs', label: 'My Jobs' },
    { key: 'post', label: 'Post Role' },
  ];

  return (
    <main className="md:ml-72 p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      {renderContent()}
    </main>
  );

  function renderContent() {
    return (
      <>
        {/* Header */}
        <header className="mb-10 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-primary/50" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary font-mono">Employer Command Center</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-headline italic tracking-tight text-white mb-2">Hire <span className="text-primary">Talent</span></h1>
            <p className="text-white/40 text-base max-w-xl font-light">Manage your encrypted talent pipeline and post FHE-secured roles.</p>
          </div>
          {/* Stat Strip */}
          <div className="flex gap-4 shrink-0">
            {[
              { label: 'Total Escrowed', value: `${totalEscrowed.toFixed(3)} ETH`, icon: Coins, color: 'text-primary' },
              { label: 'Hires Made', value: totalHires, icon: UserCheck, color: 'text-emerald-400' },
              { label: 'Active Posts', value: activeJobs, icon: Briefcase, color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.03] border border-white/8 rounded-2xl px-5 py-4 text-center min-w-[100px]">
                <s.icon size={16} className={cn("mx-auto mb-2", s.color)} />
                <p className="text-lg font-bold text-white leading-none">{s.value}</p>
                <p className="text-[9px] text-white/30 font-mono uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </header>

        {/* Tab bar */}
        <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/8 shadow-xl w-fit mb-8">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={cn("px-6 py-2.5 rounded-lg text-xs font-bold font-mono uppercase tracking-widest transition-all",
                activeTab === t.key ? "bg-primary text-black shadow-md" : "text-white/30 hover:text-white")}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ─── PIPELINE TAB ─── */}
          {activeTab === 'pipeline' && (
            <motion.div key="pipeline" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between px-1 mb-2">
                  <h3 className="font-mono uppercase tracking-widest text-xs text-primary font-bold">Active Shortlist</h3>
                  {loadingPipeline ? <Loader2 className="animate-spin text-primary" size={14} /> :
                    <span className="text-xs font-bold text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/8 font-mono">{applicants.length} applicants</span>}
                </div>
                {!isConnected ? (
                  <div className="p-12 rounded-2xl border border-white/8 text-center text-white/30 font-mono text-sm">Connect wallet to view pipeline</div>
                ) : applicants.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-white/8 text-center text-white/30 font-mono text-sm">No applicants yet.</div>
                ) : applicants.map((app, idx) => (
                  <motion.div key={idx} whileHover={{ scale: 1.005 }}
                    className="bg-white/[0.02] border border-white/8 hover:border-primary/20 p-7 rounded-2xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <h4 className="text-xl font-headline italic text-white mb-1">Candidate <span className="font-mono text-sm text-white/40">{app.candidate.slice(0, 10)}...</span></h4>
                        <p className="text-primary text-[10px] font-bold tracking-widest uppercase font-mono flex items-center gap-2">
                          <LinkIcon size={10} /> Applied to {app.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-400/8 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                        <CheckCircle size={11} className="text-emerald-400" />
                        <span className="text-emerald-400 font-mono text-[9px] uppercase font-bold tracking-widest">FHE Verified</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-white/8">
                      <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest font-mono">
                        <Shield size={13} className="text-primary/50" /> FHE-Locked Identity
                      </div>
                      <button onClick={() => handleSettle(app.jobId, app.candidate)} disabled={isPending || isWaiting}
                        className="px-6 py-2.5 rounded-full bg-white text-black text-[10px] font-bold font-mono uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-all shadow-xl disabled:opacity-40">
                        {isPending || isWaiting ? <Loader2 className="animate-spin" size={12} /> : null}
                        Hire & Release Escrow
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Analytics sidebar */}
              <div className="col-span-12 lg:col-span-4 space-y-4">
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
                  <h3 className="font-mono uppercase tracking-[0.2em] text-[9px] font-bold text-white/30 mb-5 flex items-center gap-2">
                    <BarChart2 size={12} /> Recruitment Analytics
                  </h3>
                  <div className="space-y-5">
                    {[
                      { label: 'Pipeline Fill Rate', val: applicants.length > 0 ? Math.min(100, applicants.length * 20) : 0, color: 'bg-primary' },
                      { label: 'Hire Rate', val: jobs.length > 0 ? Math.round((totalHires / jobs.length) * 100) : 0, color: 'bg-emerald-400' },
                      { label: 'Escrow Utilization', val: totalEscrowed > 0 ? 100 : 0, color: 'bg-blue-400' },
                    ].map(m => (
                      <div key={m.label}>
                        <div className="flex justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-white/30 mb-1.5">
                          <span>{m.label}</span><span className="text-white">{m.val}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${m.val}%` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className={cn("h-full rounded-full", m.color)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
                  <h3 className="font-mono uppercase tracking-[0.2em] text-[9px] font-bold text-white/30 mb-4 flex items-center gap-2">
                    <TrendingUp size={12} /> Quick Stats
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Applicants', val: applicants.length, icon: Users },
                      { label: 'Total ETH Locked', val: `${totalEscrowed.toFixed(3)}`, icon: Coins },
                      { label: 'Jobs Active', val: activeJobs, icon: Briefcase },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest flex items-center gap-2"><s.icon size={11} />{s.label}</span>
                        <span className="text-sm font-bold text-white font-mono">{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── JOBS TAB ─── */}
          {activeTab === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-mono uppercase tracking-widest text-xs text-primary font-bold">All Posted Jobs</h3>
                {loadingJobs && <Loader2 className="animate-spin text-primary" size={14} />}
              </div>
              {!isConnected ? (
                <div className="p-12 rounded-2xl border border-white/8 text-center text-white/30 font-mono">Connect wallet to view jobs</div>
              ) : jobs.length === 0 && !loadingJobs ? (
                <div className="p-12 rounded-2xl border border-dashed border-white/8 text-center">
                  <Briefcase size={32} className="mx-auto text-white/15 mb-4" />
                  <p className="text-white/30 font-mono text-sm">No jobs posted yet.</p>
                  <button onClick={() => setActiveTab('post')} className="mt-4 px-6 py-2.5 bg-primary text-black font-bold font-mono text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-all">
                    Post Your First Role
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job, idx) => {
                    const isActive = job.status === 'Posted';
                    const isSettled = job.status === 'Settled';
                    const escrowEth = formatEther(BigInt(job.escrowAmount || '0'));
                    const date = job.createdAt ? new Date(Number(job.createdAt) * 1000).toLocaleDateString() : '—';
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                        className={cn("p-6 rounded-2xl border transition-all",
                          isSettled ? "border-emerald-400/15 bg-emerald-400/3" : isActive ? "border-white/8 bg-white/[0.02] hover:border-white/15" : "border-white/5 opacity-60")}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
                              isSettled ? "bg-emerald-400/10 border-emerald-400/20" : "bg-primary/10 border-primary/20")}>
                              {isSettled ? <CheckCircle size={16} className="text-emerald-400" /> : <Briefcase size={16} className="text-primary" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-white font-bold text-sm">Job #{job.jobId}</span>
                                <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border font-mono",
                                  isSettled ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                                    isActive ? "text-primary bg-primary/10 border-primary/20" :
                                      "text-white/30 bg-white/5 border-white/10")}>
                                  {job.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-white/30 font-mono">Posted {date} &nbsp;·&nbsp; Escrow: {escrowEth} ETH</p>
                            </div>
                          </div>
                          {isActive && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleCancelJob(job.jobId)} disabled={isPending || isWaiting}
                                className="px-4 py-2 rounded-xl border border-red-400/20 text-red-400 text-[10px] font-bold font-mono uppercase tracking-widest hover:bg-red-400/10 transition-all disabled:opacity-40 flex items-center gap-1.5">
                                <XCircle size={12} /> Cancel & Refund
                              </button>
                            </div>
                          )}
                          {isSettled && job.settlement && (
                            <div className="flex items-center gap-4">
                              <div className="text-[10px] text-emerald-400 font-mono">
                                Hired: {job.settlement.candidate.slice(0, 10)}... &nbsp;·&nbsp; {formatEther(BigInt(job.settlement.escrowAmount))} ETH released
                              </div>
                              <button onClick={() => setRatingTarget({ candidate: job.settlement!.candidate, jobId: job.jobId })}
                                className="px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center gap-1.5">
                                <Plus size={10} /> Rate Candidate
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── POST ROLE TAB ─── */}
          {activeTab === 'post' && (
            <motion.div key="post" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="max-w-2xl mx-auto">
              <div className="bg-white/[0.02] border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><Shield size={200} /></div>

                <h3 className="text-4xl font-headline italic text-white mb-2">Create Encrypted Role</h3>
                <p className="text-white/35 mb-8 leading-relaxed font-light">Your budget ranges and skill prerequisites will be FHE-encrypted on the client via Fhenix CoFHE before being sent on-chain.</p>

                {error && (
                  <div className="mb-6 p-4 bg-red-400/8 border border-red-400/20 rounded-xl text-red-400 text-xs font-mono flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />{error}
                  </div>
                )}

                {isSuccess && activeTab === 'post' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-emerald-400/8 border border-emerald-400/25 rounded-2xl flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-emerald-400/15 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-emerald-400" size={32} />
                    </div>
                    <h4 className="text-2xl font-headline italic text-emerald-400">Escrow Locked & Role Active</h4>
                    <p className="text-sm text-white/40">Requirements homomorphically encrypted and recorded on Arbitrum.</p>
                    <button onClick={() => setActiveTab('pipeline')} className="px-6 py-2.5 bg-emerald-400 text-black font-bold font-mono uppercase tracking-widest text-xs rounded-full hover:bg-emerald-300 transition-all">
                      Return to Pipeline
                    </button>
                  </motion.div>
                ) : (
                  <form className="space-y-6 relative z-10" onSubmit={handlePostJob}>
                    {/* Role title */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 font-mono">Role Title (Public Label)</label>
                      <input value={roleTitle} onChange={e => setRoleTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-mono text-sm"
                        placeholder="e.g. Lead Zero-Knowledge Engineer" type="text" />
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3 font-mono">Required Skills (FHE Bitmask)</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(SKILL_MAP).map(skill => (
                          <button type="button" key={skill} onClick={() => toggleSkill(skill)}
                            className={cn("px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border font-mono",
                              selectedSkills.includes(skill) ? "bg-primary text-black border-primary shadow-[0_0_10px_rgba(197,154,255,0.3)]" : "bg-white/3 border-white/8 text-white/35 hover:border-white/20")}>
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Min experience */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 font-mono">Minimum Experience (Years)</label>
                      <input value={minExp} onChange={e => setMinExp(e.target.value)}
                        className="w-full bg-black/40 border border-white/8 rounded-xl px-4 py-3.5 text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-all"
                        placeholder="e.g. 5" type="number" />
                    </div>

                    {/* Encrypted finances */}
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/8 space-y-5">
                      <div className="flex items-center gap-3 pb-4 border-b border-white/8">
                        <Lock className="text-primary" size={16} />
                        <h4 className="text-sm font-bold text-white font-mono uppercase tracking-widest">Encrypted Finances</h4>
                        <span className="ml-auto text-[9px] font-mono text-primary/50 bg-primary/5 px-2 py-0.5 rounded border border-primary/15">FHE Wrapped</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 font-mono">Min Base ($)</label>
                          <input value={minSalary} onChange={e => setMinSalary(e.target.value)}
                            className="w-full bg-black/50 border border-primary/20 rounded-xl px-4 py-3.5 text-white font-mono text-sm focus:outline-none focus:border-primary transition-all"
                            placeholder="e.g. 120000" type="number" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 font-mono">Max Cap ($)</label>
                          <input value={maxSalary} onChange={e => setMaxSalary(e.target.value)}
                            className="w-full bg-black/50 border border-primary/20 rounded-xl px-4 py-3.5 text-white font-mono text-sm focus:outline-none focus:border-primary transition-all"
                            placeholder="e.g. 200000" type="number" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-primary font-mono">
                          <Wallet size={11} /> Escrow Funding (ETH)
                        </label>
                        <input value={escrowAmount} onChange={e => setEscrowAmount(e.target.value)}
                          className="w-full bg-primary/5 border border-primary/25 rounded-xl px-4 py-3.5 text-white font-mono text-sm focus:outline-none focus:border-primary transition-all"
                          placeholder="0.1" type="number" step="0.01" />
                        <p className="text-[10px] text-white/25 leading-relaxed font-mono">ETH locked in <span className="text-primary">PrivyHire.sol</span> and trustlessly released on settlement.</p>
                      </div>
                    </div>

                    <button type="submit" disabled={!isConnected || !walletClient || isEncrypting || isPending || isWaiting || !minSalary || !maxSalary}
                      className="w-full py-4.5 rounded-2xl bg-white text-black font-bold uppercase tracking-[0.15em] text-xs hover:bg-primary transition-all disabled:opacity-40 disabled:pointer-events-none shadow-xl flex justify-center items-center gap-2">
                      {isEncrypting ? <><Loader2 className="animate-spin" size={16} /> Encrypting FHE Payload...</> :
                        isPending || isWaiting ? <><Loader2 className="animate-spin" size={16} /> Locking Escrow...</> :
                          <><CheckCircle size={16} /> Publish Role & Lock Escrow</>}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rating Modal */}
        <AnimatePresence>
          {ratingTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRatingTarget(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-[#0A0A0B] border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none"><Star size={160} /></div>
                <h3 className="text-2xl font-headline italic text-white mb-2">Rate Candidate</h3>
                <p className="text-xs text-white/40 mb-6 font-mono">Job #{ratingTarget.jobId} settlement complete.</p>

                <div className="space-y-4 mb-8">
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-primary font-mono">Performance Metric (1–10)</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[2, 4, 6, 8, 10].map(v => (
                      <button key={v} onClick={() => setRatingValue(v.toString())}
                        className={cn("py-3 rounded-xl border font-bold text-xs transition-all font-mono",
                          ratingValue === v.toString() ? "bg-primary text-black border-primary" : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10")}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setRatingTarget(null)} className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors uppercase font-mono">Cancel</button>
                  <button onClick={handleRateCandidate} disabled={isRating || isPending || isWaiting}
                    className="flex-[2] py-3 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2">
                    {isRating || isPending || isWaiting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                    Submit Encrypted
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Debug View Toggle */}
        <div className="mt-20 pt-10 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
          <button onClick={() => setShowDebug(!showDebug)} className="text-[10px] font-mono text-white/20 uppercase tracking-widest hover:text-primary transition-colors">
            {showDebug ? 'Hide Diagnostics' : 'Show Dashboard Diagnostics'}
          </button>
          
          {showDebug && (
            <div className="mt-4 p-6 bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
              <h4 className="text-xs font-mono text-primary mb-4 uppercase tracking-widest font-bold">Raw Subgraph Feed</h4>
              <pre className="text-[9px] font-mono text-white/40 overflow-scroll max-h-[400px]">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </>
    );
  }
}
