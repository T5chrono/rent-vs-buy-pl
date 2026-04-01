import type { SimulationResult } from '../types';
import { formatPLNCompact, formatYear } from '../utils/formatters';

interface Props {
  result: SimulationResult;
}

interface CardProps {
  title: string;
  value: string;
  sub?: string;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

function Card({ title, value, sub, color }: CardProps) {
  const colors = {
    blue: 'bg-blue-50 ring-blue-200 text-blue-700',
    green: 'bg-emerald-50 ring-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 ring-amber-200 text-amber-700',
    purple: 'bg-purple-50 ring-purple-200 text-purple-700',
  };
  return (
    <div className={`rounded-xl p-4 ring-1 ${colors[color]} flex flex-col gap-1`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{title}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs opacity-60">{sub}</p>}
    </div>
  );
}

export function SummaryCards({ result }: Props) {
  const { medianBreakevenYear, probBuyWins, buyFinalP50, rentFinalP50 } = result;
  const buyBetter = buyFinalP50 > rentFinalP50;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card
        title="Mediana progu opłacalności"
        value={formatYear(medianBreakevenYear)}
        sub={medianBreakevenYear ? `Kupno zaczyna wygrywać po ${medianBreakevenYear} latach` : 'Kupno nie wychodzi korzystniej w 30 latach'}
        color="blue"
      />
      <Card
        title="Kupno wygrywa w"
        value={`${Math.round(probBuyWins * 100)}%`}
        sub="symulacji Monte Carlo (30 lat)"
        color={probBuyWins >= 0.5 ? 'green' : 'amber'}
      />
      <Card
        title="Majątek po 30 latach — kupno (p50)"
        value={formatPLNCompact(buyFinalP50)}
        sub="Mediana wartości netto"
        color={buyBetter ? 'green' : 'amber'}
      />
      <Card
        title="Majątek po 30 latach — najem (p50)"
        value={formatPLNCompact(rentFinalP50)}
        sub="Mediana portfela + zainwestowane oszczędności"
        color={!buyBetter ? 'green' : 'amber'}
      />
    </div>
  );
}
