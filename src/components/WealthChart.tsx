import { useState } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { SimulationResult } from '../types';
import { formatPLNAxis, formatPLNPrecise } from '../utils/formatters';

type ViewMode = 'both' | 'buy' | 'rent';

interface Props {
  result: SimulationResult;
  horizonYears: number;
}

function yTickFormatter(value: number) {
  return formatPLNAxis(value);
}

function LegendRow({ name, lineColor, midColor, lightColor }: {
  name?: string; lineColor: string; midColor: string; lightColor: string;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap text-xs text-gray-600">
      {name && <span className="font-semibold w-12 shrink-0" style={{ color: lineColor }}>{name}</span>}
      <span className="flex items-center gap-1.5">
        <span style={{ display: 'inline-block', width: 22, height: 3, background: lineColor, borderRadius: 2 }} />
        Mediana (p50)
      </span>
      <span className="flex items-center gap-1.5">
        <span style={{ display: 'inline-block', width: 14, height: 12, background: midColor, borderRadius: 2 }} />
        p25–p75 <span className="text-gray-400 ml-0.5">— połowa symulacji w tym przedziale</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span style={{ display: 'inline-block', width: 14, height: 12, background: lightColor, borderRadius: 2, opacity: 0.55 }} />
        p5–p95 <span className="text-gray-400 ml-0.5">— 90% symulacji w tym przedziale</span>
      </span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const buy = payload.find((p: { dataKey: string }) => p.dataKey === 'buyP50')?.value;
  const rent = payload.find((p: { dataKey: string }) => p.dataKey === 'rentP50')?.value;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm space-y-1">
      <p className="font-semibold text-gray-800">Rok {label}</p>
      {buy !== undefined && (
        <p className="text-blue-700">
          <span className="font-medium">Kupno (p50):</span> {formatPLNPrecise(buy)}
        </p>
      )}
      {rent !== undefined && (
        <p className="text-emerald-700">
          <span className="font-medium">Najem (p50):</span> {formatPLNPrecise(rent)}
        </p>
      )}
    </div>
  );
}

export function WealthChart({ result, horizonYears }: Props) {
  const { yearlyData, medianBreakevenYear } = result;
  const [view, setView] = useState<ViewMode>('both');

  const showBuy = view === 'both' || view === 'buy';
  const showRent = view === 'both' || view === 'rent';

  const btnBase = 'px-3 py-1 rounded-full text-xs font-medium transition-colors';
  const btnActive = (active: boolean, color: string) =>
    active ? `${color} text-white` : 'bg-gray-100 text-gray-500 hover:bg-gray-200';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-base font-semibold text-gray-800">
          Wartość netto w czasie — symulacja {horizonYears} lat
        </h2>
        <div className="flex gap-1.5">
          <button className={`${btnBase} ${btnActive(view === 'both', 'bg-gray-500')}`} onClick={() => setView('both')}>Oba</button>
          <button className={`${btnBase} ${btnActive(view === 'buy', 'bg-blue-600')}`} onClick={() => setView('buy')}>Kupno</button>
          <button className={`${btnBase} ${btnActive(view === 'rent', 'bg-emerald-600')}`} onClick={() => setView('rent')}>Najem</button>
        </div>
      </div>
      <div className="flex flex-col gap-1 pt-0.5">
        {showBuy && (
          <LegendRow
            name={view === 'both' ? 'Kupno' : undefined}
            lineColor="#2563eb"
            midColor="#93c5fd"
            lightColor="#bfdbfe"
          />
        )}
        {showRent && (
          <LegendRow
            name={view === 'both' ? 'Najem' : undefined}
            lineColor="#059669"
            midColor="#6ee7b7"
            lightColor="#a7f3d0"
          />
        )}
        <p className="text-xs text-gray-400 mt-0.5">1 000 iteracji Monte Carlo · zyski po podatku Belki (19%)</p>
      </div>
      <div style={{ width: '100%', height: 384 }}>
        <ResponsiveContainer width="100%" height={384}>
          <ComposedChart data={yearlyData} margin={{ top: 28, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="year"
              label={{ value: 'Rok', position: 'insideBottom', offset: -2, fontSize: 12 }}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickFormatter={yTickFormatter}
              tick={{ fontSize: 11 }}
              width={72}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* BUY bands */}
            {showBuy && <Area type="monotone" dataKey="buyP95" stroke="none" fill="#bfdbfe" fillOpacity={0.4} name="buyBand95" legendType="none" isAnimationActive={false} />}
            {showBuy && <Area type="monotone" dataKey="buyP5" stroke="none" fill="#ffffff" fillOpacity={1} name="buyBand95_bottom" legendType="none" isAnimationActive={false} />}
            {showBuy && <Area type="monotone" dataKey="buyP75" stroke="none" fill="#93c5fd" fillOpacity={0.5} name="buyBand75" legendType="none" isAnimationActive={false} />}
            {showBuy && <Area type="monotone" dataKey="buyP25" stroke="none" fill="#ffffff" fillOpacity={1} name="buyBand75_bottom" legendType="none" isAnimationActive={false} />}

            {/* RENT bands */}
            {showRent && <Area type="monotone" dataKey="rentP95" stroke="none" fill="#a7f3d0" fillOpacity={0.4} name="rentBand95" legendType="none" isAnimationActive={false} />}
            {showRent && <Area type="monotone" dataKey="rentP5" stroke="none" fill="#ffffff" fillOpacity={1} name="rentBand95_bottom" legendType="none" isAnimationActive={false} />}
            {showRent && <Area type="monotone" dataKey="rentP75" stroke="none" fill="#6ee7b7" fillOpacity={0.5} name="rentBand75" legendType="none" isAnimationActive={false} />}
            {showRent && <Area type="monotone" dataKey="rentP25" stroke="none" fill="#ffffff" fillOpacity={1} name="rentBand75_bottom" legendType="none" isAnimationActive={false} />}

            {/* Median lines */}
            {showBuy && <Line type="monotone" dataKey="buyP50" stroke="#2563eb" strokeWidth={2.5} dot={false} name="buyP50" isAnimationActive={false} />}
            {showRent && <Line type="monotone" dataKey="rentP50" stroke="#059669" strokeWidth={2.5} dot={false} name="rentP50" isAnimationActive={false} />}

            {/* Breakeven reference line */}
            {medianBreakevenYear && (
              <ReferenceLine
                x={medianBreakevenYear}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{
                  value: `Próg: Rok ${medianBreakevenYear} ▲`,
                  position: 'insideTopLeft',
                  offset: 6,
                  fontSize: 11,
                  fill: '#b45309',
                  fontWeight: 600,
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
