import React from 'react';
import { motion } from 'motion/react';
import { Shield, Key, Database, Cpu, Lock, CheckCircle, Network, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { BackgroundPaths } from '../components/BackgroundPaths';
import { WavyBackground } from '../components/WavyBackground';


export function HowItWorksPage() {
  const steps = [
    {
      icon: Key,
      title: "1. Client-Side Encryption",
      desc: "Your salary data (e.g., $120,000) is encrypted mathematically on your device using the Fhenix CoFHE SDK before it even touches the network.",
      visual: (
        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
          <span className="font-mono text-white">$120,000</span>
          <ArrowRight className="text-primary/50" />
          <motion.span 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="font-mono text-primary text-xs break-all"
          >
            0x4f8a...b92c (Encrypted)
          </motion.span>
        </div>
      )
    },
    {
      icon: Database,
      title: "2. Zero-Knowledge Submission",
      desc: "The encrypted ciphertext is stored on the Arbitrum Sepolia blockchain. The smart contract acts as an escrow for your intent, without knowing the actual value.",
      visual: (
        <div className="relative h-20 bg-surface-container-highest rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
          <Database className="text-neutral-500 absolute opacity-20" size={64} />
          <div className="flex gap-2 relative z-10">
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                className="w-12 h-12 bg-primary/20 rounded border border-primary/30 flex items-center justify-center"
              >
                <Lock size={16} className="text-primary" />
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      icon: Cpu,
      title: "3. FHE Homomorphic Evaluation",
      desc: "When an employer submits a budget range, the Fhenix network performs 'greater-than' and 'less-than' operations directly on the ciphertexts.",
      visual: (
        <div className="flex flex-col gap-2 font-mono text-xs bg-black/40 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between text-neutral-400">
            <span>FHE.gte(offerMax, target)</span>
            <span className="text-primary">TRUE</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>FHE.lte(offerMin, target)</span>
            <span className="text-primary">TRUE</span>
          </div>
          <div className="h-px bg-white/10 w-full my-1"></div>
          <div className="flex justify-between text-white font-bold">
            <span>MATCH_RESULT</span>
            <span className="text-green-400">SUCCESS</span>
          </div>
        </div>
      )
    },
    {
      icon: Shield,
      title: "4. Selective Reveal via Permits",
      desc: "Only if the cryptographic math results in a 'TRUE' match condition, both parties are notified. You then have the option to grant a CoFHE permit to reveal your identity.",
      visual: (
        <div className="flex items-center justify-center h-20 bg-primary/10 rounded-xl border border-primary/30">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
            className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase"
          >
            <CheckCircle /> Match Complete
          </motion.div>
        </div>
      )
    },
    {
      icon: Network,
      title: "5. Confidential Payments & Escrow",
      desc: "Proceed with hiring using encrypted smart contracts. Employers can fund positions securely, and payments (like signing bonuses) are executed on-chain without exposing the transaction amounts to the public ledger.",
      visual: (
        <div className="flex flex-col gap-3 p-4 bg-black/40 rounded-xl border border-white/5">
          <div className="flex justify-between items-center text-xs text-on-surface-variant font-mono border-b border-white/5 pb-2">
            <span>Escrow Contract</span>
            <Lock size={12} className="text-primary" />
          </div>
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs">Emp</div>
            <div className="flex-1 h-px bg-white/10 relative mx-4">
              <motion.div 
                animate={{ x: ['0%', '100%'], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1/2 -translate-y-1/2 w-4 h-1 bg-primary rounded-full shadow-[0_0_8px_#c59aff]"
              />
            </div>
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-xs border border-primary/30">Dev</div>
          </div>
          <div className="text-[10px] text-center text-primary font-mono uppercase tracking-widest mt-1">Encrypted Payment Settled</div>
        </div>
      )
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col">
        <Navbar />
        <BackgroundPaths />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <header className="mb-24 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-barlow uppercase tracking-widest text-primary mb-6"
          >
            <Network size={14} /> The Cryptography
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-instrument italic text-white mb-6"
          >
            Mathematical Privacy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed"
          >
            PrivyHire is built on Fully Homomorphic Encryption (FHE). It allows smart contracts to perform computations on encrypted data without ever decrypting it.
          </motion.p>
        </header>

        <div className="space-y-12 max-w-4xl mx-auto">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="liquid-glass p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <step.icon size={200} />
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <step.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="text-2xl font-instrument italic text-white mb-4">{step.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed mb-6 md:mb-0">
                    {step.desc}
                  </p>
                </div>
                <div className="w-full">
                  {step.visual}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="w-full py-12 px-8 border-t border-neutral-800/50 bg-black mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-lg font-instrument italic text-white/80">PrivyHire</div>
          <p className="font-barlow text-sm text-neutral-500">
            © 2024 PrivyHire. Privacy is not a feature. It’s the foundation.
          </p>
        </div>
      </footer>
    </div>
  );
}
