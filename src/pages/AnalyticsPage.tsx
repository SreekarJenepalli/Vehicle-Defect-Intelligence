import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
  ComposedChart, Area, ReferenceLine,
} from 'recharts';
import {
  BarChart3, AlertTriangle, Search, MapPin, TrendingUp,
} from 'lucide-react';
import { getComplaints } from '../api/nhtsa';
import type { Complaint } from '../types';
import type { ActiveVehicle, Page } from '../App';
import USMap from '../components/USMap';

const CHART_COLORS = ['#0f1b2d', '#b8922a', '#b91c1c', '#15803d', '#b45309', '#0e7490', '#6d28d9', '#92400e'];
const POPULAR_MAKES = ['FORD', 'CHEVROLET', 'TOYOTA', 'HONDA', 'BMW', 'MERCEDES-BENZ', 'RAM', 'JEEP', 'NISSAN', 'HYUNDAI', 'KIA', 'SUBARU'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => (CURRENT_YEAR - i).toString());

interface Props {
  activeVehicle: ActiveVehicle | null;
  onNavigate: (page: Page) => void;
}

function buildYearlyData(complaints: Complaint[]) {
  const byYear: Record<string, { year: string; count: number; crashes: number; fires: number; injuries: number }> = {};
  complaints.forEach(c => {
    const dateStr = c.dateComplaintFiled;
    if (!dateStr) return;
    let y: string | null = null;
    const ddmmyyyy = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyy) { y = ddmmyyyy[3]; }
    else { const ms = dateStr.match(/\/Date\((\d+)\)\//)?.[1]; if (ms) y = new Date(parseInt(ms)).getFullYear().toString(); }
    if (!y || y < '1980') return;
    if (!byYear[y]) byYear[y] = { year: y, count: 0, crashes: 0, fires: 0, injuries: 0 };
    byYear[y].count++;
    if (c.crash) byYear[y].crashes++;
    if (c.fire) byYear[y].fires++;
    byYear[y].injuries += c.numberOfInjuries || 0;
  });
  return Object.values(byYear).sort((a, b) => a.year.localeCompare(b.year));
}

const SKIP_COMPONENTS = new Set(['OTHER', 'UNKNOWN', 'UNKNOWN OR OTHER', 'N/A', '', 'NOT APPLICABLE']);
function buildComponentData(complaints: Complaint[]) {
  const counts: Record<string, number> = {};
  complaints.forEach(c => {
    const comp = (c.components || '').trim().toUpperCase();
    if (!comp || SKIP_COMPONENTS.has(comp)) return;
    counts[comp] = (counts[comp] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({
      // Shorten long component names for readability
      name: name.length > 22 ? name.slice(0, 20) + '…' : name,
      fullName: name,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
}


const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--gray-800)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, background: p.color, borderRadius: 2, flexShrink: 0 }} />
          {p.name}: <strong>{p.value.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage({ activeVehicle, onNavigate }: Props) {
  const [make, setMake] = useState(activeVehicle?.make || '');
  const [model, setModel] = useState(activeVehicle?.model || '');
  const [year, setYear] = useState(activeVehicle?.year || '');
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeVehicle?.make && activeVehicle?.model && activeVehicle?.year) {
      setMake(activeVehicle.make);
      setModel(activeVehicle.model);
      setYear(activeVehicle.year);
      fetchData(activeVehicle.make, activeVehicle.model, activeVehicle.year);
    }
  }, [activeVehicle?.vin]);

  const fetchData = async (m: string, mo: string, y: string) => {
    setLoading(true); setError(''); setSearched(false);
    try {
      const c = await getComplaints(m, mo, y);
      setComplaints(c); setSearched(true);
    } catch {
      setError('Failed to fetch data. Please try again.');
    } finally { setLoading(false); }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!make || !model || !year) { setError('All fields required.'); return; }
    fetchData(make, model, year);
  };

  const yearlyData    = buildYearlyData(complaints);
  const componentData = buildComponentData(complaints);

  // Simple 4-item pie: crash / fire / injury-only / no-incident
  const totalCrash   = complaints.filter(c => c.crash).length;
  const totalFire    = complaints.filter(c => c.fire).length;
  const injuryOnly   = complaints.filter(c => !c.crash && !c.fire && c.numberOfInjuries > 0).length;
  const noIncident   = complaints.filter(c => !c.crash && !c.fire && c.numberOfInjuries === 0).length;
  const pieData = [
    { name: 'Crash',      value: totalCrash,  color: '#b91c1c' },
    { name: 'Fire',       value: totalFire,   color: '#c2410c' },
    { name: 'Injury',     value: injuryOnly,  color: '#b45309' },
    { name: 'No Incident',value: noIncident,  color: '#d1cdc4' },
  ].filter(d => d.value > 0);

  const crashPct  = complaints.length > 0 ? Math.round((totalCrash / complaints.length) * 100) : 0;
  const firePct   = complaints.length > 0 ? Math.round((totalFire  / complaints.length) * 100) : 0;
  const injuryPct = complaints.length > 0 ? Math.round((complaints.filter(c => c.numberOfInjuries > 0).length / complaints.length) * 100) : 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: 'var(--gray-100)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} color="var(--navy)" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.4px' }}>Analytics &amp; Trends</h1>
              {activeVehicle && (
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                  {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                  {' '}· <button onClick={() => onNavigate('vin')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}>Change vehicle</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="card" style={{ padding: 20, marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 10 }}>
            {activeVehicle ? 'Analyze a different vehicle:' : 'Select vehicle:'}
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
              <input className="input" list="brand-analytics" placeholder="e.g. TOYOTA" value={make} onChange={e => setMake(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} />
              <datalist id="brand-analytics">{POPULAR_MAKES.map(m => <option key={m} value={m} />)}</datalist>
            </div>
            <div>
              <label className="label">Model</label>
              <input className="input" placeholder="e.g. CAMRY" value={model} onChange={e => setModel(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
              {loading ? <span className="spinner" /> : <Search size={15} />}
              {loading ? 'Loading…' : 'Analyze'}
            </button>
          </div>
          {error && <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--danger-soft)', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={15} /> {error}</div>}
        </form>

        {!activeVehicle && !searched && (
          <div className="empty-state">
            <BarChart3 size={44} />
            <h3>No Vehicle Selected</h3>
            <p>Decode a VIN in <button onClick={() => onNavigate('vin')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, textDecoration: 'underline' }}>VIN Lookup</button> to automatically load analytics here.</p>
          </div>
        )}
      </motion.div>

      {searched && complaints.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>

          {/* ── KPI CARDS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Total Complaints', val: complaints.length, color: 'var(--navy)', bg: 'var(--gray-50)' },
              { label: 'Crash Rate',  val: `${crashPct}%`,  color: '#b91c1c', bg: '#fef2f2' },
              { label: 'Fire Rate',   val: `${firePct}%`,   color: '#c2410c', bg: '#fff7ed' },
              { label: 'Injury Rate', val: `${injuryPct}%`, color: '#b45309', bg: '#fffbeb' },
              { label: 'Total Injuries', val: complaints.reduce((s, c) => s + (c.numberOfInjuries || 0), 0), color: 'var(--gray-700)', bg: 'var(--gray-100)' },
            ].map(k => (
              <div key={k.label} style={{ padding: '16px 18px', background: k.bg, border: `1px solid ${k.color}22`, borderRadius: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.val.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* ── CHARTS ROW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22, marginBottom: 22 }}>

            {/* Component bar — horizontal, truncated labels, wider Y axis */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 20 }}>Top Components Reported</h3>
              {componentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={componentData} layout="vertical" margin={{ left: 0, right: 36, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--gray-100)" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      tick={{ fontSize: 10, fill: 'var(--gray-600)' }}
                      interval={0}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { fullName: string; value: number };
                        return (
                          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ fontWeight: 600, color: 'var(--gray-800)', marginBottom: 4 }}>{d.fullName}</div>
                            <div style={{ color: 'var(--navy)' }}>{d.value} complaints</div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="value" name="Complaints" radius={[0, 4, 4, 0]} maxBarSize={22}>
                      {componentData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', fontSize: 13 }}>No component data available</div>
              )}
            </div>

            {/* Simplified pie — no on-chart labels, clean legend below */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 4 }}>Incident Type Breakdown</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 16 }}>Distribution of complaint severity</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90} endAngle={-270}
                  >
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Clean legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {pieData.map(d => {
                  const pct = Math.round((d.value / complaints.length) * 100);
                  return (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--gray-700)', flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: d.color }}>{d.value.toLocaleString()}</span>
                      <span style={{ fontSize: 11, color: 'var(--gray-400)', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── TIMELINE ── */}
          {yearlyData.length > 1 && (
            <div className="card" style={{ padding: 24, marginBottom: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 4 }}>Complaint Volume Over Time</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 20 }}>By year complaint was filed with NHTSA</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={yearlyData} margin={{ right: 16, top: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="count"   name="Complaints" stroke="#0f1b2d" strokeWidth={2.5} dot={{ fill: '#0f1b2d', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="crashes" name="Crashes"    stroke="#b91c1c" strokeWidth={2}   dot={{ fill: '#b91c1c', r: 3 }} />
                  <Line type="monotone" dataKey="injuries"name="Injuries"   stroke="#b45309" strokeWidth={2}   dot={{ fill: '#b45309', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── CRASHES vs FIRES ── */}
          {yearlyData.length > 0 && (() => {
            const totalCrashesAll = yearlyData.reduce((s, d) => s + d.crashes, 0);
            const totalFiresAll   = yearlyData.reduce((s, d) => s + d.fires, 0);
            const totalInjAll     = yearlyData.reduce((s, d) => s + d.injuries, 0);
            const peakYear = yearlyData.reduce((best, d) => (d.crashes + d.fires) > (best.crashes + best.fires) ? d : best, yearlyData[0]);
            return (
              <div className="card" style={{ padding: 24, marginBottom: 22, overflow: 'hidden' }}>
                {/* Header with summary chips */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 4 }}>
                      Crashes, Fires &amp; Injuries by Year
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                      Incident severity trend over the complaint history
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Total Crashes',  value: totalCrashesAll, color: '#b91c1c', bg: '#fef2f2' },
                      { label: 'Total Fires',    value: totalFiresAll,   color: '#c2410c', bg: '#fff7ed' },
                      { label: 'Total Injuries', value: totalInjAll,     color: '#b45309', bg: '#fffbeb' },
                    ].map(s => (
                      <div key={s.label} style={{ padding: '8px 14px', background: s.bg, borderRadius: 8, border: `1px solid ${s.color}33`, textAlign: 'center', minWidth: 80 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: 'var(--gray-500)', fontWeight: 500 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={yearlyData} margin={{ right: 20, top: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="crashGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#b91c1c" stopOpacity={1} />
                        <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#ea580c" stopOpacity={1} />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="injGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%"   stopColor="#b45309" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#b45309" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 11, fill: 'var(--gray-400)' }}
                      axisLine={{ stroke: 'var(--gray-200)' }}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: 'var(--gray-400)' }}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#b45309' }}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0]?.payload as typeof yearlyData[0];
                        return (
                          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 10, padding: '12px 16px', boxShadow: 'var(--shadow-md)', fontSize: 12, minWidth: 160 }}>
                            <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8, fontSize: 13 }}>{label}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#b91c1c', display: 'inline-block' }} /> Crashes</span>
                                <strong style={{ color: '#b91c1c' }}>{d.crashes}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#ea580c', display: 'inline-block' }} /> Fires</span>
                                <strong style={{ color: '#ea580c' }}>{d.fires}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderTop: '1px solid var(--gray-100)', paddingTop: 5, marginTop: 2 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#b45309', display: 'inline-block' }} /> Injuries</span>
                                <strong style={{ color: '#b45309' }}>{d.injuries}</strong>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    {/* Peak year reference line */}
                    {peakYear && (peakYear.crashes + peakYear.fires) > 0 && (
                      <ReferenceLine
                        yAxisId="left"
                        x={peakYear.year}
                        stroke="#b91c1c"
                        strokeDasharray="4 3"
                        strokeOpacity={0.35}
                        label={{ value: 'Peak', position: 'top', fontSize: 10, fill: '#b91c1c', opacity: 0.6 }}
                      />
                    )}
                    {/* Injury area (background) */}
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="injuries"
                      name="Injuries"
                      fill="url(#injGrad)"
                      stroke="#b45309"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      dot={false}
                      activeDot={{ r: 5, fill: '#b45309' }}
                    />
                    {/* Crash bars */}
                    <Bar yAxisId="left" dataKey="crashes" name="Crashes" fill="url(#crashGrad)" radius={[4,4,0,0]} maxBarSize={32} />
                    {/* Fire bars */}
                    <Bar yAxisId="left" dataKey="fires"   name="Fires"   fill="url(#fireGrad)"  radius={[4,4,0,0]} maxBarSize={32} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                      formatter={(value) => <span style={{ color: 'var(--gray-600)' }}>{value}</span>}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            );
          })()}

          {/* ── US MAP ── */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <MapPin size={15} color="var(--accent)" />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>Geographic Complaint Distribution</h3>
            </div>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 20 }}>
              Estimated density by state, weighted by registered vehicle population.
            </p>
            <USMap complaints={complaints} />
          </div>

        </motion.div>
      )}

      {searched && complaints.length === 0 && !loading && (
        <div className="empty-state">
          <TrendingUp size={40} />
          <h3>No Complaints Found</h3>
          <p>No complaints found for the {year} {make} {model}.</p>
        </div>
      )}
    </div>
  );
}
