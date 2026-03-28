import { useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Shield, Lock, CheckCircle, Key, Network, Eye, Briefcase, Coins, ArrowRight, Zap, Code2, Users, FileSearch, ShieldCheck, BarChart3, Globe, Star, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BackgroundPaths } from '../components/BackgroundPaths';
import { Navbar } from '../components/Navbar';
import { BentoGrid } from '../components/BentoGrid';

const STATS = [
  { value: '100%', label: 'Data Stays Encrypted' },
  { value: 'FHE', label: 'Fhenix CoFHE Powered' },
  { value: '0', label: 'Salary Leaks Ever' },
  { value: 'Trustless', label: 'Escrow Settlement' },
];


const WORKFLOW_STEPS = [
  {
    role: 'candidate',
    icon: Shield,
    step: '01',
    title: 'Encrypt Your Profile',
    desc: 'Enter your target salary, years of experience, and skills. The FHE SDK wraps these into ciphertexts on your device before uploading.',
    code: `fheClient.encryptInputs([\n  Encryptable.uint32(salary),\n  Encryptable.uint32(experience),\n  Encryptable.uint32(skillBitmask)\n]).execute()`,
  },
  {
    role: 'employer',
    icon: Briefcase,
    step: '02',
    title: 'Post a Confidential Role',
    desc: 'Employers set encrypted salary ranges, required skills, and fund an on-chain escrow bounty that will auto-release to the selected hire.',
    code: `contract.createJobWithEscrow(\n  encMinSalary, encMaxSalary,\n  encMinExp, encSkillMask,\n  { value: escrowETH }\n)`,
  },
  {
    role: 'candidate',
    icon: CheckCircle,
    step: '03',
    title: 'ZK Match Evaluation',
    desc: 'The smart contract runs FHE operations comparing your encrypted profile against job requirements — fully on-chain, zero data exposed.',
    code: `// FHE.sol inside contract\nebool salaryOk = FHE.and(\n  FHE.gte(targetSalary, minSalary),\n  FHE.lte(targetSalary, maxSalary)\n);\nebool isMatch = FHE.and(\n  FHE.and(salaryOk, expOk), skillsOk\n);`,
  },
  {
    role: 'employer',
    icon: Coins,
    step: '04',
    title: 'Select & Auto-Settle',
    desc: 'Employers choose from verified applicants. A single transaction selects the hire and atomically transfers the escrowed ETH — no manual payout.',
    code: `contract.selectCandidateAndSettle(\n  jobId,\n  candidateAddress\n)\n// → ETH streamed to candidate wallet`,
  },
];

const FAQS = [
  { q: 'Is my salary data actually private?', a: 'Yes. Using Fhenix CoFHE, your salary is encrypted locally using Fully Homomorphic Encryption. Even the smart contract never decrypts it — the on-chain comparison happens over ciphertexts, making it mathematically impossible to extract your raw data.' },
  { q: 'How does the matching engine work without seeing my number?', a: 'FHE allows arithmetic operations on encrypted values. The contract computes whether your encrypted salary falls within the employer\'s encrypted range — producing an encrypted boolean result. Only you can decrypt that result using your wallet-signed permit.' },
  { q: 'What happens to the escrow if no one is selected?', a: 'The smart contract retains the escrow until the employer closes the job. No external party can access the funds. The trustless design guarantees the employer retains control unless they explicitly settle.' },
  { q: 'Do I need special hardware for FHE?', a: 'No. Fhenix CoFHE handles the heavy WASM computation in a Web Worker thread in your browser — no GPU or special server required. The encryption happens seamlessly before any network call.' },
  { q: 'Is this live on mainnet?', a: 'PrivyHire is currently deployed on Arbitrum Sepolia testnet. The FHE matching engine and escrow contracts are fully operational for testing end-to-end flows.' },
];

import { WavyBackground } from '../components/WavyBackground';

