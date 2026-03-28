import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { LogOut } from 'lucide-react';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function Navbar() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const queryClient = useQueryClient();
  const location = useLocation();

  // Automatically switch to Arbitrum Sepolia if connected to wrong network
  useEffect(() => {
    if (isConnected && chain && chain.id !== arbitrumSepolia.id) {
      console.log(`Wrong network detected (ID: ${chain.id}). Switching to Arbitrum Sepolia...`);
      switchChain({ chainId: arbitrumSepolia.id });
    }
  }, [isConnected, chain, switchChain]);

  const handleConnect = () => {
    try {
      console.log("Connect attempt with:", connectors[0]);
      connect({ connector: connectors[0] });
    } catch (err) {
      console.error("Connect error:", err);
    }
  };

  const handleDisconnect = () => {
    try {
      console.log("Disconnecting and clearing state...");
      
      // 1. Clear Wagmi state
      disconnect();
      
      // 2. Clear TanStack Query cache
      queryClient.clear();
      
      // 3. Clear local storage items that wagmi might be persisting
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('wagmi.account');
      localStorage.removeItem('wagmi.connected');
      
      // 4. Force a hard redirect to ensure all state is reset if we're in a protected area
      if (window.location.pathname.includes('/dashboard') || window.location.pathname.includes('/employer')) {
        window.location.href = '/';
      } else {
        // Just reload for non-dashboard pages to refresh UI state
        window.location.reload();
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  const navLinks = [
    { name: 'Product', path: '/' },
    { name: 'How it Works', path: '/how-it-works' },
    { name: 'For Candidates', path: '/candidates' },
    { name: 'For Companies', path: '/companies' }
  ];

  if (connectError) {
    console.error("Wagmi connect error:", connectError);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-3 bg-neutral-900/70 backdrop-blur-xl rounded-full mt-4 mx-auto max-w-7xl border border-white/5 shadow-2xl">
      <Link to="/" className="text-2xl font-instrument italic text-white">PrivyHire</Link>
      <div className="hidden md:flex gap-8 items-center">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path || (link.path === '/' && location.pathname === '/');
          return (
            <Link 
              key={link.name}
              to={link.path} 
              className={`font-instrument italic tracking-tight hover:text-violet-300 transition-colors ${
                isActive ? 'text-white font-bold border-b border-violet-500' : 'text-neutral-400'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
      {!isConnected ? (
        <button 
          onClick={handleConnect}
          className="bg-gradient-to-r from-primary to-primary-dim text-black px-6 py-2 rounded-full font-barlow uppercase tracking-widest text-xs font-bold hover:scale-105 transition-transform"
        >
          {connectError ? 'Try Again' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="flex gap-4 items-center">
          <Link to="/dashboard" className="text-xs font-barlow uppercase tracking-widest font-bold text-primary hover:text-primary-dim transition-colors">
            Go to Dashboard
          </Link>
          <button 
            onClick={handleDisconnect}
            className="group relative bg-white/5 border border-white/10 text-white px-5 py-2 rounded-full font-barlow uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all overflow-hidden min-w-[120px]"
          >
            <span className="group-hover:opacity-0 transition-opacity duration-200 block">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-primary font-bold gap-2">
              <LogOut size={12} />
              Disconnect
            </span>
          </button>
        </div>
      )}
    </nav>
  );
}
