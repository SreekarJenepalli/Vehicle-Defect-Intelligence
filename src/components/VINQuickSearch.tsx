import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { decodeVIN } from '../api/nhtsa';

interface VINQuickSearchProps {
  onDecoded: (make: string, model: string, year: string) => void;
}

export default function VINQuickSearch({ onDecoded }: VINQuickSearchProps) {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [decoded, setDecoded] = useState<{ make: string; model: string; year: string } | null>(null);

  const handleDecode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = vin.trim().toUpperCase();
    if (trimmed.length !== 17) {
      setError('VIN must be exactly 17 characters.');
      return;
    }
    setLoading(true);
    setError('');
    setDecoded(null);
    try {
      const result = await decodeVIN(trimmed);
      if (!result.make || !result.model || !result.modelYear) {
        setError('Could not decode vehicle info from this VIN. Try entering make/model/year manually.');
        return;
      }
      setDecoded({ make: result.make, model: result.model, year: result.modelYear });
      onDecoded(result.make, result.model, result.modelYear);
    } catch {
      setError('Failed to decode VIN. Please check the VIN and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setVin('');
    setDecoded(null);
    setError('');
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
      border: '1.5px solid #bfdbfe',
      borderRadius: 12,
      padding: '16px 20px',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Search size={14} color="var(--accent)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
          Auto-fill from VIN
        </span>
        <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
          — decode a VIN to populate make, model & year automatically
        </span>
      </div>

      <form onSubmit={handleDecode} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          className="input"
          placeholder="Enter 17-character VIN…"
          value={vin}
          onChange={e => { setVin(e.target.value.toUpperCase()); setError(''); setDecoded(null); }}
          style={{ fontFamily: 'monospace', letterSpacing: 1, maxWidth: 320, fontSize: 13 }}
          maxLength={17}
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || vin.trim().length !== 17}
          style={{ padding: '9px 18px', fontSize: 13 }}
        >
          {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <ChevronRight size={15} />}
          {loading ? 'Decoding…' : 'Decode & Fill'}
        </button>
        {(decoded || vin) && (
          <button type="button" onClick={handleClear} className="btn btn-secondary" style={{ padding: '9px 14px', fontSize: 12 }}>
            Clear
          </button>
        )}
        <span style={{ fontSize: 12, color: vin.length === 17 ? 'var(--success)' : 'var(--gray-300)', fontWeight: 500, minWidth: 36 }}>
          {vin.length}/17
        </span>
      </form>

      <AnimatePresence>
        {decoded && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--success)',
              fontWeight: 500,
            }}
          >
            <CheckCircle size={15} />
            Filled: <strong>{decoded.year} {decoded.make} {decoded.model}</strong>
            <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>— fields updated below</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--danger)',
            }}
          >
            <AlertTriangle size={14} /> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
