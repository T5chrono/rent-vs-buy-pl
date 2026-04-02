import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { SimulationResult } from '../types';

interface Props {
  result: SimulationResult;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800">
        {label === 'Nigdy' ? 'Nigdy nie osiąga progu' : `Rok ${label}`}
      </p>
      <p className="text-gray-600">Liczba symulacji: {payload[0].value}</p>
    </div>
  );
}

export function BreakevenChart({ result }: Props) {
  const { breakevenHistogram, neverBreaksEven, medianBreakevenYear } = result;

  const data = [
    ...breakevenHistogram.map(d => ({ year: String(d.year), count: d.count })),
    ...(neverBreaksEven > 0 ? [{ year: 'Nigdy', count: neverBreaksEven }] : []),
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-gray-800">
        Rozkład roku progu opłacalności
      </h2>
      <p className="text-xs text-gray-500">
        Liczba symulacji (z 1 000), w których kupno zaczyna przewyższać najem w danym roku.
      </p>
      <div style={{ width: '100%', height: 256 }}>
        <ResponsiveContainer width="100%" height={256}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            {medianBreakevenYear && (
              <ReferenceLine
                x={String(medianBreakevenYear)}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 2"
                label={{ value: 'Mediana', position: 'top', fontSize: 10, fill: '#b45309' }}
              />
            )}
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={entry.year === 'Nigdy' ? '#fca5a5' : '#60a5fa'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {neverBreaksEven > 0 && (
        <p className="text-xs text-red-600 font-medium">
          W {neverBreaksEven} z 1 000 symulacji kupno nigdy nie okazuje się korzystniejsze w przyjętym horyzoncie.
        </p>
      )}
    </div>
  );
}
