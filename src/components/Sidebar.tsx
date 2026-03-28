import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Handshake, FileText, Settings, Fingerprint, 
  LogOut, HelpCircle, Brain, Terminal, ShieldCheck, Star 
} from 'lucide-react';
import { useDisconnect, useAccount } from 'wagmi';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface SidebarProps {
  userType: 'candidate' | 'employer';
}

export function Sidebar({ userType }: SidebarProps) {
  const location = useLocation();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  const truncateAddress = (addr: string) => 
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  const handleLogout = () => {
    disconnect();
    window.location.href = '/';
  };

  const Briefcase = LayoutDashboard;

  const navItems = userType === 'candidate' ? [
    { name: 'Terminal', icon: Terminal, path: '/dashboard' },
    { name: 'Matches', icon: Handshake, path: '/matches' },
    { name: 'Offers', icon: FileText, path: '/offers' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ] : [
    { name: 'Command', icon: LayoutDashboard, path: '/employer' },
    { name: 'Jobs', icon: Briefcase, path: '/employer-escrows' },
    { name: 'Parser', icon: Brain, path: '/employer-ats' },
    { name: 'Reviews', icon: Star, path: '/employer-reviews' },
    { name: 'Settings', icon: Settings, path: '/employer-settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col p-4 bg-black/60 backdrop-blur-3xl w-64 z-40 hidden md:flex border-r border-white/5">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>

      <div className="mb-10 px-4 pt-8">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="text-primary" size={20} />
          <h1 className="text-xl font-bold tracking-tighter text-white uppercase font-mono">Privy//<span className="text-primary">Hire</span></h1>
        </div>
        <p className="font-mono uppercase tracking-[0.3em] text-[8px] text-neutral-500">Secure Identity Layer v2.0</p>
      </div>

      <nav className="flex-1 space-y-1 relative">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-mono uppercase tracking-[0.2em] text-[10px] font-bold",
                isActive 
                  ? "text-primary bg-primary/5" 
                  : "text-neutral-500 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={16} className={cn("transition-colors", isActive ? "text-primary" : "group-hover:text-white")} />
              <span>{item.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#c59aff]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        {/* Wallet Status Card */}
        <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 group-hover:opacity-10 transition-opacity">
            <Fingerprint size={48} />
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
              isConnected ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400" : "bg-white/5 border-white/10 text-neutral-500"
            )}>
              <Fingerprint size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold truncate font-mono text-white">
                {isConnected && address ? truncateAddress(address) : 'UNAUTHORIZED'}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={cn("w-1 h-1 rounded-full", isConnected ? "bg-emerald-400 animate-pulse" : "bg-neutral-600")} />
                <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
                  {isConnected ? 'NODE_ACTIVE' : 'OFFLINE'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-neutral-500 hover:text-white transition-all hover:bg-white/5">
            <HelpCircle size={14} />
          </button>
          <button 
            onClick={handleLogout}
            className="flex-[3] flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-neutral-500 hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20 transition-all text-[9px] font-mono font-bold uppercase tracking-widest"
          >
            <LogOut size={14} />
            <span>Terminate</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
