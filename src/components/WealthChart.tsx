import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { SimulationResult } from '../types';
import { formatPLNCompact, formatPLN } from '../utils/formatters';

interface Props {
  result: SimulationResult;
}

function yTickFormatter(value: number) {
  return formatPLNCompact(value);
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
          <span className="font-medium">Kupno (p50):</span> {formatPLN(buy)}
        </p>
      )}
      {rent !== undefined && (
        <p className="text-emerald-700">
          <span className="font-medium">Najem (p50):</span> {formatPLN(rent)}
        </p>
      )}
    </div>
  );
}

export function WealthChart({ result }: Props) {
  const { yearlyData, medianBreakevenYear } = result;

  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-gray-800">
        Wartość netto w czasie — 30-letnia symulacja
      </h2>
      <p className="text-xs text-gray-500">
        Obszary — przedziały p5–p95 i p25–p75. Linie — mediana (p50). 1 000 iteracji.
      </p>
      <div className="h-72 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={yearlyData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
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
            <Legend
              formatter={(value) => {
                const labels: Record<string, string> = {
                  buyBand95: 'Kupno p5–p95',
                  buyBand75: 'Kupno p25–p75',
                  buyP50: 'Kupno mediana',
                  rentBand95: 'Najem p5–p95',
                  rentBand75: 'Najem p25–p75',
                  rentP50: 'Najem mediana',
                };
                return labels[value] ?? value;
              }}
              wrapperStyle={{ fontSize: 11 }}
            />

            {/* BUY bands */}
            <Area
              type="monotone"
              dataKey="buyP95"
              stroke="none"
              fill="#bfdbfe"
              fillOpacity={0.4}
              name="buyBand95"
              legendType="none"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="buyP5"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
              name="buyBand95_bottom"
              legendType="none"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="buyP75"
              stroke="none"
              fill="#93c5fd"
              fillOpacity={0.5}
              name="buyBand75"
              legendType="none"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="buyP25"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
              name="buyBand75_bottom"
              legendType="none"
              isAnimationActive={false}
            />

            {/* RENT bands */}
            <Area
              type="monotone"
              dataKey="rentP95"
              stroke="none"
              fill="#a7f3d0"
              fillOpacity={0.4}
              name="rentBand95"
              legendType="none"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="rentP5"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
              name="rentBand95_bottom"
              legendType="none"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="rentP75"
              stroke="none"
              fill="#6ee7b7"
              fillOpacity={0.5}
              name="rentBand75"
              legendType="none"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="rentP25"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
              name="rentBand75_bottom"
              legendType="none"
              isAnimationActive={false}
            />

            {/* Median lines */}
            <Line
              type="monotone"
              dataKey="buyP50"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              name="buyP50"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="rentP50"
              stroke="#059669"
              strokeWidth={2.5}
              dot={false}
              name="rentP50"
              isAnimationActive={false}
            />

            {/* Breakeven reference line */}
            {medianBreakevenYear && (
              <ReferenceLine
                x={medianBreakevenYear}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{
                  value: `Próg opłacalności: Rok ${medianBreakevenYear}`,
                  position: 'top',
                  fontSize: 11,
                  fill: '#b45309',
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
