import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Search, Filter, AlertTriangle } from 'lucide-react';
import { getComplaints } from '../api/nhtsa';
import type { Complaint } from '../types';
import type { ActiveVehicle, Page } from '../App';
import ComplaintRow from '../components/ComplaintRow';

interface Props {
  activeVehicle: ActiveVehicle | null;
  onNavigate: (page: Page) => void;
}

const POPULAR_MAKES = ['FORD', 'CHEVROLET', 'TOYOTA', 'HONDA', 'BMW', 'MERCEDES-BENZ', 'RAM', 'JEEP', 'NISSAN', 'HYUNDAI', 'KIA', 'SUBARU', 'VOLKSWAGEN', 'AUDI', 'DODGE', 'TESLA'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => (CURRENT_YEAR - i).toString());

export default function ComplaintsPage({ activeVehicle, onNavigate }: Props) {
  const [make, setMake] = useState(activeVehicle?.make || '');
  const [model, setModel] = useState(activeVehicle?.model || '');
  const [year, setYear] = useState(activeVehicle?.year || '');
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searched, setSearched] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filterCrash, setFilterCrash] = useState(false);
  const [filterFire, setFilterFire] = useState(false);
  const [filterInjury, setFilterInjury] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'injuries'>('date');
  const [error, setError] = useState('');

  // Auto-load when activeVehicle changes
  useEffect(() => {
    if (activeVehicle?.make && activeVehicle?.model && activeVehicle?.year) {
      setMake(activeVehicle.make);
      setModel(activeVehicle.model);
      setYear(activeVehicle.year);
      fetchData(activeVehicle.make, activeVehicle.model, activeVehicle.year);
    }
  }, [activeVehicle?.vin]);

  const fetchData = async (m: string, mo: string, y: string) => {
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const c = await getComplaints(m, mo, y);
      setComplaints(c);
      setSearched(true);
    } catch {
      setError('Failed to fetch complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!make || !model || !year) { setError('Please fill in all fields.'); return; }
    fetchData(make, model, year);
  };

  const parseDate = (s: string) => {
    const m = s?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return m ? new Date(`${m[3]}-${m[2]}-${m[1]}`).getTime() : 0;
  };

  const filtered = complaints
    .filter(c => {
      if (filterCrash && !c.crash) return false;
      if (filterFire && !c.fire) return false;
      if (filterInjury && c.numberOfInjuries === 0) return false;
      if (keyword) {
        const kw = keyword.toLowerCase();
        return c.summary?.toLowerCase().includes(kw) || c.components?.toLowerCase().includes(kw);
      }
      return true;
    })
    .sort((a, b) => sortBy === 'injuries'
      ? (b.numberOfInjuries || 0) - (a.numberOfInjuries || 0)
      : parseDate(b.dateOfIncident) - parseDate(a.dateOfIncident)
    );

  const SKIP_COMPONENTS = new Set(['OTHER', 'UNKNOWN', 'UNKNOWN OR OTHER', 'N/A', '', 'NOT APPLICABLE']);
  const componentCounts: Record<string, number> = {};
  complaints.forEach(c => {
    const comp = (c.components || '').trim().toUpperCase();
    if (!comp || SKIP_COMPONENTS.has(comp)) return;
    componentCounts[comp] = (componentCounts[comp] || 0) + 1;
  });
  const topComponents = Object.entries(componentCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const totalInjuries = complaints.reduce((s, c) => s + (c.numberOfInjuries || 0), 0);
  const totalDeaths = complaints.reduce((s, c) => s + (c.numberOfDeaths || 0), 0);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: 'var(--danger-soft)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} color="var(--danger)" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.4px' }}>Complaints Explorer</h1>
              {activeVehicle && (
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                  Showing results for <strong style={{ color: 'var(--gray-800)' }}>{activeVehicle.year} {activeVehicle.make} {activeVehicle.model}</strong>
                  {' '}· <button onClick={() => onNavigate('vin')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}>Change vehicle</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Manual override */}
        <form onSubmit={handleSearch} className="card" style={{ padding: 20, marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 10 }}>
            {activeVehicle ? 'Search a different vehicle:' : 'Select vehicle:'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
            <div>
              <label className="label">Year</label>
              <select className="input" value={year} onChange={e => setYear(e.target.value)}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <input
                className="input"
                list="brand-list"
                placeholder="e.g. HONDA"
                value={make}
                onChange={e => setMake(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase' }}
              />
              <datalist id="brand-list">
                {POPULAR_MAKES.map(m => <option key={m} value={m} />)}
              </datalist>
            </div>
            <div>
              <label className="label">Model</label>
              <input className="input" placeholder="e.g. CAMRY" value={model} onChange={e => setModel(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
              {loading ? <span className="spinner" /> : <Search size={15} />}
              {loading ? 'Loading…' : 'Search'}
            </button>
          </div>
          {error && <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--danger-soft)', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={15} /> {error}</div>}
        </form>

        {!activeVehicle && !searched && (
          <div className="empty-state">
            <ShieldAlert size={44} />
            <h3>No Vehicle Selected</h3>
            <p>Decode a VIN in <button onClick={() => onNavigate('vin')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, textDecoration: 'underline' }}>VIN Lookup</button> to automatically load complaints here, or search manually above.</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {searched && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 22 }}>
              {[
                { label: 'Total Complaints', value: complaints.length, color: 'var(--accent)', bg: 'var(--accent-soft)' },
                { label: 'Crashes', value: complaints.filter(c => c.crash).length, color: 'var(--danger)', bg: 'var(--danger-soft)' },
                { label: 'Fires', value: complaints.filter(c => c.fire).length, color: '#c2410c', bg: '#fff7ed' },
                { label: 'Total Injuries', value: totalInjuries, color: 'var(--warning)', bg: 'var(--warning-soft)' },
                { label: 'Fatalities', value: totalDeaths, color: 'var(--danger)', bg: 'var(--danger-soft)' },
              ].map(s => (
                <div key={s.label} style={{ padding: '14px 16px', background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 10 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {topComponents.length > 0 && (
              <div className="card" style={{ padding: 20, marginBottom: 22 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 14 }}>Top Reported Components</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {topComponents.map(([comp, count]) => {
                    const pct = Math.round((count / complaints.length) * 100);
                    return (
                      <div key={comp} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 160, fontSize: 12, color: 'var(--gray-600)', flexShrink: 0, fontWeight: 500 }}>{comp}</div>
                        <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ height: '100%', background: 'var(--accent)', borderRadius: 4 }} />
                        </div>
                        <div style={{ width: 60, fontSize: 12, color: 'var(--gray-500)', textAlign: 'right' }}>{count} ({pct}%)</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <input className="input" placeholder="Filter by keyword (e.g. stalling, brake failure)…" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ maxWidth: 300 }} />
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 4 }}><Filter size={12} /> Filter:</span>
                {[{ label: 'Crash', state: filterCrash, set: setFilterCrash }, { label: 'Fire', state: filterFire, set: setFilterFire }, { label: 'Injury', state: filterInjury, set: setFilterInjury }].map(f => (
                  <button key={f.label} onClick={() => f.set(!f.state)} style={{ padding: '4px 10px', borderRadius: 6, border: `1.5px solid ${f.state ? 'var(--danger)' : 'var(--gray-200)'}`, background: f.state ? 'var(--danger-soft)' : '#fff', color: f.state ? 'var(--danger)' : 'var(--gray-600)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>{f.label}</button>
                ))}
              </div>
              <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'injuries')} style={{ maxWidth: 180 }}>
                <option value="date">Sort: Most Recent</option>
                <option value="injuries">Sort: Most Injuries</option>
              </select>
              <span style={{ fontSize: 13, color: 'var(--gray-400)', marginLeft: 'auto' }}>Showing {filtered.length} of {complaints.length}</span>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state"><ShieldAlert size={40} /><h3>No Complaints Match</h3><p>Try adjusting your filters or search terms.</p></div>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Date</th><th>Component</th><th>Summary</th><th>Crash</th><th>Fire</th><th>Injuries</th></tr></thead>
                  <tbody>{filtered.map((c, i) => <ComplaintRow key={i} complaint={c} />)}</tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
