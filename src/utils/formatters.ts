const plnFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatPLN(value: number): string {
  return plnFormatter.format(value);
}

export function formatPLNCompact(value: number): string {
  return compactFormatter.format(value);
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatYear(year: number | null): string {
  if (year === null) return 'Nigdy';
  if (year === 0) return 'Rok 0';
  return `Rok ${year}`;
}
