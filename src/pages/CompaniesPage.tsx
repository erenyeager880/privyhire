import React from 'react';
import { motion } from 'motion/react';
import { Building2, Search, Handshake, Brain, Lock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { BackgroundPaths } from '../components/BackgroundPaths';
import { WavyBackground } from '../components/WavyBackground';
import { Link } from 'react-router-dom';

export function CompaniesPage() {
  const features = [
    {
      icon: Search,
      title: "Pre-qualified Pipeline",
      desc: "Stop reviewing candidates whose salary expectations don't align with your budget. See only mutual matches."
    },
    {
      icon: Brain,
      title: "AI-Driven Extraction",
      desc: "Our GenAI agents parse incoming resumes and automatically structure data, ensuring you only see the best technical fits."
    },
    {
      icon: Handshake,
      title: "Automated Escrow",
      desc: "Deploy smart contracts that release bounties or signing bonuses automatically upon hitting milestones."
    },
    {
      icon: Lock,
      title: "Confidential Payroll",
      desc: "Execute payroll and bonus distributions through our zero-knowledge protocol. Compensate top talent competitively without causing internal friction or exposing salary bands."
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col">
        <Navbar />
        <BackgroundPaths />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 mb-32">
          <div className="flex-1 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-barlow uppercase tracking-widest text-primary mb-6"
            >
              <Building2 size={14} /> For Employers
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-instrument italic text-white mb-6 leading-tight"
            >
              Hire Elite Talent, <br className="hidden lg:block"/> Without the Noise.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-on-surface-variant text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              PrivyHire eliminates the 'salary dance'. Post encrypted budgets and let our cryptographic engine instantly filter out incompatible candidates.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/employer" className="inline-block bg-white text-black px-10 py-4 rounded-full font-barlow uppercase tracking-widest text-sm font-bold border border-white/30 hover:scale-105 transition-all shadow-xl hover:shadow-white/20">
                Post an Encrypted Role
              </Link>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full max-w-md relative"
          >
            <div className="absolute inset-0 bg-white/10 blur-[100px] rounded-full -z-10 animate-pulse"></div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="liquid-glass p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-white/30 transition-colors"
            >
              <motion.div 
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-white/5 to-transparent -z-10"
              />
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                <div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest mb-1 font-barlow">Role Budget</div>
                  <div className="text-white font-bold text-xl">Lead Developer</div>
                </div>
                <div className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20 flex gap-2 items-center">
                  <Lock size={12} /> Confidential
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-barlow">Candidate Hash</div>
                    <div className="text-primary font-mono text-xs">0x7a2...b91</div>
                  </div>
                  <div className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded">MATCH</div>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center opacity-50">
                  <div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-barlow">Candidate Hash</div>
                    <div className="text-primary font-mono text-xs">0x1f9...e32</div>
                  </div>
                  <div className="text-red-400 text-xs font-bold bg-red-400/10 px-2 py-1 rounded">NO MATCH</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="surface-container-low p-8 rounded-2xl border border-white/5 hover:border-white/20 transition-all group shadow-xl hover:shadow-white/5 cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors group-hover:scale-110">
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-instrument italic text-white mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-32 p-8 md:p-16 rounded-3xl liquid-glass border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-1/2 -translate-y-1/2 right-0 p-8 opacity-5">
            <Building2 size={400} />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 space-y-4 relative">
              <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-full -z-10 animate-pulse"></div>
              
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white font-mono text-xs">C1</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full bg-white/10 rounded overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="h-full bg-red-400"
                    />
                  </div>
                </div>
                <span className="text-xs text-red-400 font-bold w-16 text-right font-mono">REJECT</span>
              </div>

              <motion.div 
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="p-4 bg-white/10 border border-primary/30 rounded-2xl flex items-center gap-4 relative shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl"></div>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <span className="text-primary font-mono text-xs">C2</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full bg-white/10 rounded overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "94%" }}
                      transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
                <span className="text-xs text-primary font-bold w-16 text-right font-mono">ACCEPT</span>
              </motion.div>
              
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white font-mono text-xs">C3</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full bg-white/10 rounded overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 2, delay: 0.2, ease: "easeOut" }}
                      className="h-full bg-red-400"
                    />
                  </div>
                </div>
                <span className="text-xs text-red-400 font-bold w-16 text-right font-mono">REJECT</span>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-barlow uppercase tracking-widest text-white mb-6"
              >
                The New Hiring Meta
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-instrument italic text-white mb-6">Screen Less. Hire Better.</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
                Why burn engineering bandwidth interviewing candidates whose compensation floor exceeds your absolute ceiling? The math happens before the introduction.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl text-primary font-instrument italic mb-2">90%</div>
                  <div className="text-sm text-on-surface-variant">Reduction in wasted technical recruiter screens.</div>
                </div>
                <div>
                  <div className="text-3xl text-primary font-instrument italic mb-2">100%</div>
                  <div className="text-sm text-on-surface-variant">Confidentiality regarding your internal payroll bands.</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="w-full py-12 px-8 border-t border-neutral-800/50 bg-black mt-24">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-lg font-instrument italic text-white/80">PrivyHire</div>
          <p className="font-barlow text-sm text-neutral-500">
            © 2024 PrivyHire. Privacy is not a feature.
          </p>
        </div>
      </footer>
    </div>
  );
}
