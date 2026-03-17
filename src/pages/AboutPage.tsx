import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Database, Shield, Scale, AlertTriangle, CheckCircle, ExternalLink, FileText } from 'lucide-react';

const sections = [
  {
    icon: <Database size={20} color="#2563eb" />,
    bg: 'var(--accent-soft)',
    title: 'Data Sources',
    content: `All data is sourced live from the National Highway Traffic Safety Administration (NHTSA), a division of the U.S. Department of Transportation. NHTSA is the primary federal authority for motor vehicle safety.

Two primary APIs are used:

1. NHTSA vPIC (Vehicle Product Information Catalog) — Decodes VIN numbers and provides vehicle specifications. This API is maintained by NHTSA and follows ISO 3779 and ISO 4030 standards for VIN structure.

2. NHTSA Complaints & Recalls API — Provides access to the Office of Defects Investigation (ODI) database, which contains consumer safety complaints and official safety recall campaigns issued since the 1960s.

Data is fetched in real time — there is no caching or intermediate storage. Results reflect the current state of the NHTSA databases at the time of the query.`,
  },
  {
    icon: <FileText size={20} color="#7c3aed" />,
    bg: '#f5f3ff',
    title: 'VIN Decoding Methodology',
    content: `A Vehicle Identification Number (VIN) is a standardized 17-character alphanumeric code defined by ISO 3779. Each position carries specific information:

• Positions 1–3 (WMI): World Manufacturer Identifier — identifies the country and manufacturer.
• Positions 4–8 (VDS): Vehicle Descriptor Section — encodes make, model, body style, engine type, and restraint system.
• Position 9: Check digit calculated using a weighted algorithm to verify VIN integrity.
• Position 10: Model year code (e.g., K = 2019, L = 2020, M = 2021, N = 2022, P = 2023).
• Position 11: Plant of manufacture.
• Positions 12–17: Sequential production number.

Decoding is performed against NHTSA's vPIC database, which maps VIN patterns to vehicle specifications across thousands of makes and models.`,
  },
  {
    icon: <Shield size={20} color="#dc2626" />,
    bg: 'var(--danger-soft)',
    title: 'Safety Recalls',
    content: `Under the National Traffic and Motor Vehicle Safety Act (49 U.S.C. Chapter 301), manufacturers are required to notify NHTSA and vehicle owners of safety defects and non-compliances with federal safety standards.

A safety recall is issued when a manufacturer or NHTSA determines that a vehicle, equipment, car seat, or tire:
• Creates an unreasonable risk to motor vehicle safety, or
• Fails to meet applicable motor vehicle safety standards.

Recall campaigns are assigned NHTSA Campaign Numbers and include the component affected, a description of the defect, the potential safety consequence, and the remedy (typically a free repair at a dealership).

Important: Recalls apply to a make/model/year range — not individual VINs. A specific vehicle may or may not have received the recall remedy.`,
  },
  {
    icon: <AlertTriangle size={20} color="#d97706" />,
    bg: 'var(--warning-soft)',
    title: 'Consumer Complaints (ODI)',
    content: `The Office of Defects Investigation (ODI) within NHTSA maintains a public database of consumer safety complaints. Any vehicle owner or operator can file a complaint online.

Key characteristics of the complaint database:
• Complaints are self-reported and unverified — they represent consumer allegations, not confirmed defects.
• Each complaint is assigned an ODI number for tracking.
• Complaints capture: incident date, component involved, brief summary, and whether the incident involved a crash, fire, injury, or fatality.
• NHTSA uses complaint data to identify potential safety trends and initiate Engineering Analyses (EA) or Preliminary Evaluations (PE) that may lead to recalls.

The complaint database does not imply manufacturer liability. However, clusters of similar complaints — particularly those involving crashes, fires, or injuries — are important indicators that legal professionals and researchers use to identify systemic defects.`,
  },
  {
    icon: <Scale size={20} color="#059669" />,
    bg: 'var(--success-soft)',
    title: 'Legal & Research Context',
    content: `Vehicle defect data from NHTSA is regularly used in:

• Product liability litigation: Plaintiffs' attorneys use ODI complaint data and recall campaigns to establish notice (that a manufacturer knew or should have known of a defect) and to identify patterns of failure.

• Class action cases: Complaint clusters across model years establish the breadth of a defect, supporting class certification.

• Expert witness testimony: Engineers and safety experts cite NHTSA data in depositions and at trial.

• Regulatory enforcement: NHTSA uses the data to issue civil penalties and mandate recalls under the Transportation Recall Enhancement, Accountability, and Documentation (TREAD) Act.

• Insurance investigations: Insurers use recall and complaint history to assess liability in accident claims.

This platform does not provide legal advice. All data should be independently verified against official NHTSA sources for litigation purposes.`,
  },
  {
    icon: <CheckCircle size={20} color="#0891b2" />,
    bg: '#ecfeff',
    title: 'Limitations & Caveats',
    content: `Users should be aware of the following limitations:

• Underreporting: Consumer complaints represent only a fraction of actual incidents. Many drivers do not file complaints with NHTSA.

• Recall completeness: Not all vehicles in a recall campaign have been repaired. NHTSA does not provide individual vehicle completion status through public APIs.

• VIN specificity: Recall searches match by make/model/year. This may include vehicles that were manufactured before or after the recall-affected production window.

• Data lag: There may be a delay between an incident occurring and a complaint being filed or a recall being issued.

• API availability: All data is dependent on NHTSA's public APIs being operational. Results may vary during NHTSA maintenance windows.

• International applicability: NHTSA data covers vehicles sold in the United States. Canadian, European, or other markets may have different recall databases.`,
  },
];

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, background: '#fef3c7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="#d97706" />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.4px' }}>
              Methodology & Data Sources
            </h1>
          </div>
          <p style={{ fontSize: 15, color: 'var(--gray-500)', lineHeight: 1.7, maxWidth: 700 }}>
            This platform uses authoritative federal government data to provide accurate, real-time information
            on vehicle safety defects, recalls, and consumer complaints. Below is a complete explanation of the
            data sources, methodologies, and limitations.
          </p>
        </div>

        {/* Official source badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '16px 20px',
          background: 'var(--accent-soft)',
          border: '1.5px solid #e2c97a',
          borderRadius: 12,
          marginBottom: 40,
        }}>
          <img
            src="https://www.nhtsa.gov/sites/nhtsa.gov/themes/custom/nhtsa/images/logo_nhtsa.svg"
            alt="NHTSA"
            style={{ height: 36, objectFit: 'contain' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>
              National Highway Traffic Safety Administration
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              U.S. Department of Transportation · Official federal vehicle safety authority
            </div>
          </div>
          <a
            href="https://www.nhtsa.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ marginLeft: 'auto', fontSize: 12, padding: '7px 14px' }}
          >
            <ExternalLink size={13} /> Visit NHTSA.gov
          </a>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {sections.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="card"
              style={{ padding: 28, overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, background: s.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-900)' }}>{s.title}</h2>
              </div>
              <div style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                {s.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* API Endpoints reference */}
        <div className="card" style={{ padding: 28, marginTop: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={18} color="var(--accent)" /> API Endpoints Reference
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                label: 'VIN Decode',
                url: 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{VIN}?format=json',
                desc: 'Returns vehicle specifications for a given 17-digit VIN.'
              },
              {
                label: 'Safety Recalls',
                url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make={MAKE}&model={MODEL}&modelYear={YEAR}',
                desc: 'Returns all safety recall campaigns for a specific vehicle.'
              },
              {
                label: 'Consumer Complaints',
                url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make={MAKE}&model={MODEL}&modelYear={YEAR}',
                desc: 'Returns ODI consumer safety complaints for a specific vehicle.'
              },
              {
                label: 'Models by Make/Year',
                url: 'https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/{MAKE}/modelyear/{YEAR}?format=json',
                desc: 'Returns all available models for a given make and model year.'
              },
            ].map(ep => (
              <div key={ep.label} style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="tag tag-blue">{ep.label}</span>
                </div>
                <code style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {ep.url}
                </code>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 6 }}>{ep.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
