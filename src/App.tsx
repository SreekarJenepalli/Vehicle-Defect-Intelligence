import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import VINLookupPage from './pages/VINLookupPage';
import VehicleSearchPage from './pages/VehicleSearchPage';
import ComplaintsPage from './pages/ComplaintsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AboutPage from './pages/AboutPage';

export type Page = 'home' | 'vin' | 'search' | 'complaints' | 'analytics' | 'about';

export interface ActiveVehicle {
  vin: string;
  make: string;
  model: string;
  year: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function App() {
  const [page, setPage] = useState<Page>('vin');
  const [activeVehicle, setActiveVehicle] = useState<ActiveVehicle | null>(null);

  const handleVehicleSet = (v: ActiveVehicle) => setActiveVehicle(v);
  const handleClearVehicle = () => setActiveVehicle(null);

  const renderPage = () => {
    switch (page) {
      case 'home':       return <HomePage onNavigate={setPage} activeVehicle={activeVehicle} />;
      case 'vin':        return <VINLookupPage activeVehicle={activeVehicle} onVehicleSet={handleVehicleSet} onNavigate={setPage} />;
      case 'search':     return <VehicleSearchPage activeVehicle={activeVehicle} onNavigate={setPage} />;
      case 'complaints': return <ComplaintsPage activeVehicle={activeVehicle} onNavigate={setPage} />;
      case 'analytics':  return <AnalyticsPage activeVehicle={activeVehicle} onNavigate={setPage} />;
      case 'about':      return <AboutPage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <Header
        activePage={page}
        onNavigate={setPage}
        activeVehicle={activeVehicle}
        onClearVehicle={handleClearVehicle}
      />

      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ minHeight: 'calc(100vh - 100px)' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