export function LandingPage() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeJourney, setActiveJourney] = useState<'candidate' | 'employer'>('candidate');

  return (
    <div className="relative min-h-screen flex flex-col">
        <Navbar />
        <BackgroundPaths />

        <main className="pt-32">
          {/* ... */}
        {/* Hero */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } } }}
          className="max-w-7xl mx-auto px-6 text-center mb-24 relative"
        >
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full -z-10"
          />

          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest font-barlow mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live on Arbitrum Sepolia · Fhenix CoFHE
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 30, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}
            className="font-instrument italic text-5xl md:text-8xl text-white tracking-tight mb-8 leading-[1.05] text-glow"
          >
            Hire & Get Hired<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary/50">Without Exposing Your Data</span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.1 } } }}
            className="max-w-2xl mx-auto text-white/90 text-lg md:text-xl leading-relaxed mb-12 text-glow"
          >
            PrivyHire is a fully on-chain recruitment protocol powered by <span className="text-white font-bold underline decoration-primary/30">Fully Homomorphic Encryption</span>. Salaries stay encrypted during matching. Escrow is locked and auto-released. No middlemen. No leaks.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } } }}
            className="flex flex-col md:flex-row gap-4 justify-center items-center"
          >
            <Link to="/dashboard" className="group relative overflow-hidden px-10 py-4 rounded-full bg-primary text-black font-bold font-barlow uppercase tracking-widest text-sm hover:shadow-[0_0_40px_rgba(197,154,255,0.5)] hover:scale-105 active:scale-95 transition-all">
              <motion.div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-2">Find Jobs <ArrowRight size={16} /></span>
            </Link>
            <Link to="/employer" className="px-10 py-4 rounded-full liquid-glass border border-white/10 text-white font-bold font-barlow uppercase tracking-widest text-sm hover:border-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              Hire Talent
            </Link>
          </motion.div>
        </motion.section>

        {/* Stats Strip */}
        <section className="max-w-5xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="liquid-glass p-6 rounded-2xl border border-white/5 text-center"
              >
                <p className="text-2xl md:text-3xl font-headline italic text-primary mb-1 text-glow">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 font-barlow">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FHE Match Visualizer */}
        <section className="max-w-6xl mx-auto px-6 mb-40 relative">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary font-barlow">Live Protocol Simulation</span>
            <h2 className="text-4xl md:text-5xl font-instrument italic text-white mt-4">Watch the Match Happen</h2>
            <p className="text-on-surface-variant mt-3 max-w-xl mx-auto">Both sides submit encrypted data. The blockchain evaluates overlap without either party learning the other's number.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative">
            {/* Candidate */}
            <motion.div
              initial={{ x: -60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="liquid-glass p-8 rounded-2xl w-full md:w-72 border border-white/10 relative overflow-hidden"
            >
              <motion.div animate={{ y: ['-100%', '300%'] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-primary/5 to-transparent -z-10" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Shield className="text-primary" size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Candidate Side</p>
                  <p className="text-sm font-bold text-white text-glow">0x4f2...a19</p>
                </div>
              </div>
              <div className="space-y-3">
                {[['Target Salary', '$ ••••••'], ['Experience', '• yrs'], ['Skills', '••••••••']].map(([k, v]) => (
                  <div key={k} className="bg-black/40 rounded-xl px-4 py-3 flex justify-between items-center border border-white/5">
                    <span className="text-xs text-on-surface-variant">{k}</span>
                    <div className="flex items-center gap-2">
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="text-primary font-mono text-xs font-bold">{v}</motion.span>
                      <Lock size={12} className="text-primary/60" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-[9px] text-on-surface-variant/40 font-mono text-center">euint32: 0x82f4a...c12d</div>
            </motion.div>

            {/* Center FHE Engine */}
            <div className="flex-1 flex flex-col items-center gap-4 px-4">
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary font-barlow text-center">
                FHE Evaluation Engine
              </motion.div>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent relative overflow-hidden">
                <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-primary w-24 blur-sm" />
              </div>
              <div className="liquid-glass px-6 py-4 rounded-xl border border-primary/30 bg-primary/5 text-center w-full shadow-[0_0_30px_rgba(197,154,255,0.1)]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2 font-barlow">Smart Contract (FHE)</p>
                <code className="text-xs text-white/80 font-mono leading-relaxed text-left block">
                  FHE.and(salary ∈ range,<br />
                  &nbsp;&nbsp;exp &gt;= minExp,<br />
                  &nbsp;&nbsp;skills ⊇ required)<br />
                  → <span className="text-green-400">ebool(true) ✓</span>
                </code>
              </div>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent relative overflow-hidden">
                <motion.div animate={{ x: ['200%', '-100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 1 }}
                  className="absolute inset-0 bg-primary w-24 blur-sm" />
              </div>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
                className="flex items-center gap-2 text-green-400 font-bold font-headline italic text-lg">
                <CheckCircle size={18} className="animate-pulse" /> Match Confirmed
              </motion.div>
            </div>

            {/* Employer */}
            <motion.div
              initial={{ x: 60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="liquid-glass p-8 rounded-2xl w-full md:w-72 border border-white/10 relative overflow-hidden"
            >
              <motion.div animate={{ y: ['-100%', '300%'] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 1.5 }}
                className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent -z-10" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Briefcase className="text-indigo-400" size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Employer Side</p>
                  <p className="text-sm font-bold text-white text-glow">StealthAI Corp</p>
                </div>
              </div>
              <div className="space-y-3">
                {[['Salary Range', '$ •• – ••'], ['Min Experience', '• yrs'], ['Required Skills', '••••••••']].map(([k, v]) => (
                  <div key={k} className="bg-black/40 rounded-xl px-4 py-3 flex justify-between items-center border border-white/5">
                    <span className="text-xs text-white/80">{k}</span>
                    <div className="flex items-center gap-2">
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="text-indigo-400 font-mono text-xs font-bold">{v}</motion.span>
                      <Lock size={12} className="text-indigo-400/60" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 font-barlow">Escrow Locked</span>
                <span className="text-green-400 font-mono text-xs font-bold">0.5 ETH</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works — Step by Step */}
        <section className="max-w-7xl mx-auto px-6 mb-40">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary font-barlow">End-to-End Flow</span>
            <h2 className="text-4xl md:text-5xl font-instrument italic text-white mt-4 mb-4">4 Steps. Zero Leaks.</h2>
            <p className="text-on-surface-variant max-w-lg mx-auto">From encrypted profile creation to trustless payout — every step is provable on-chain.</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-12">
            {(['candidate', 'employer'] as const).map(j => (
              <button key={j} onClick={() => setActiveJourney(j)}
                className={`px-6 py-2 rounded-full font-bold font-barlow uppercase tracking-widest text-xs transition-all border ${activeJourney === j ? 'bg-primary text-black border-primary' : 'border-white/10 text-on-surface-variant hover:border-white/30'}`}>
                {j === 'candidate' ? '👤 Candidate Journey' : '🏢 Employer Journey'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WORKFLOW_STEPS.filter(s => activeJourney === 'candidate' ? ['candidate'].includes(s.role) || s.step === '03' : ['employer'].includes(s.role) || s.step === '04').map((step, i) => (
              <motion.div key={step.step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="liquid-glass p-8 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-6xl font-headline italic text-white/5 group-hover:text-white/10 transition-colors select-none">{step.step}</div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                    <step.icon className="text-primary" size={22} />
                  </div>
                  <h3 className="text-xl font-headline italic text-white">{step.title}</h3>
                </div>
                <p className="text-on-surface-variant mb-6 leading-relaxed text-sm">{step.desc}</p>
                <pre className="bg-black/60 rounded-xl p-4 border border-white/5 text-[10px] font-mono text-primary/80 leading-relaxed overflow-auto">{step.code}</pre>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feature Bento Grid */}
        <BentoGrid />

        {/* Comparison Table */}
        <section className="max-w-5xl mx-auto px-6 mb-40">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="liquid-glass rounded-3xl p-8 md:p-14 overflow-hidden relative border border-white/10">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary font-barlow">Why Switch?</span>
              <h3 className="text-4xl font-instrument italic text-white mt-4">The Privacy Gap</h3>
            </div>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div className="space-y-5 font-barlow text-on-surface-variant uppercase tracking-wider text-[10px] pt-16">
                {['Salary Exposure', 'Employer Intent', 'Matching Method', 'Payment Settlement', 'Trust Required', 'Auditability'].map(r => (
                  <div key={r} className="h-10 flex items-center font-bold">{r}</div>
                ))}
              </div>
              <div className="space-y-5 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="text-lg font-headline italic text-neutral-500 mb-2">Traditional</div>
                {['Public database', 'HR sees all', 'Manual screening', 'Bank transfer', 'Company/recruiter', 'None'].map(v => (
                  <div key={v} className="h-10 flex items-center text-neutral-600 text-xs">{v}</div>
                ))}
              </div>
              <div className="space-y-5 bg-primary/5 p-6 rounded-2xl border border-primary/20 relative">
                <div className="absolute -top-3 right-4 bg-primary text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full font-barlow">Recommended</div>
                <div className="text-lg font-headline italic text-primary mb-2">PrivyHire</div>
                {['FHE ciphertext', 'Hidden until match', 'Homomorphic math', 'Trustless escrow', 'Smart contract', 'Full on-chain'].map(v => (
                  <div key={v} className="h-10 flex items-center text-white text-xs font-bold gap-2">
                    <CheckCircle size={12} className="text-green-400 shrink-0" /> {v}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 mb-40">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary font-barlow">Got Questions?</span>
            <h3 className="text-4xl font-instrument italic text-white mt-4">Common Questions</h3>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="border border-white/5 rounded-2xl overflow-hidden bg-surface-container-low hover:border-primary/20 transition-all">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left gap-4">
                  <span className="font-headline italic text-lg text-white">{faq.q}</span>
                  <ChevronDown size={18} className={`text-primary shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.3 }}
                    className="px-6 pb-6">
                    <div className="border-l-2 border-primary/30 pl-4">
                      <p className="text-on-surface-variant leading-relaxed text-sm">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-5xl mx-auto px-6 mb-40 text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
            className="relative bg-gradient-to-br from-primary/10 via-[#0d0d0d] to-indigo-500/10 rounded-[40px] py-24 px-12 border border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent pointer-events-none" />
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[100px] rounded-full -z-10" />
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary font-barlow">Ready to Build?</span>
              <h2 className="text-5xl md:text-7xl font-instrument italic text-white mt-4 mb-6 leading-tight">Shape the Future<br />of Confidential Work</h2>
              <p className="text-on-surface-variant max-w-lg mx-auto mb-10 leading-relaxed">Join the movement toward privacy-preserving recruitment. Your data belongs to you — and FHE proves it mathematically.</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link to="/dashboard" className="px-12 py-5 bg-primary text-black font-bold font-barlow uppercase tracking-widest text-sm rounded-full hover:shadow-[0_0_50px_rgba(197,154,255,0.5)] hover:scale-105 transition-all">
                  Launch as Candidate
                </Link>
                <Link to="/employer" className="px-12 py-5 liquid-glass border border-white/10 text-white font-bold font-barlow uppercase tracking-widest text-sm rounded-full hover:border-primary/40 hover:scale-105 transition-all">
                  Launch as Employer
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="w-full py-16 px-8 border-t border-neutral-800/50 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h2 className="text-2xl font-instrument italic text-white mb-3">PrivyHire</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">Privacy-preserving recruitment powered by Fhenix CoFHE and Ethereum Sepolia.</p>
          </div>
          {[
            { title: 'Platform', links: ['Find Jobs', 'Hire Talent', 'How It Works', 'For Candidates', 'For Companies'] },
            { title: 'Technology', links: ['Fhenix CoFHE', 'Smart Contracts', 'FHE Matching', 'Escrow Protocol'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security'] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary font-barlow mb-4">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(l => <li key={l}><a href="#" className="text-neutral-500 hover:text-white transition-colors text-sm">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-neutral-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-600 text-xs font-barlow uppercase tracking-widest">© 2024 PrivyHire · Privacy is not a feature. It's the foundation.</p>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-400/60 font-barlow">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live on Arbitrum Sepolia Testnet
          </div>
        </div>
      </footer>
    </div>
  );
}
