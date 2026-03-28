import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/wagmi';
import { LandingPage } from './pages/LandingPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { MatchesPage } from './pages/MatchesPage';
import { OffersPage } from './pages/OffersPage';
import { SettingsPage } from './pages/SettingsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { EmployerSettingsPage } from './pages/EmployerSettingsPage';
import { EmployerEscrowsPage } from './pages/EmployerEscrowsPage';
import { EmployerATSPage } from './pages/EmployerATSPage';
import { EmployerReviewsPage } from './pages/EmployerReviewsPage';

import { PageTransition } from './components/PageTransition';
import { AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { WavyBackground } from './components/WavyBackground';

import { Layout } from './components/Layout';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <Layout>
      <AnimatePresence>
        {/* @ts-ignore - react-router-dom v6 supports key here for AnimatePresence */}
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/how-it-works" element={<PageTransition><HowItWorksPage /></PageTransition>} />
          <Route path="/candidates" element={<PageTransition><CandidatesPage /></PageTransition>} />
          <Route path="/companies" element={<PageTransition><CompaniesPage /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><CandidateDashboard /></PageTransition>} />
          <Route path="/employer" element={<PageTransition><EmployerDashboard /></PageTransition>} />
          <Route path="/employer-escrows" element={<PageTransition><EmployerEscrowsPage /></PageTransition>} />
          <Route path="/employer-ats" element={<PageTransition><EmployerATSPage /></PageTransition>} />
          <Route path="/employer-reviews" element={<PageTransition><EmployerReviewsPage /></PageTransition>} />
          <Route path="/employer-settings" element={<PageTransition><EmployerSettingsPage /></PageTransition>} />
          <Route path="/matches" element={<PageTransition><MatchesPage /></PageTransition>} />
          <Route path="/offers" element={<PageTransition><OffersPage /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

import { ToastProvider } from './components/Toast';

const queryClient = new QueryClient();

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Router>
            <AnimatedRoutes />
          </Router>
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
