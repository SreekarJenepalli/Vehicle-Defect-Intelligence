import React, { useState } from 'react';
import { Car } from 'lucide-react';

// All logos are served locally from /public/brand-logos/ — no external network needed
const KNOWN_BRANDS = new Set([
  'acura', 'alfa romeo', 'audi', 'bmw', 'buick', 'cadillac', 'chevrolet',
  'chrysler', 'dodge', 'ferrari', 'fiat', 'ford', 'genesis', 'gmc', 'honda',
  'hyundai', 'infiniti', 'jaguar', 'jeep', 'kia', 'lamborghini', 'land rover',
  'lexus', 'lincoln', 'maserati', 'mazda', 'mercedes-benz', 'mini', 'mitsubishi',
  'nissan', 'porsche', 'ram', 'rolls-royce', 'subaru', 'tesla', 'toyota',
  'volkswagen', 'volvo',
]);

function getLogoUrl(brand: string): string | null {
  const key = brand.toLowerCase().trim();
  if (!KNOWN_BRANDS.has(key)) return null;
  return `/brand-logos/${key}.png`;
}

interface BrandLogoProps {
  brand: string;
  size?: number;
  pill?: boolean;
}

export default function BrandLogo({ brand, size = 40, pill = true }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getLogoUrl(brand);
  const iconSize = Math.round(size * 0.45);

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...(pill ? {
      background: '#ffffff',
      borderRadius: 8,
      padding: 4,
      boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
    } : {}),
  };

  if (!logoUrl || imgError) {
    return (
      <div style={containerStyle}>
        <Car size={iconSize} color={pill ? '#334155' : '#ffffff'} />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <img
        src={logoUrl}
        alt={brand}
        onError={() => setImgError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}
