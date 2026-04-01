import type { SimParams } from '../types';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  hint?: string;
}

function SliderRow({ label, value, min, max, step, unit, onChange, hint }: SliderRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-blue-700 tabular-nums">
          {value.toFixed(step < 1 ? 1 : 0)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600"
      />
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

interface NumberInputRowProps {
  label: string;
  value: number;
  min?: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
}

function NumberInputRow({ label, value, min = 0, step = 1000, unit, onChange }: NumberInputRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm font-medium text-gray-700 flex-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm tabular-nums focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <span className="text-xs text-gray-500 w-8">{unit}</span>
      </div>
    </div>
  );
}

interface Props {
  params: SimParams;
  onChange: (updated: SimParams) => void;
}

export function ParameterPanel({ params, onChange }: Props) {
  function set<K extends keyof SimParams>(key: K, value: SimParams[K]) {
    onChange({ ...params, [key]: value });
  }

  return (
    <div className="space-y-6">
      {/* Property */}
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Nieruchomość
        </h3>
        <NumberInputRow
          label="Cena mieszkania"
          value={params.homePricePln}
          step={5000}
          unit="PLN"
          onChange={v => set('homePricePln', v)}
        />
        <NumberInputRow
          label="Czynsz miesięczny"
          value={params.monthlyRentPln}
          step={100}
          unit="PLN"
          onChange={v => set('monthlyRentPln', v)}
        />
        <SliderRow
          label="Powierzchnia"
          value={params.apartmentSizeSqm}
          min={20}
          max={150}
          step={5}
          unit=" m²"
          onChange={v => set('apartmentSizeSqm', v)}
        />
        <SliderRow
          label="Wkład własny"
          value={params.downPaymentPct * 100}
          min={10}
          max={80}
          step={5}
          unit="%"
          onChange={v => set('downPaymentPct', v / 100)}
          hint="Minimum 20% wymagane przez większość banków"
        />
        <SliderRow
          label="Okres kredytu"
          value={params.loanTermYears}
          min={5}
          max={35}
          step={5}
          unit=" lat"
          onChange={v => set('loanTermYears', v)}
        />
      </section>

      {/* Rates */}
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Założenia finansowe (średnie)
        </h3>
        <SliderRow
          label="Oprocentowanie kredytu"
          value={params.mortgageRatePct}
          min={2}
          max={15}
          step={0.5}
          unit="%"
          onChange={v => set('mortgageRatePct', v)}
          hint="Aktualne oprocentowanie stałe w PL: ~6–8%"
        />
        <SliderRow
          label="Wzrost cen nieruchomości"
          value={params.propertyAppreciationPct}
          min={-2}
          max={12}
          step={0.5}
          unit="%/rok"
          onChange={v => set('propertyAppreciationPct', v)}
        />
        <SliderRow
          label="Wzrost czynszów"
          value={params.rentGrowthPct}
          min={0}
          max={10}
          step={0.5}
          unit="%/rok"
          onChange={v => set('rentGrowthPct', v)}
        />
        <SliderRow
          label="Zwrot z inwestycji"
          value={params.investmentReturnPct}
          min={0}
          max={15}
          step={0.5}
          unit="%/rok"
          onChange={v => set('investmentReturnPct', v)}
          hint="Np. ETF globalny: ~7–8% historycznie"
        />
      </section>

      {/* Costs */}
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Koszty właściciela
        </h3>
        <SliderRow
          label="Podatek i opłaty (rocznie)"
          value={params.propertyTaxAndFeesPct}
          min={0.1}
          max={2}
          step={0.1}
          unit="% wartości"
          onChange={v => set('propertyTaxAndFeesPct', v)}
        />
        <SliderRow
          label="Utrzymanie i remonty"
          value={params.maintenancePct}
          min={0.1}
          max={3}
          step={0.1}
          unit="% wartości"
          onChange={v => set('maintenancePct', v)}
        />
      </section>
    </div>
  );
}
