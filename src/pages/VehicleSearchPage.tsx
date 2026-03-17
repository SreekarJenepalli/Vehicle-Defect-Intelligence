import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, AlertTriangle, CheckCircle, Filter, Search } from 'lucide-react';
import { getRecalls, getComplaints, getModels } from '../api/nhtsa';
import type { Recall, Complaint } from '../types';
import type { ActiveVehicle, Page } from '../App';
import RecallCard from '../components/RecallCard';
import ComplaintRow from '../components/ComplaintRow';

interface Props {
  activeVehicle: ActiveVehicle | null;
  onNavigate: (page: Page) => void;
}

const POPULAR_MAKES = ['FORD', 'CHEVROLET', 'TOYOTA', 'HONDA', 'BMW', 'MERCEDES-BENZ', 'RAM', 'JEEP', 'NISSAN', 'HYUNDAI', 'KIA', 'SUBARU', 'VOLKSWAGEN', 'AUDI', 'DODGE'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => (CURRENT_YEAR - i).toString());

export default function VehicleSearchPage({ activeVehicle, onNavigate }: Props) {
  const [make, setMake] = useState(activeVehicle?.make || '');
  const [model, setModel] = useState(activeVehicle?.model || '');
  const [year, setYear] = useState(activeVehicle?.year || '');
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searched, setSearched] = useState(false);
  const [tab, setTab] = useState<'recalls' | 'complaints'>('recalls');
  const [filterCrash, setFilterCrash] = useState(false);
  const [filterFire, setFilterFire] = useState(false);
  const [filterInjury, setFilterInjury] = useState(false);

  // Auto-load when activeVehicle is set
  useEffect(() => {
    if (activeVehicle?.make && activeVehicle?.model && activeVehicle?.year) {
      setMake(activeVehicle.make);
      setModel(activeVehicle.model);
      setYear(activeVehicle.year);
      fetchData(activeVehicle.make, activeVehicle.model, activeVehicle.year);
    }
  }, [activeVehicle?.vin]);

  useEffect(() => {
    if (make && year) {
      setModelsLoading(true);
      getModels(make, year).then(ms => { setModels(ms); setModelsLoading(false); }).catch(() => setModelsLoading(false));
    } else {
      setModels([]);
    }
  }, [make, year]);

  const fetchData = async (m: string, mo: string, y: string) => {
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const [r, c] = await Promise.all([getRecalls(m, mo, y), getComplaints(m, mo, y)]);
      setRecalls(r);
      setComplaints(c);
      setSearched(true);
      setTab('recalls');
    } catch {
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!make || !model || !year) { setError('Please select make, model, and year.'); return; }
    fetchData(make, model, year);
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterCrash && !c.crash) return false;
    if (filterFire && !c.fire) return false;
    if (filterInjury && c.numberOfInjuries === 0) return false;
    return true;
  });

  const crashCount = complaints.filter(c => c.crash).length;
  const fireCount = complaints.filter(c => c.fire).length;
  const totalInjuries = complaints.reduce((sum, c) => sum + (c.numberOfInjuries || 0), 0);
  const totalDeaths = complaints.reduce((sum, c) => sum + (c.numberOfDeaths || 0), 0);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: '#f5f3ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSearch size={20} color="var(--navy)" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.4px' }}>Recalls</h1>
              {activeVehicle && (
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                  Showing results for <strong style={{ color: 'var(--gray-800)' }}>{activeVehicle.year} {activeVehicle.make} {activeVehicle.model}</strong>
                  {' '}· <button onClick={() => onNavigate('vin')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}>Change vehicle</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Manual override form */}
        <form onSubmit={handleSearch} className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)' }}>
              {activeVehicle ? 'Search a different vehicle:' : 'Select vehicle:'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
            <div>
              <label className="label">Year</label>
              <select className="input" value={year} onChange={e => setYear(e.target.value)}>
                <option value="">Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <input
                className="input"
                list="brand-suggestions"
                placeholder="e.g. FORD"
                value={make}
                onChange={e => setMake(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase' }}
              />
              <datalist id="brand-suggestions">
                {POPULAR_MAKES.map(m => <option key={m} value={m} />)}
              </datalist>
            </div>
            <div>
              <label className="label">Model</label>
              <input
                className="input"
                list="model-suggestions"
                placeholder={modelsLoading ? 'Loading…' : 'e.g. ACCORD'}
                value={model}
                onChange={e => setModel(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase' }}
              />
              <datalist id="model-suggestions">
                {models.map(m => <option key={m} value={m} />)}
              </datalist>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || !make || !model || !year} style={{ padding: '10px 20px' }}>
              {loading ? <span className="spinner" /> : <Search size={15} />}
              {loading ? 'Loading…' : 'Search'}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--danger-soft)', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={15} /> {error}
            </div>
          )}
        </form>

        {!activeVehicle && !searched && (
          <div className="empty-state">
            <FileSearch size={44} />
            <h3>No Vehicle Selected</h3>
            <p>Decode a VIN in <button onClick={() => onNavigate('vin')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, textDecoration: 'underline' }}>VIN Lookup</button> to automatically load recall data here, or search manually above.</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {searched && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>{year} {make} {model}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className={`badge ${recalls.length > 0 ? 'badge-danger' : 'badge-success'}`}>{recalls.length} recall{recalls.length !== 1 ? 's' : ''}</span>
                <span className={`badge ${complaints.length > 0 ? 'badge-warning' : 'badge-success'}`}>{complaints.length} complaint{complaints.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {complaints.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 22 }}>
                {[
                  { label: 'Crashes', value: crashCount, color: 'var(--danger)', soft: 'var(--danger-soft)' },
                  { label: 'Fires', value: fireCount, color: '#c2410c', soft: '#fff7ed' },
                  { label: 'Total Injuries', value: totalInjuries, color: 'var(--warning)', soft: 'var(--warning-soft)' },
                  { label: 'Fatalities', value: totalDeaths, color: 'var(--danger)', soft: 'var(--danger-soft)' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '12px 16px', background: s.soft, border: `1px solid ${s.color}22`, borderRadius: 10 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', borderRadius: 10, padding: 4 }}>
                {(['recalls', 'complaints'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', background: tab === t ? '#fff' : 'transparent', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontSize: 13, fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--gray-900)' : 'var(--gray-500)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                    {t === 'recalls' ? `Recalls (${recalls.length})` : `Complaints (${complaints.length})`}
                  </button>
                ))}
              </div>
              {tab === 'complaints' && complaints.length > 0 && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 4 }}><Filter size={12} /> Filter:</span>
                  {[{ label: 'Crash', state: filterCrash, set: setFilterCrash }, { label: 'Fire', state: filterFire, set: setFilterFire }, { label: 'Injury', state: filterInjury, set: setFilterInjury }].map(f => (
                    <button key={f.label} onClick={() => f.set(!f.state)} style={{ padding: '4px 10px', borderRadius: 6, border: `1.5px solid ${f.state ? 'var(--danger)' : 'var(--gray-200)'}`, background: f.state ? 'var(--danger-soft)' : '#fff', color: f.state ? 'var(--danger)' : 'var(--gray-600)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>{f.label}</button>
                  ))}
                </div>
              )}
            </div>

            {tab === 'recalls' && (
              recalls.length === 0 ? (
                <div className="empty-state"><CheckCircle size={40} color="var(--success)" style={{ opacity: 1 }} /><h3 style={{ color: 'var(--success)' }}>No Recalls Found</h3><p>No safety recalls found for the {year} {make} {model}.</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {recalls.map((r, i) => <RecallCard key={i} recall={r} />)}
                </div>
              )
            )}

            {tab === 'complaints' && (
              filteredComplaints.length === 0 ? (
                <div className="empty-state"><CheckCircle size={40} color="var(--success)" style={{ opacity: 1 }} /><h3>No Complaints Match</h3><p>{complaints.length === 0 ? `No complaints found.` : 'No complaints match the filters.'}</p></div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Date</th><th>Component</th><th>Summary</th><th>Crash</th><th>Fire</th><th>Injuries</th></tr></thead>
                    <tbody>{filteredComplaints.map((c, i) => <ComplaintRow key={i} complaint={c} />)}</tbody>
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
