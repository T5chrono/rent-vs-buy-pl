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

// Precise to nearest 1 PLN — used in tooltips and summary cards
export function formatPLNPrecise(value: number): string {
  return plnFormatter.format(Math.round(value));
}

// Y-axis label: compact in thousands, no currency symbol to save space
export function formatPLNAxis(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    const tys = Math.round(abs / 1_000);
    // e.g. 5 523 tys.
    return `${sign}${new Intl.NumberFormat('pl-PL').format(tys)} tys.`;
  }
  if (abs >= 1_000) {
    return `${sign}${Math.round(abs / 1_000)} tys.`;
  }
  return `${sign}${Math.round(abs)} zł`;
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatYear(year: number | null): string {
  if (year === null) return 'Nigdy';
  if (year === 0) return 'Rok 0';
  return `Rok ${year}`;
}
