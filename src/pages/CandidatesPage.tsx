import React from 'react';
import { motion } from 'motion/react';
import { Shield, EyeOff, Zap, CheckCircle, Fingerprint, Lock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { BackgroundPaths } from '../components/BackgroundPaths';
import { WavyBackground } from '../components/WavyBackground';
import { Link } from 'react-router-dom';

export function CandidatesPage() {
  const benefits = [
    {
      icon: Shield,
      title: "Zero-Knowledge Applying",
      desc: "Stop submitting your current salary to black boxes. Your expected salary is encrypted locally on your device before submission."
    },
    {
      icon: EyeOff,
      title: "Hidden Intent",
      desc: "Employers cannot see your data until their verified budget mathematically matches your encrypted requirement."
    },
    {
      icon: Zap,
      title: "Instant Market Checks",
      desc: "Instantly know if a role meets your compensation requirements without a preliminary screening call."
    },
    {
      icon: Lock,
      title: "Confidential Compensation",
      desc: "Receive signing bonuses and milestone payments securely. Your exact compensation package is settled on-chain but hidden from public block explorers."
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col">
        <Navbar />
        <BackgroundPaths />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
          <div className="flex-1 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-barlow uppercase tracking-widest text-primary mb-6"
            >
              <Fingerprint size={14} /> For Candidates
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-instrument italic text-white mb-6 leading-tight"
            >
              Take Back Control <br className="hidden lg:block"/> of Your Worth.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-on-surface-variant text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Negotiate from a position of power. PrivyHire ensures you never waste time on interviews for roles that don't meet your financial requirements.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/dashboard" className="inline-block bg-primary text-black px-10 py-4 rounded-full font-barlow uppercase tracking-widest text-sm font-bold border border-primary/30 hover:scale-105 transition-all shadow-xl hover:shadow-primary/20">
                Secure Your Profile
              </Link>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full max-w-md relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full -z-10 animate-pulse"></div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="liquid-glass p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-primary/30 transition-colors"
            >
              <motion.div 
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-primary/10 to-transparent -z-10"
              />
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                <div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest mb-1 font-barlow">Senior Engineer</div>
                  <div className="text-white font-bold text-xl">Acme Corp</div>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
                  94% Match
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest mb-2 font-barlow flex justify-between">
                    <span>Your Target</span>
                    <Lock size={12} className="text-primary" />
                  </div>
                  <div className="h-10 bg-black/50 rounded flex items-center px-4 font-mono text-primary text-sm tracking-widest">
                    ••••••••••••
                  </div>
                </div>
                <div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest mb-2 font-barlow">Status</div>
                  <div className="flex items-center gap-3 text-white font-bold">
                    <CheckCircle className="text-green-400" size={20} />
                    Cryptographic Match Confirmed
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="surface-container-low p-8 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group shadow-xl hover:shadow-primary/5 cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors group-hover:scale-110">
                <benefit.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-instrument italic text-white mb-3 group-hover:text-primary transition-colors">{benefit.title}</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                {benefit.desc}
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
            <Shield size={400} />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-barlow uppercase tracking-widest text-red-400 mb-6"
              >
                The Broken Status Quo
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-instrument italic text-white mb-6">Traditional Hiring Strips Your Leverage.</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
                Every time you submit a "desired salary" form in Web2, you immediately anchor negotiations and sacrifice your bargaining power before even speaking to the team. PrivyHire flips the script entirely.
              </p>
              <ul className="space-y-4">
                {[
                  "No more mandatory 'salary expectation' forms.",
                  "Eliminate arbitrary low-ball technical offers.",
                  "Stop wasting hours on screening calls going nowhere.",
                  "Mathematical proof of budget alignment."
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="flex items-center gap-4 text-white/90"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 flex-shrink-0">
                      <CheckCircle className="text-primary w-3 h-3" />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4 relative">
              <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full -z-10 animate-pulse"></div>
              <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex justify-between items-center opacity-50 grayscale">
                <div className="space-y-1">
                  <div className="text-xs text-red-300/50 uppercase font-barlow tracking-widest">Web2 ATS Form</div>
                  <div className="text-white line-through">Desired Salary: $120,000</div>
                </div>
                <EyeOff className="text-red-400/50" />
              </div>
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="p-6 liquid-glass border border-primary/30 rounded-2xl flex justify-between items-center relative shadow-[0_0_30px_rgba(197,154,255,0.15)]"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl"></div>
                <div className="space-y-1 ml-2">
                  <div className="text-[10px] text-primary uppercase font-barlow tracking-widest flex items-center gap-2">
                    PrivyHire Encrypted Payload <Lock size={10} />
                  </div>
                  <div className="font-mono text-sm text-white/90">0x<span className="text-primary">8f4c...9b22</span></div>
                </div>
                <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                  <Shield className="text-primary w-5 h-5" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="w-full py-12 px-8 border-t border-neutral-800/50 bg-black">
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
