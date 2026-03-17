import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Search, FileSearch, Home, BookOpen, X, ShieldAlert } from 'lucide-react';
import type { Page, ActiveVehicle } from '../App';
import BrandLogo from './BrandLogo';

interface HeaderProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  activeVehicle: ActiveVehicle | null;
  onClearVehicle: () => void;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'home',       label: 'Overview',    icon: <Home size={15} /> },
  { id: 'vin',        label: 'VIN Lookup',  icon: <Search size={15} /> },
  { id: 'search',     label: 'Recalls',     icon: <FileSearch size={15} /> },
  { id: 'complaints', label: 'Complaints',  icon: <ShieldAlert size={15} /> },
  { id: 'analytics',  label: 'Analytics',   icon: <BarChart3 size={15} /> },
  { id: 'about',      label: 'Methodology', icon: <BookOpen size={15} /> },
];

export default function Header({ activePage, onNavigate, activeVehicle, onClearVehicle }: HeaderProps) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: '#111111',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Top row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px 0 10px',
          position: 'relative',
        }}>
          {/* Logo — perfectly centred */}
          <button
            onClick={() => onNavigate('home')}
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <img src="/slp-logo.png" alt="Strategic Legal Practice" style={{ height: 44, objectFit: 'contain' }} />
          </button>

          {/* Active vehicle chip — pinned to the right, won't shift the logo */}
          <AnimatePresence>
            {activeVehicle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 14px',
                  background: 'rgba(184,146,42,0.12)',
                  border: '1.5px solid rgba(184,146,42,0.45)',
                  borderRadius: 999,
                  maxWidth: 340,
                }}
              >
                <BrandLogo brand={activeVehicle.make || ''} size={28} pill />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                    {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                  </div>
                  {activeVehicle.vin && (
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5 }}>
                      {activeVehicle.vin}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => onNavigate('vin')}
                    style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--accent)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '2px 8px', borderRadius: 4,
                      fontFamily: 'inherit',
                    }}
                  >
                    Change
                  </button>
                  <button
                    onClick={onClearVehicle}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', padding: 2, borderRadius: 4 }}
                    title="Clear vehicle"
                  >
                    <X size={13} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 2, overflowX: 'auto', scrollbarWidth: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', justifyContent: 'center' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '9px 14px',
                border: 'none',
                borderBottom: activePage === item.id ? '2px solid var(--accent)' : '2px solid transparent',
                background: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: activePage === item.id ? 600 : 400,
                color: activePage === item.id ? 'var(--accent)' : 'rgba(255,255,255,0.55)',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s',
                fontFamily: 'inherit',
                marginBottom: -1,
              }}
            >
              {item.icon}
              {item.label}
              {activeVehicle && ['search', 'complaints', 'analytics'].includes(item.id) && activePage !== item.id && (
                <span style={{ width: 5, height: 5, background: 'var(--accent)', borderRadius: '50%', marginLeft: 2, flexShrink: 0, opacity: 0.6 }} />
              )}
            </button>
          ))}
        </nav>

      </div>
    </header>
  );
}
