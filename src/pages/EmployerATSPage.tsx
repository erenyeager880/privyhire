import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '@/src/components/Sidebar';
import { Brain, UploadCloud, FileText, CheckCircle, Lock, Cpu, ArrowRight, Sparkles, Code2, ChevronRight, Shield, Zap, X, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

const PARSE_STEPS = [
  { label: 'Uploading Document', icon: UploadCloud },
  { label: 'Invoking Google Gemini', icon: Brain },
  { label: 'Extracting Structured Data', icon: Cpu },
  { label: 'Building FHE Payload', icon: Lock },
];

const EXTRACTED_SKILLS = ['React', 'Solidity', 'Node.js', 'Cryptography', 'AWS'];
const ALL_SKILLS = ['React', 'Solidity', 'Node.js', 'Cryptography', 'AWS', 'Python', 'Go', 'Rust'];

export function EmployerATSPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedFile, setParsedFile] = useState<string | null>(null);
  const [parseStep, setParseStep] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(EXTRACTED_SKILLS);
  const [salary, setSalary] = useState('160000');
  const [experience, setExperience] = useState('8');
  const fileRef = useRef<HTMLInputElement>(null);

  const simulateParse = (filename: string) => {
    setParsedFile(filename);
    setParseStep(0);
    
    PARSE_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setParseStep(i);
        if (i === PARSE_STEPS.length - 1) {
          setTimeout(() => setIsComplete(true), 900);
        }
      }, i * 900);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateParse(file.name);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateParse(file.name);
  };

  const reset = () => {
    setParsedFile(null);
    setParseStep(-1);
    setIsComplete(false);
    setSelectedSkills(EXTRACTED_SKILLS);
    setSalary('160000');
    setExperience('8');
  };

  const toggleSkill = (s: string) => setSelectedSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30">
      <Sidebar userType="employer" />

      <main className="md:ml-72 pt-24 pb-20 px-6 max-w-6xl mx-auto">
        <header className="mb-12 relative">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-10 bg-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary font-barlow">AI-Powered</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-headline italic text-white mb-3 flex items-center gap-4">
                Resume Parser
                <Sparkles className="text-primary" size={32} />
              </h2>
              <p className="text-on-surface-variant text-lg max-w-xl font-light">
                Upload any CV. Google Gemini extracts skills, salary expectations, and experience. The result is FHE-encrypted and ready to push to the smart contract.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest font-barlow shrink-0">
              <Brain size={14} /> Google Gemini
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* Upload State */}
          {!parsedFile && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "cursor-pointer border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center gap-6 transition-all duration-300 group",
                  isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-white/10 bg-surface-container-low hover:border-primary/40 hover:bg-black/20"
                )}
              >
                <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileSelect} />
                <motion.div animate={isDragging ? { scale: 1.2, rotate: 5 } : {}} transition={{ duration: 0.3 }}
                  className={cn("w-24 h-24 rounded-3xl flex items-center justify-center transition-all", isDragging ? "bg-primary/20 border-primary" : "bg-white/5 border-white/10 group-hover:bg-primary/10 group-hover:border-primary/30", "border")}>
                  <UploadCloud size={40} className={isDragging ? "text-primary" : "text-white/40 group-hover:text-primary/60"} />
                </motion.div>
                <div className="text-center">
                  <h3 className="text-2xl font-headline italic text-white mb-2">{isDragging ? 'Drop to Parse' : 'Drop Resume Here'}</h3>
                  <p className="text-on-surface-variant text-sm mb-6 max-w-sm leading-relaxed">
                    PDF or DOCX. Gemini will extract skills, experience, and salary expectations — then encrypt them for the FHE smart contract.
                  </p>
                  <span className="px-8 py-3 bg-primary text-black font-bold font-barlow uppercase tracking-widest text-xs rounded-full pointer-events-none">
                    Select File
                  </span>
                </div>
              </div>

              {/* How it works mini-explainer */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Brain, title: 'AI Extraction', desc: 'Gemini reads skills, salary range, and years of exp from any format.' },
                  { icon: Lock, title: 'FHE Encryption', desc: 'Extracted data is immediately wrapped with CoFHE before any network call.' },
                  { icon: Zap, title: 'Smart Contract Push', desc: 'Encrypted payload is ready to createJobWithEscrow in one click.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-surface-container-low border border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 mt-0.5">
                      <item.icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Parsing State */}
          {parsedFile && !isComplete && (
            <motion.div key="parsing" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="liquid-glass p-12 md:p-16 rounded-3xl border border-white/5 flex flex-col items-center">
              <div className="relative mb-10">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Brain size={48} className="text-primary animate-pulse" />
                </div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-4 border-primary border-t-transparent rounded-2xl" />
              </div>
              <h3 className="text-3xl font-headline italic text-white mb-2 text-center">Analyzing {parsedFile}</h3>
              <p className="text-on-surface-variant text-sm mb-12 text-center">Google Gemini is reading the document and structuring the output...</p>

              <div className="w-full max-w-md space-y-3">
                {PARSE_STEPS.map((step, i) => (
                  <div key={i} className={cn(
                    "flex items-center gap-4 px-5 py-3 rounded-xl border transition-all duration-500",
                    i < parseStep ? "border-green-400/20 bg-green-400/5" :
                    i === parseStep ? "border-primary/30 bg-primary/5" : "border-white/5 opacity-30"
                  )}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      i < parseStep ? "bg-green-400/20" : i === parseStep ? "bg-primary/20" : "bg-white/5")}>
                      {i < parseStep ? <CheckCircle size={16} className="text-green-400" /> : <step.icon size={16} className={i === parseStep ? "text-primary animate-pulse" : "text-on-surface-variant"} />}
                    </div>
                    <span className={cn("text-sm font-medium", i < parseStep ? "text-green-400" : i === parseStep ? "text-white" : "text-on-surface-variant")}>
                      {step.label}
                    </span>
                    {i === parseStep && (
                      <div className="ml-auto flex gap-1">
                        {[0, 1, 2].map(d => (
                          <motion.div key={d} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-primary" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Result State */}
          {isComplete && (
            <motion.div key="complete" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 bg-green-400/10 border border-green-400/20 px-5 py-3 rounded-xl">
                  <CheckCircle size={18} className="text-green-400" />
                  <span className="text-green-400 font-bold text-sm">Parsed Successfully — {parsedFile}</span>
                </div>
                <button onClick={reset} className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors text-xs font-bold uppercase tracking-widest font-barlow">
                  <RefreshCw size={14} /> New File
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left — Extracted Data */}
                <div className="liquid-glass p-8 rounded-2xl border border-white/5 space-y-6">
                  <h3 className="font-barlow uppercase tracking-widest text-xs text-primary font-bold flex items-center gap-2">
                    <FileText size={14} /> Extracted Profile
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 font-barlow">Target Salary (Identified)</label>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-amber-400/10 border border-amber-400/20 text-amber-400 px-2 py-1 rounded font-bold uppercase font-barlow">Raw</span>
                        <span className="font-mono text-white line-through opacity-50">${Number(salary).toLocaleString()}</span>
                        <ArrowRight size={14} className="text-primary/50 shrink-0" />
                        <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-3 py-1 rounded">
                          <Lock size={10} className="text-primary" />
                          <span className="text-primary font-mono text-xs font-bold">FHE Wrapped</span>
                        </div>
                      </div>
                      <input value={salary} onChange={e => setSalary(e.target.value)} type="number"
                        className="mt-2 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-primary/50 text-sm" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 font-barlow">Experience (Identified)</label>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] bg-amber-400/10 border border-amber-400/20 text-amber-400 px-2 py-1 rounded font-bold uppercase font-barlow">Raw</span>
                        <span className="font-mono text-white">{experience} Years</span>
                        <ArrowRight size={14} className="text-primary/50 shrink-0" />
                        <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-3 py-1 rounded">
                          <Lock size={10} className="text-primary" />
                          <span className="text-primary font-mono text-xs font-bold">FHE Wrapped</span>
                        </div>
                      </div>
                      <input value={experience} onChange={e => setExperience(e.target.value)} type="number"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-primary/50 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Right — Skills & Actions */}
                <div className="space-y-6">
                  <div className="liquid-glass p-8 rounded-2xl border border-white/5">
                    <h3 className="font-barlow uppercase tracking-widest text-xs text-primary font-bold flex items-center gap-2 mb-5">
                      <Code2 size={14} /> Detected Skills — Toggle to Include
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {ALL_SKILLS.map(skill => (
                        <button key={skill} onClick={() => toggleSkill(skill)}
                          className={cn(
                            "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border font-barlow",
                            selectedSkills.includes(skill)
                              ? "bg-primary text-black border-primary shadow-[0_0_10px_rgba(197,154,255,0.3)]"
                              : "bg-surface-container border-white/10 text-on-surface-variant hover:border-white/30"
                          )}>
                          {skill}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-barlow uppercase tracking-widest">
                      {selectedSkills.length} skills selected → Bitmask: <span className="text-primary font-mono">0x{selectedSkills.reduce((acc, s, i) => acc | (1 << ALL_SKILLS.indexOf(s)), 0).toString(16).toUpperCase().padStart(4, '0')}</span>
                    </p>
                  </div>

                  {/* FHE Payload preview */}
                  <div className="liquid-glass p-6 rounded-2xl border border-primary/10 bg-primary/2">
                    <h3 className="font-barlow uppercase tracking-widest text-xs text-primary font-bold flex items-center gap-2 mb-4">
                      <Lock size={14} /> FHE Encryption Preview
                    </h3>
                    <pre className="text-[10px] font-mono text-primary/70 leading-relaxed bg-black/40 rounded-xl p-4 border border-white/5 overflow-auto">
{`encryptInputs([
  Encryptable.uint32(${salary}),  // salary
  Encryptable.uint32(${experience}),           // exp
  Encryptable.uint32(0x${selectedSkills.reduce((acc, s) => acc | (1 << ALL_SKILLS.indexOf(s)), 0).toString(16).toUpperCase()})  // skills
]).execute()`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/employer"
                  className="flex-1 flex items-center justify-center gap-3 py-5 bg-primary text-black font-bold font-barlow uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_30px_rgba(197,154,255,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all">
                  <Zap size={16} /> Send to Post Job Pipeline
                  <ChevronRight size={16} />
                </Link>
                <button onClick={reset}
                  className="flex items-center justify-center gap-2 px-8 py-5 border border-white/10 text-white font-bold font-barlow uppercase tracking-widest text-xs rounded-xl hover:bg-white/5 transition-all">
                  <RefreshCw size={14} /> Parse Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
