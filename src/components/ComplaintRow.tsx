import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Car, AlertTriangle, User, Calendar, Hash, Skull } from 'lucide-react';
import type { Complaint } from '../types';

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const ddmmyyyy = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const d = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
      if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    const mmddyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyy) {
      const d = new Date(`${mmddyyyy[3]}-${mmddyyyy[1].padStart(2,'0')}-${mmddyyyy[2].padStart(2,'0')}`);
      if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    const ms = dateStr.match(/\/Date\((\d+)\)\//)?.[1];
    if (ms) {
      const d = new Date(parseInt(ms));
      if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    if (/^\d{8}$/.test(dateStr)) {
      const d = new Date(`${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`);
      if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    const plain = new Date(dateStr);
    if (!isNaN(plain.getTime()) && plain.getFullYear() > 1980) {
      return plain.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return '—';
  } catch { return '—'; }
}

interface Props {
  complaint: Complaint;
  showVehicle?: boolean;
}

export default function ComplaintRow({ complaint, showVehicle = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasCrash = complaint.crash;
  const hasFire = complaint.fire;
  const hasInjury = complaint.numberOfInjuries > 0;
  const hasDeath = complaint.numberOfDeaths > 0;
  const colSpan = showVehicle ? 7 : 6;

  return (
    <>
      <tr onClick={() => setExpanded(e => !e)} style={{ cursor: 'pointer' }}>
        <td style={{ whiteSpace: 'nowrap', color: 'var(--gray-500)', fontSize: 12 }}>
          {formatDate(complaint.dateOfIncident)}
        </td>
        {showVehicle && (
          <td style={{ fontSize: 12 }}>
            {complaint.products?.[0]
              ? `${complaint.products[0].modelYear} ${complaint.products[0].make} ${complaint.products[0].model}`
              : '—'}
          </td>
        )}
        <td>
          <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>{complaint.components || '—'}</span>
        </td>
        <td style={{ maxWidth: 320 }}>
          <span style={{
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            fontSize: 13, lineHeight: 1.5, color: 'var(--gray-700)',
          }}>
            {complaint.summary}
          </span>
        </td>
        <td>
          {hasCrash
            ? <span className="tag tag-red" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Car size={10} /> Yes</span>
            : <span className="tag tag-gray">No</span>}
        </td>
        <td>
          {hasFire
            ? <span className="tag tag-orange" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Flame size={10} /> Yes</span>
            : <span className="tag tag-gray">No</span>}
        </td>
        <td>
          {hasInjury
            ? <span className="tag tag-red" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><User size={10} /> {complaint.numberOfInjuries}</span>
            : <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>0</span>}
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={colSpan} style={{ padding: 0, border: 'none' }}>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '16px 20px', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)' }}>
                  <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.75, marginBottom: 14 }}>
                    {complaint.summary}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                        <Hash size={10} color="var(--gray-400)" />
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gray-400)' }}>ODI Number</span>
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--gray-700)' }}>#{complaint.odiNumber}</span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                        <Calendar size={10} color="var(--gray-400)" />
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gray-400)' }}>Filed</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--gray-700)' }}>{formatDate(complaint.dateComplaintFiled)}</span>
                    </div>
                    {hasInjury && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                          <AlertTriangle size={10} color="var(--warning)" />
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--warning)' }}>Injuries</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning)' }}>{complaint.numberOfInjuries}</span>
                      </div>
                    )}
                    {hasDeath && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                          <Skull size={10} color="var(--danger)" />
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--danger)' }}>Fatalities</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)' }}>{complaint.numberOfDeaths}</span>
                      </div>
                    )}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      {hasCrash && <span className="tag tag-red" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Car size={10} /> Crash</span>}
                      {hasFire  && <span className="tag tag-orange" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Flame size={10} /> Fire</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
