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
  hint?: string;
}

function NumberInputRow({ label, value, min = 0, step = 1000, unit, onChange, hint }: NumberInputRowProps) {
  return (
    <div className="space-y-0.5">
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
          <span className="text-xs text-gray-500 w-12">{unit}</span>
        </div>
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
      {children}
    </h3>
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

      {/* ── Property ─────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader>Nieruchomość</SectionHeader>
        <NumberInputRow
          label="Cena mieszkania"
          value={params.homePricePln}
          step={5000}
          unit="PLN"
          onChange={v => set('homePricePln', v)}
        />
        <NumberInputRow
          label="Czynsz najmu"
          value={params.monthlyRentPln}
          step={100}
          unit="PLN/mies."
          onChange={v => set('monthlyRentPln', v)}
        />
        <SliderRow
          label="Powierzchnia"
          value={params.apartmentSizeSqm}
          min={20} max={150} step={5}
          unit=" m²"
          onChange={v => set('apartmentSizeSqm', v)}
        />
      </section>

      {/* ── Your finances ────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader>Twoje finanse</SectionHeader>
        <NumberInputRow
          label="Oszczędności (K₀)"
          value={params.startingCapitalPln}
          step={10000}
          unit="PLN"
          onChange={v => set('startingCapitalPln', v)}
          hint="Całkowity kapitał początkowy do alokacji"
        />
        <NumberInputRow
          label="Budżet miesięczny"
          value={params.monthlyBudgetPln}
          step={250}
          unit="PLN/mies."
          onChange={v => set('monthlyBudgetPln', v)}
          hint="Taki sam dla obu ścieżek — nadwyżka jest inwestowana"
        />
      </section>

      {/* ── Purchase structure ────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader>Zakup</SectionHeader>
        <SliderRow
          label="Wkład własny"
          value={params.downPaymentPct * 100}
          min={10} max={80} step={5}
          unit="%"
          onChange={v => set('downPaymentPct', v / 100)}
          hint="Min. 20% wymagane przez większość banków"
        />
        <SliderRow
          label="Koszty transakcyjne"
          value={params.transactionCostPct * 100}
          min={0} max={10} step={0.5}
          unit="% ceny"
          onChange={v => set('transactionCostPct', v / 100)}
          hint="PCC 2%, notariusz, pośrednik — razem 4–6% (rynek wtórny)"
        />
        <NumberInputRow
          label="Koszt wykończenia"
          value={params.renovationCostPln}
          step={5000}
          unit="PLN"
          onChange={v => set('renovationCostPln', v)}
          hint="Stan deweloperski → gotowy: 2 000–3 500 PLN/m² (0 dla wtórnego)"
        />
        <SliderRow
          label="Okres kredytu"
          value={params.loanTermYears}
          min={5} max={35} step={1}
          unit=" lat"
          onChange={v => set('loanTermYears', v)}
        />
        <SliderRow
          label="Oprocentowanie kredytu (średnie)"
          value={params.mortgageRatePct}
          min={2} max={15} step={0.5}
          unit="%"
          onChange={v => set('mortgageRatePct', v)}
          hint="Stopa stała na 5 lat, potem reset — aktualnie ~6–8% w PL"
        />
        <SliderRow
          label="Reset stopy co"
          value={params.rateResetPeriodYears}
          min={1} max={10} step={1}
          unit=" lat"
          onChange={v => set('rateResetPeriodYears', v)}
          hint="Typowy okres stałej stopy procentowej w PL: 5 lat"
        />
        <SliderRow
          label="Nadpłacanie kredytu"
          value={params.overpaymentPct * 100}
          min={0} max={100} step={10}
          unit="% nadwyżki"
          onChange={v => set('overpaymentPct', v / 100)}
          hint="Reszta nadwyżki jest inwestowana (np. ETF)"
        />
      </section>

      {/* ── Owner running costs ──────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader>Koszty właściciela (mies.)</SectionHeader>
        <NumberInputRow
          label="Czynsz administracyjny"
          value={params.adminFeesPerSqm}
          step={1}
          unit="PLN/m²"
          onChange={v => set('adminFeesPerSqm', v)}
          hint="Opłata do wspólnoty/spółdzielni — typowo 12–25 PLN/m²"
        />
        <NumberInputRow
          label="Rezerwa remontowa"
          value={params.maintenancePerSqm}
          step={0.5}
          unit="PLN/m²"
          onChange={v => set('maintenancePerSqm', v)}
          hint="Własny fundusz na naprawy — typowo 2–5 PLN/m²"
        />
      </section>

      {/* ── Market assumptions ───────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader>Założenia rynkowe (średnie roczne)</SectionHeader>
        <SliderRow
          label="Wzrost cen nieruchomości"
          value={params.propertyAppreciationPct}
          min={-2} max={12} step={0.5}
          unit="%"
          onChange={v => set('propertyAppreciationPct', v)}
        />
        <SliderRow
          label="Wzrost czynszów"
          value={params.rentGrowthPct}
          min={0} max={10} step={0.5}
          unit="%"
          onChange={v => set('rentGrowthPct', v)}
        />
        <SliderRow
          label="Zwrot z inwestycji (ETF)"
          value={params.investmentReturnPct}
          min={0} max={15} step={0.5}
          unit="%"
          onChange={v => set('investmentReturnPct', v)}
          hint="Globalny ETF: ~7–8% historycznie, σ ≈ 15%"
        />
        <SliderRow
          label="Inflacja"
          value={params.inflationPct}
          min={0} max={10} step={0.5}
          unit="%"
          onChange={v => set('inflationPct', v)}
          hint="Waloryzuje czynsz adm. i koszty utrzymania"
        />
      </section>

      {/* ── Simulation ───────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader>Symulacja</SectionHeader>
        <SliderRow
          label="Horyzont"
          value={params.horizonYears}
          min={5} max={35} step={1}
          unit=" lat"
          onChange={v => set('horizonYears', v)}
        />
      </section>
    </div>
  );
}
