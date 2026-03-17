import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, AlertTriangle, CheckCircle, Info,
  ShieldAlert, Zap, BarChart3, FileSearch, ArrowRight
} from 'lucide-react';
import { decodeVIN, getRecalls, getComplaints } from '../api/nhtsa';
import type { VINDecodeResult, Recall, Complaint } from '../types';
import type { ActiveVehicle, Page } from '../App';
import RecallCard from '../components/RecallCard';
import ComplaintRow from '../components/ComplaintRow';
import BrandLogo from '../components/BrandLogo';

interface Props {
  activeVehicle: ActiveVehicle | null;
  onVehicleSet: (v: ActiveVehicle) => void;
  onNavigate: (page: Page) => void;
}


function VehicleSpecCard({ result }: { result: VINDecodeResult }) {
  const specs = [
    { label: 'Brand', value: result.make },
    { label: 'Model', value: result.model },
    { label: 'Year', value: result.modelYear },
    { label: 'Body Class', value: result.bodyClass },
    { label: 'Vehicle Type', value: result.vehicleType },
    { label: 'Drive Type', value: result.driveType },
    { label: 'Engine', value: result.engineDisplacementL ? `${result.engineDisplacementL}L ${result.engineCylinders}-cyl` : result.engineCylinders },
    { label: 'Engine Config', value: result.engineConfiguration },
    { label: 'Fuel Type', value: result.fuelTypePrimary },
    { label: 'Transmission', value: result.transmissionStyle },
    { label: 'Series', value: result.series },
    { label: 'Manufacturer', value: result.manufacturer },
    { label: 'Plant City', value: result.plantCity },
    { label: 'Plant Country', value: result.plantCountry },
  ].filter(s => s.value && s.value !== 'Not Applicable');

  return (
    <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f1b2d, #1a2e47)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <BrandLogo brand={result.make} size={52} pill />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
            {result.modelYear} {result.make} {result.model}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', marginTop: 2 }}>
            VIN: {result.vin}
          </div>
        </div>
        <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', flexShrink: 0 }}>
          <CheckCircle size={12} /> Decoded
        </span>
      </div>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px 24px' }}>
          {specs.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 14, color: 'var(--gray-800)', fontWeight: 500 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VINLookupPage({ activeVehicle, onVehicleSet, onNavigate }: Props) {
  const [vin, setVin] = useState(activeVehicle?.vin || '');
  const [decoding, setDecoding] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState('');
  const [decoded, setDecoded] = useState<VINDecodeResult | null>(null);
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [tab, setTab] = useState<'recalls' | 'complaints'>('recalls');
  const [hasResults, setHasResults] = useState(false);

  // Reload data if navigating back to this page with an active vehicle
  useEffect(() => {
    if (activeVehicle && !hasResults && activeVehicle.vin) {
      setVin(activeVehicle.vin);
      runDecode(activeVehicle.vin, false);
    }
  }, []);

  const runDecode = async (vinStr: string, setGlobal: boolean) => {
    setDecoding(true);
    setError('');
    setDecoded(null);
    setRecalls([]);
    setComplaints([]);
    setHasResults(false);
    try {
      const result = await decodeVIN(vinStr);
      setDecoded(result);
      if (setGlobal) {
        onVehicleSet({ vin: vinStr, make: result.make, model: result.model, year: result.modelYear });
      }
      setDecoding(false);
      if (result.make && result.model && result.modelYear) {
        setFetchingData(true);
        const [r, c] = await Promise.all([
          getRecalls(result.make, result.model, result.modelYear),
          getComplaints(result.make, result.model, result.modelYear),
        ]);
        setRecalls(r);
        setComplaints(c);
        setHasResults(true);
        setFetchingData(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(
        msg === 'INVALID_VIN'
          ? 'Invalid VIN number. Please double-check and enter a correct 17-character VIN.'
          : 'Failed to reach the vehicle database. Please check your connection and try again.'
      );
      setDecoding(false);
      setFetchingData(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = vin.trim().toUpperCase();
    if (!trimmed || trimmed.length !== 17) {
      setError('Please enter a valid 17-character VIN.');
      return;
    }
    if (/[IOQ]/.test(trimmed)) {
      setError('Invalid VIN number — VINs cannot contain the letters I, O, or Q.');
      return;
    }
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(trimmed)) {
      setError('Invalid VIN number. VINs contain only letters (except I, O, Q) and numbers.');
      return;
    }
    await runDecode(trimmed, true);
  };

  const isLoading = decoding || fetchingData;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: 'var(--gray-100)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={20} color="var(--navy)" />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.4px' }}>VIN Lookup</h1>
          </div>
          <p style={{ fontSize: 15, color: 'var(--gray-500)', lineHeight: 1.6 }}>
            Enter a VIN once — all sections (Recalls, Complaints, Analytics) will automatically load data for this vehicle.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="card" style={{ padding: 24, marginBottom: 24 }}>
          <label className="label" htmlFor="vin-input" style={{ fontSize: 14, marginBottom: 8 }}>
            Vehicle Identification Number (VIN)
          </label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <input
                id="vin-input"
                className="input"
                placeholder="Enter 17-character VIN…"
                value={vin}
                onChange={e => { setVin(e.target.value.toUpperCase()); setError(''); }}
                style={{ fontFamily: 'monospace', fontSize: 15, letterSpacing: 1.5 }}
                maxLength={17}
                autoComplete="off"
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <span style={{ fontSize: 12, color: vin.length === 17 ? 'var(--success)' : 'var(--gray-400)', fontWeight: 500 }}>
                  {vin.length}/17
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || vin.trim().length !== 17}
              style={{ padding: '11px 28px', fontSize: 14, alignSelf: 'flex-start' }}
            >
              {decoding ? <span className="spinner" /> : <Search size={16} />}
              {decoding ? 'Decoding…' : fetchingData ? 'Fetching data…' : 'Decode & Search'}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--danger-soft)', border: '1px solid #fecaca', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--danger)' }}>
              <AlertTriangle size={15} /> {error}
            </div>
          )}
        </form>

        {!hasResults && !decoding && !fetchingData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '14px 20px', display: 'flex', gap: 12 }}
          >
            <Info size={16} color="var(--gray-400)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--gray-700)' }}>Where to find your VIN:</strong>{' '}
              Dashboard (driver's side) · Door jamb sticker · Vehicle title / registration · Insurance card · Engine block
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Loading skeleton */}
      <AnimatePresence>
        {decoding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginTop: 24 }}>
            <div className="skeleton" style={{ height: 130, borderRadius: 12, marginBottom: 16 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
            </div>
            <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {decoded && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: 8 }}
          >
            <VehicleSpecCard result={decoded} />

            {/* Stat cards — clickable, navigate to section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 14, marginBottom: 20 }}>
              {[
                { icon: <ShieldAlert size={20} />, value: recalls.length, label: 'Safety Recalls', color: recalls.length > 0 ? 'var(--danger)' : 'var(--success)', bg: recalls.length > 0 ? 'var(--danger-soft)' : 'var(--success-soft)', border: recalls.length > 0 ? '#fecaca' : '#a7f3d0', page: 'search' as Page },
                { icon: <Zap size={20} />, value: complaints.length, label: 'Complaints Filed', color: complaints.length > 0 ? 'var(--warning)' : 'var(--success)', bg: complaints.length > 0 ? 'var(--warning-soft)' : 'var(--success-soft)', border: complaints.length > 0 ? '#fde68a' : '#a7f3d0', page: 'complaints' as Page },
                { icon: <AlertTriangle size={20} />, value: complaints.filter(c => c.crash).length, label: 'Crash Reports', color: 'var(--danger)', bg: 'var(--danger-soft)', border: '#fecaca', page: 'complaints' as Page },
                { icon: <BarChart3 size={20} />, value: complaints.reduce((s, c) => s + (c.numberOfInjuries || 0), 0), label: 'Total Injuries', color: 'var(--warning)', bg: 'var(--warning-soft)', border: '#fde68a', page: 'analytics' as Page },
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(s.page)}
                  style={{ padding: '16px 18px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, textAlign: 'left', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'inherit' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; }}
                >
                  <div style={{ color: s.color }}>{s.icon}</div>
                  {fetchingData
                    ? <div className="skeleton" style={{ height: 28, width: 40, borderRadius: 6 }} />
                    : <div style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  }
                  <div style={{ fontSize: 12, color: 'var(--gray-600)', fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: s.color, display: 'flex', alignItems: 'center', gap: 3 }}>View details <ArrowRight size={10} /></div>
                </button>
              ))}
            </div>

            {/* Jump-to bar */}
            <div style={{ display: 'flex', gap: 10, padding: '12px 18px', background: 'var(--accent-soft)', border: '1px solid #e2c97a', borderRadius: 10, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Jump to section:</span>
              {[
                { label: 'Full Recalls', page: 'search' as Page, icon: <FileSearch size={13} /> },
                { label: 'All Complaints', page: 'complaints' as Page, icon: <ShieldAlert size={13} /> },
                { label: 'Analytics', page: 'analytics' as Page, icon: <BarChart3 size={13} /> },
              ].map(n => (
                <button key={n.page} onClick={() => onNavigate(n.page)} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 12, gap: 5 }}>
                  {n.icon} {n.label} <ArrowRight size={11} />
                </button>
              ))}
            </div>

            {/* Inline preview tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 20, alignItems: 'center' }}>
              {(['recalls', 'complaints'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', background: tab === t ? '#fff' : 'transparent', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontSize: 13, fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--gray-900)' : 'var(--gray-500)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                  {t === 'recalls' ? `Recalls (${recalls.length})` : `Complaints (${complaints.length})`}
                </button>
              ))}
              {fetchingData && <span className="spinner" style={{ alignSelf: 'center', marginLeft: 8, width: 16, height: 16 }} />}
            </div>

            {tab === 'recalls' && (
              fetchingData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
                </div>
              ) : recalls.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={40} color="var(--success)" style={{ opacity: 1 }} />
                  <h3 style={{ color: 'var(--success)' }}>No Open Recalls</h3>
                  <p>No safety recalls found for this vehicle in the NHTSA database.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {recalls.map((r, i) => <RecallCard key={i} recall={r} />)}
                </div>
              )
            )}

            {tab === 'complaints' && (
              fetchingData ? (
                <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
              ) : complaints.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={40} color="var(--success)" style={{ opacity: 1 }} />
                  <h3 style={{ color: 'var(--success)' }}>No Complaints Found</h3>
                  <p>No consumer complaints found in the NHTSA ODI database.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Date</th><th>Component</th><th>Summary</th><th>Crash</th><th>Fire</th><th>Injuries</th></tr></thead>
                    <tbody>{complaints.map((c, i) => <ComplaintRow key={i} complaint={c} />)}</tbody>
                  </table>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
