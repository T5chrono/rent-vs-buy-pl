import { useState } from 'react';
import { cityKeyFromZip } from '../data/zipCityMap';
import { cityPrices } from '../data/cityPrices';
import type { CityData } from '../types';

interface Props {
  onCityResolved: (data: CityData) => void;
}

export function ZipInput({ onCityResolved }: Props) {
  const [zip, setZip] = useState('');
  const [resolved, setResolved] = useState<CityData | null>(null);
  const [error, setError] = useState('');

  function handleChange(raw: string) {
    // Auto-format: insert dash after 2 digits
    let val = raw.replace(/[^0-9]/g, '');
    if (val.length > 5) val = val.slice(0, 5);
    if (val.length > 2) val = val.slice(0, 2) + '-' + val.slice(2);
    setZip(val);
    setError('');

    const digits = val.replace(/\D/g, '');
    if (digits.length === 5) {
      const key = cityKeyFromZip(digits);
      const data = cityPrices[key] ?? cityPrices['default'];
      setResolved(data);
      onCityResolved(data);
    } else {
      setResolved(null);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Kod pocztowy
      </label>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={zip}
          onChange={e => handleChange(e.target.value)}
          placeholder="np. 00-001"
          maxLength={6}
          className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-base font-mono tracking-widest shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {resolved && (
          <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-blue-200">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.69 2.31a1 1 0 0 1 .62 0l7 2.5A1 1 0 0 1 18 5.75v8.5a1 1 0 0 1-.69.95l-7 2.5a1 1 0 0 1-.62 0l-7-2.5A1 1 0 0 1 2 14.25v-8.5a1 1 0 0 1 .69-.95l7-2.5ZM10 4.32 4 6.5v7l6 2.14 6-2.14v-7l-6-2.18Z" clipRule="evenodd" />
            </svg>
            {resolved.city}
            {resolved.voivodeship && (
              <span className="text-blue-400 font-normal">· {resolved.voivodeship}</span>
            )}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-gray-400">
        Dane cenowe na podstawie raportu NBP BaRN (Q3 2025) i GUS BDL.
      </p>
    </div>
  );
}
