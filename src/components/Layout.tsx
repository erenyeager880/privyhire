import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { WavyBackground } from './WavyBackground';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const path = location.pathname;

  // Define paths that should NOT have a sidebar (landing, guest pages)
  const noSidebarPaths = ['/', '/how-it-works', '/candidates', '/companies'];
  const showSidebar = !noSidebarPaths.includes(path);

  // Determine userType based on path
  const isEmployerPath = path.startsWith('/employer');
  const userType = isEmployerPath ? 'employer' : 'candidate';

  return (
    <div className="relative min-h-screen bg-black overflow-hidden text-on-surface font-body selection:bg-primary/30">
      {/* Static Background Elements */}
      <div className="fixed inset-0 z-0">
        <WavyBackground imageUrl="/bg_2.png" />
      </div>
      <div className="fixed inset-0 bg-black/20 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-0" />
      
      {/* Static Sidebar */}
      {showSidebar && <Sidebar userType={userType} />}

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
