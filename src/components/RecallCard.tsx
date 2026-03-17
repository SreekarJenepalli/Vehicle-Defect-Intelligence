import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Calendar, Users, ChevronDown, ShieldCheck, Wrench, FileText } from 'lucide-react';
import type { Recall } from '../types';

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const ddmmyyyy = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const d = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
      if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    const ms = dateStr.match(/\/Date\((\d+)\)\//)?.[1];
    if (ms) {
      const d = new Date(parseInt(ms));
      if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    const plain = new Date(dateStr);
    if (!isNaN(plain.getTime())) return plain.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    return '—';
  } catch { return '—'; }
}

function severityColors(component: string) {
  const c = component?.toLowerCase() || '';
  if (c.includes('fuel') || c.includes('fire') || c.includes('brake') || c.includes('air bag') || c.includes('airbag') || c.includes('seat belt'))
    return { border: '#fca5a5', icon: '#b91c1c', badge: '#b91c1c', badgeBg: '#fef2f2' };
  if (c.includes('steering') || c.includes('suspension') || c.includes('engine'))
    return { border: '#fdba74', icon: '#c2410c', badge: '#c2410c', badgeBg: '#fff7ed' };
  return { border: '#fde68a', icon: '#b45309', badge: '#b45309', badgeBg: '#fffbeb' };
}

export default function RecallCard({ recall }: { recall: Recall }) {
  const [expanded, setExpanded] = useState(false);
  const col = severityColors(recall.Component);

  return (
    <motion.div layout style={{
      border: `1.5px solid ${expanded ? col.border : 'var(--gray-200)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: expanded ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}>
      {/* Clickable header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', textAlign: 'left', padding: '16px 20px',
          background: expanded ? 'var(--gray-50)' : '#fff',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.15s',
          display: 'flex', alignItems: 'center', gap: 14,
        }}
      >
        <div style={{ width: 40, height: 40, flexShrink: 0, background: col.badgeBg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle size={19} color={col.icon} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>
              #{recall.NHTSACampaignNumber}
            </span>
            {recall.Component && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: col.badgeBg, color: col.badge }}>
                {recall.Component}
              </span>
            )}
            {recall.PotentialNumberOfUnitsAffected > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--gray-400)' }}>
                <Users size={11} /> {recall.PotentialNumberOfUnitsAffected.toLocaleString()} vehicles
              </span>
            )}
          </div>
          <p style={{
            fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5, margin: 0,
            display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {recall.Summary}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
            <Calendar size={11} /> {formatDate(recall.ReportReceivedDate)}
          </span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} color="var(--gray-400)" />
          </motion.div>
        </div>
      </button>

      {/* Expandable detail panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: `1px solid ${col.border}`,
              padding: '20px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
              background: '#fafafa',
            }}>
              {recall.Consequence && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <AlertTriangle size={13} color="#b91c1c" />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#b91c1c' }}>Safety Consequence</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.6, margin: 0 }}>{recall.Consequence}</p>
                </div>
              )}
              {recall.Remedy && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Wrench size={13} color="var(--success)" />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--success)' }}>Remedy</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.6, margin: 0 }}>{recall.Remedy}</p>
                </div>
              )}
              {recall.Notes && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <FileText size={13} color="var(--gray-400)" />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--gray-500)' }}>Notes</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, margin: 0 }}>{recall.Notes}</p>
                </div>
              )}
              {!recall.Consequence && !recall.Remedy && !recall.Notes && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color="var(--success)" />
                  <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>No additional details on file.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
