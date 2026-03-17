import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import type { Complaint } from '../types';

// US vehicle registrations by state (millions) — used to weight complaint distribution
// Source: FHWA Highway Statistics
const STATE_REG_WEIGHT: Record<string, number> = {
  CA: 15.0, TX: 14.0, FL: 9.5, NY: 7.0, PA: 6.5, OH: 6.0, IL: 5.5,
  GA: 5.0, MI: 5.0, NC: 5.0, NJ: 4.5, VA: 4.5, WA: 4.0, AZ: 4.0,
  TN: 4.0, IN: 3.5, MA: 3.5, MO: 3.5, MD: 3.0, CO: 3.0, WI: 3.0,
  MN: 3.0, SC: 2.5, AL: 2.5, KY: 2.5, OR: 2.5, LA: 2.5, OK: 2.5,
  CT: 2.0, UT: 2.0, NV: 2.0, AR: 2.0, MS: 2.0, KS: 2.0, NM: 1.5,
  NE: 1.5, IA: 1.5, ID: 1.5, WV: 1.0, HI: 1.0, NH: 1.0, ME: 1.0,
  MT: 0.8, RI: 0.7, DE: 0.7, SD: 0.7, ND: 0.6, AK: 0.6, VT: 0.5,
  WY: 0.5, DC: 0.3,
};

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'D.C.', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana',
  IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin',
  WY: 'Wyoming',
};

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// FIPS code → state abbreviation
const FIPS_TO_STATE: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO',
  '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI',
  '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY',
  '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN',
  '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH',
  '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
  '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA',
  '54': 'WV', '55': 'WI', '56': 'WY',
};

function distributeComplaintsByState(total: number, crashes: number, fires: number): Record<string, number> {
  const totalWeight = Object.values(STATE_REG_WEIGHT).reduce((a, b) => a + b, 0);
  const result: Record<string, number> = {};
  let assigned = 0;
  const states = Object.entries(STATE_REG_WEIGHT);
  states.forEach(([state, weight], idx) => {
    if (idx === states.length - 1) {
      result[state] = Math.max(0, total - assigned);
    } else {
      const count = Math.round((weight / totalWeight) * total);
      result[state] = count;
      assigned += count;
    }
  });
  return result;
}

interface Props {
  complaints: Complaint[];
}

const MAP_COLORS = ['#e8e4d9', '#d4c9a8', '#b8a87a', '#9d8a52', '#866f35', '#6e5720', '#4f3c10', '#2e2008'];

export default function USMap({ complaints }: Props) {
  const [tooltip, setTooltip] = useState<{ state: string; count: number; x: number; y: number } | null>(null);

  const total = complaints.length;
  const stateData = distributeComplaintsByState(total, complaints.filter(c => c.crash).length, complaints.filter(c => c.fire).length);

  const values = Object.values(stateData).filter(v => v > 0);
  const colorScale = scaleQuantile<string>()
    .domain(values.length > 0 ? values : [0, 1])
    .range(MAP_COLORS);

  const getColor = (fips: string) => {
    const state = FIPS_TO_STATE[fips];
    if (!state) return '#f0ede8';
    const count = stateData[state] || 0;
    if (count === 0) return '#f0ede8';
    return colorScale(count);
  };

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: '100%', height: 'auto' }}
        projectionConfig={{ scale: 900 }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => {
              const fips = geo.id as string;
              const state = FIPS_TO_STATE[fips];
              const count = stateData[state] || 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColor(fips)}
                  stroke="#fff"
                  strokeWidth={0.6}
                  style={{
                    default: { outline: 'none', transition: 'fill 0.15s' },
                    hover:   { outline: 'none', fill: '#c9973c', cursor: 'pointer' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={(e) => setTooltip({ state: STATE_NAMES[state] || state, count, x: e.clientX, y: e.clientY })}
                  onMouseMove={(e)  => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                  onMouseLeave={()  => setTooltip(null)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 14,
          top: tooltip.y - 44,
          background: 'rgba(15,27,45,0.93)',
          color: '#fff',
          padding: '8px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          pointerEvents: 'none',
          zIndex: 999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{tooltip.state}</div>
          <div style={{ fontSize: 12, color: '#c9a96e' }}>~{tooltip.count.toLocaleString()} est. complaints</div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, justifyContent: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Fewer</span>
        {MAP_COLORS.map((c, i) => (
          <div key={i} style={{ width: 26, height: 11, background: c, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }} />
        ))}
        <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>More</span>
      </div>
      <div style={{ textAlign: 'center', marginTop: 6, fontSize: 11, color: 'var(--gray-400)' }}>
        Estimated distribution by state vehicle registration · Hover to inspect
      </div>
    </div>
  );
}
