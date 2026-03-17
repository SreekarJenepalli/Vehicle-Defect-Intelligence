import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Search, ShieldAlert, BarChart3, FileSearch, AlertTriangle, TrendingUp, Scale } from 'lucide-react';
import type { Page, ActiveVehicle } from '../App';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  activeVehicle: ActiveVehicle | null;
}

const features = [
  {
    icon: <Search size={22} color="#8b6914" />,
    bg: '#fdf6e3',
    title: 'VIN Decoder',
    desc: 'Decode any 17-digit VIN to instantly retrieve full vehicle specifications, open recalls, and filed complaints.',
    cta: 'vin' as Page,
    ctaLabel: 'Decode a VIN',
  },
  {
    icon: <FileSearch size={22} color="#0f1b2d" />,
    bg: '#f0ede8',
    title: 'Vehicle Search',
    desc: 'Look up every NHTSA safety recall and investigation for any make, model, and year combination.',
    cta: 'search' as Page,
    ctaLabel: 'Search Recalls',
  },
  {
    icon: <ShieldAlert size={22} color="#b91c1c" />,
    bg: '#fef2f2',
    title: 'Complaints Explorer',
    desc: 'Browse thousands of consumer safety complaints. Filter by component, injury, crash, or fire involvement.',
    cta: 'complaints' as Page,
    ctaLabel: 'Explore Complaints',
  },
  {
    icon: <BarChart3 size={22} color="#15803d" />,
    bg: '#f0fdf4',
    title: 'Analytics & Trends',
    desc: 'Visualize complaint volumes over time, component failure breakdowns, and severity metrics.',
    cta: 'analytics' as Page,
    ctaLabel: 'View Analytics',
  },
];

const stats = [
  { value: '50M+',     label: 'Vehicles covered',  icon: <Scale size={18} /> },
  { value: '1M+',      label: 'Complaints filed',   icon: <AlertTriangle size={18} /> },
  { value: '30,000+',  label: 'Active recalls',     icon: <ShieldAlert size={18} /> },
  { value: 'Real-time',label: 'NHTSA data feed',    icon: <TrendingUp size={18} /> },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function HomePage({ onNavigate, activeVehicle }: HomePageProps) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* Active vehicle banner */}
      {activeVehicle && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: 'var(--accent-soft)', border: '1.5px solid #e2c97a', borderRadius: 12, marginBottom: 36 }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>
              Active vehicle: {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace', marginTop: 2 }}>{activeVehicle.vin}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['search', 'complaints', 'analytics'] as Page[]).map(p => (
              <button key={p} onClick={() => onNavigate(p)} className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>
                {p === 'search' ? 'View Recalls' : p === 'complaints' ? 'View Complaints' : 'View Analytics'}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'var(--accent-soft)', border: '1px solid #e2c97a', borderRadius: 999, fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 24 }}>
          <Scale size={13} /> Vehicle Defect Intelligence Platform
        </div>

        <h1 style={{
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: '-1.2px',
          lineHeight: 1.1,
          marginBottom: 20,
          color: 'var(--navy)',
          fontFamily: "'Playfair Display', serif",
        }}>
          Vehicle Safety &amp; Defect<br />
          <span style={{ color: 'var(--accent)' }}>Legal Research</span>
        </h1>

        <p style={{
          fontSize: 17,
          color: 'var(--gray-500)',
          maxWidth: 560,
          margin: '0 auto 36px',
          lineHeight: 1.75,
        }}>
          Access NHTSA recall data, safety complaints, and defect analytics
          for any vehicle — built for legal professionals and researchers.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }} onClick={() => onNavigate('vin')}>
            <Search size={17} />
            Decode a VIN
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 15, padding: '12px 28px' }} onClick={() => onNavigate('search')}>
            <FileSearch size={17} />
            Search Recalls
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 64,
        }}
      >
        {stats.map((s, i) => (
          <motion.div key={i} variants={item}>
            <div style={{
              background: 'var(--gray-50)',
              border: '1px solid var(--gray-200)',
              borderRadius: 10,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{ color: 'var(--accent)', opacity: 0.9 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.5px' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Features */}
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 6, color: 'var(--navy)', fontFamily: "'Playfair Display', serif" }}>
          Platform Modules
        </h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 28 }}>
          Four specialized tools for comprehensive vehicle defect analysis.
        </p>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <motion.div key={i} variants={item}>
              <div className="card" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  width: 44, height: 44,
                  background: f.bg,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 20, flex: 1 }}>
                  {f.desc}
                </p>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: 13, padding: '8px 16px', alignSelf: 'flex-start' }}
                  onClick={() => onNavigate(f.cta)}
                >
                  {f.ctaLabel} →
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
