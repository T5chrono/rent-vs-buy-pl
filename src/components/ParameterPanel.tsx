import { useState, useRef, useEffect } from 'react';
import type { SimParams } from '../types';

// ── Info tooltip (fixed-position to escape overflow:auto parent) ───────
function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (iconRef.current) {
      const r = iconRef.current.getBoundingClientRect();
      setPos({
        top: r.top - 8,          // 8px gap above icon
        left: r.left + r.width / 2,
      });
    }
    setVisible(true);
  }

  function hide() {
    timerRef.current = setTimeout(() => setVisible(false), 80);
  }

  // Cancel hide if pointer moves back onto the bubble
  function cancelHide() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <>
      <span
        ref={iconRef}
        className="ml-1 inline-flex items-center align-middle cursor-help"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <svg
          className="h-3.5 w-3.5 text-gray-400 hover:text-blue-500 transition-colors"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
      </span>

      {/* Rendered at <body> level via fixed positioning — never clipped by overflow */}
      {visible && (
        <span
          className="fixed z-[9999] w-64 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white leading-relaxed shadow-xl pointer-events-auto"
          style={{
            bottom: `calc(100vh - ${pos.top}px)`,
            left: `${pos.left}px`,
            transform: 'translateX(-50%)',
          }}
          onMouseEnter={cancelHide}
          onMouseLeave={hide}
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </>
  );
}

// ── Slider row ─────────────────────────────────────────────────────────
interface SliderRowProps {
  label: string;
  info: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  hint?: string;
}

function SliderRow({ label, info, value, min, max, step, unit, onChange, hint }: SliderRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          {label}
          <InfoTooltip text={info} />
        </label>
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

// ── Number input row ───────────────────────────────────────────────────
interface NumberInputRowProps {
  label: string;
  info: string;
  value: number;
  min?: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
  hint?: string;
}

function NumberInputRow({ label, info, value, min = 0, step = 1000, unit, onChange, hint }: NumberInputRowProps) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-gray-700 flex-1 flex items-center">
          {label}
          <InfoTooltip text={info} />
        </label>
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

// ── Tooltip descriptions ───────────────────────────────────────────────
const TIP = {
  homePrice:
    'Wartość rynkowa mieszkania w chwili zakupu. Pobierana automatycznie z danych NBP/GUS dla wybranego kodu pocztowego, ale możesz ją zmienić ręcznie.',
  monthlyRent:
    'Miesięczna kwota płacona wynajmującemu (czynsz najmu + czynsz adm. łącznie). Pobierana z danych rynkowych dla danego miasta. W modelu to pełny koszt mieszkania dla najemcy.',
  size:
    'Metraż mieszkania. Zmiana metrażu automatycznie przelicza cenę i czynsz na podstawie stawek za m² dla wybranego miasta.',
  startingCapital:
    'Całkowity kapitał, który masz dziś do dyspozycji. Kupujący przeznacza go na wkład własny + koszty transakcyjne + ewentualne wykończenie — reszta trafia do portfela ETF. Najemca inwestuje całość od pierwszego dnia.',
  monthlyBudget:
    'Kwota, którą co miesiąc możesz przeznaczyć na cele mieszkaniowe + inwestycje — czyli to, co zostaje Ci po opłaceniu wszystkich kosztów życia (jedzenie, transport, rozrywka itp.). Obie ścieżki (najem i kupno) korzystają z TEGO SAMEGO budżetu, co zapewnia uczciwe porównanie. Nadwyżka budżetu ponad koszty mieszkaniowe jest inwestowana.',
  downPayment:
    'Procent wartości mieszkania płacony gotówką przy zakupie. Wyższy wkład = mniejszy kredyt i niższe raty. Banki w Polsce wymagają minimum 10–20% (przy 10% konieczne jest ubezpieczenie niskiego wkładu).',
  transactionCost:
    'Jednorazowe koszty zakupu: PCC 2% (rynek wtórny) lub 0% (rynek pierwotny od dewelopera), taksa notarialna ~0,5–1%, prowizja pośrednika 1–3%. Łącznie ok. 4–6% dla rynku wtórnego i 2–4% dla pierwotnego.',
  renovationCost:
    'Jednorazowy koszt wykończenia od stanu deweloperskiego (gołe ściany) do stanu gotowego do zamieszkania. Rynek pierwotny w Polsce: 2 000–3 500 PLN/m². Dla rynku wtórnego wpisz 0 (mieszkanie jest już wykończone).',
  loanTerm:
    'Liczba lat do pełnej spłaty kredytu hipotecznego. Dłuższy okres = niższe raty miesięczne, ale wyższy całkowity koszt odsetkowy. Maksymalny okres w Polsce: zwykle 35 lat.',
  mortgageRate:
    'Średnie nominalne oprocentowanie kredytu hipotecznego. W Polsce standardem są kredyty ze stałą stopą na 5 lat, następnie reset do aktualnych warunków rynkowych. Aktualne oprocentowanie stałe: 6–8% (2025/2026). Model przy każdym resecie losuje nową stopę z rozkładu normalnego (σ ≈ 1,5%).',
  rateReset:
    'Co ile lat bank resetuje oprocentowanie (koniec okresu stałej stopy). Po tym czasie refinansujesz lub przechodzisz na nową stawkę. Standard w Polsce: 5 lat. Zmiana stopy na początku nowego okresu może zwiększyć lub zmniejszyć Twoje raty.',
  overpayment:
    'Jaki procent miesięcznej nadwyżki (budżet minus koszty mieszkaniowe) przeznaczasz na wcześniejszą spłatę kapitału kredytu. Nadpłata gwarantuje stopę zwrotu równą oprocentowaniu kredytu (bez ryzyka), zmniejsza przyszłe raty i skraca okres spłaty. Reszta nadwyżki trafia do portfela ETF. 0% = całość inwestujesz, 100% = nadpłacasz maksymalnie.',
  adminFees:
    'Miesięczna opłata do wspólnoty mieszkaniowej lub spółdzielni za zarządzanie budynkiem, fundusz remontowy części wspólnych, ubezpieczenie budynku itp. Wyrażona w PLN/m² i waloryzowana rocznie o inflację. Typowe wartości w Polsce: 12–25 PLN/m².',
  maintenance:
    'Miesięczne odkładanie na własne naprawy i remonty samego lokalu (nie części wspólnych). Np. wymiana sprzętu AGD, malowanie, naprawa instalacji. Waloryzowane o inflację. Typowo 2–5 PLN/m².',
  appreciation:
    'Średnioroczny nominalny wzrost wartości mieszkania. Historycznie w Polsce (2010–2024): ok. 5–8% w dużych miastach. Model losuje nową wartość dla każdego roku osobno (σ ≈ 6%), więc w jednych latach ceny mogą spadać, w innych gwałtownie rosnąć.',
  rentGrowth:
    'Średnioroczny wzrost stawek czynszu najmu. Historycznie zbliżony do inflacji lub nieco powyżej (3–5%). Wyższy wzrost czynszów faworyzuje scenariusz zakupu. Model losuje co rok (σ ≈ 3%).',
  investReturn:
    'Oczekiwany średnioroczny nominalny zwrot z portfela inwestycyjnego (np. globalny ETF akcyjny jak VWCE). Historyczne dane: S&P 500 ~10%, globalny rynek ~7–8% nominalnie. WAŻNE: model losuje co rok z σ ≈ 15% (duża zmienność roczna), co symuluje ryzyko sekwencji zwrotów. Zyski pomniejszone o podatek Belki 19%.',
  inflation:
    'Średnioroczna stopa inflacji CPI. Używana wyłącznie do waloryzacji kosztów administracyjnych i rezerwy remontowej (nie deflacyjnie koryguje całego modelu — wszystkie wartości są nominalne). Model losuje co rok (σ ≈ 1,5%).',
  horizon:
    'Liczba lat, dla których przeprowadzana jest symulacja. Zmiana horyzontu przesuwa punkt porównania majątku. Przy krótszym horyzoncie koszty wejścia (kredyt, koszty transakcyjne) ważą więcej; przy dłuższym dominuje efekt złożonego wzrostu wartości.',
};

// ── Main panel ─────────────────────────────────────────────────────────
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
          info={TIP.homePrice}
          value={params.homePricePln}
          step={5000}
          unit="PLN"
          onChange={v => set('homePricePln', v)}
        />
        <NumberInputRow
          label="Czynsz najmu"
          info={TIP.monthlyRent}
          value={params.monthlyRentPln}
          step={100}
          unit="PLN/mies."
          onChange={v => set('monthlyRentPln', v)}
        />
        <SliderRow
          label="Powierzchnia"
          info={TIP.size}
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
          info={TIP.startingCapital}
          value={params.startingCapitalPln}
          step={10000}
          unit="PLN"
          onChange={v => set('startingCapitalPln', v)}
        />
        <NumberInputRow
          label="Budżet miesięczny"
          info={TIP.monthlyBudget}
          value={params.monthlyBudgetPln}
          step={250}
          unit="PLN/mies."
          onChange={v => set('monthlyBudgetPln', v)}
        />
      </section>

      {/* ── Purchase ─────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader>Zakup</SectionHeader>
        <SliderRow
          label="Wkład własny"
          info={TIP.downPayment}
          value={params.downPaymentPct * 100}
          min={10} max={80} step={5}
          unit="%"
          onChange={v => set('downPaymentPct', v / 100)}
          hint="Min. 20% wymagane przez większość banków"
        />
        <SliderRow
          label="Koszty transakcyjne"
          info={TIP.transactionCost}
          value={params.transactionCostPct * 100}
          min={0} max={10} step={0.5}
          unit="% ceny"
          onChange={v => set('transactionCostPct', v / 100)}
          hint="PCC + notariusz + pośrednik — łącznie 4–6% (rynek wtórny)"
        />
        <NumberInputRow
          label="Koszt wykończenia"
          info={TIP.renovationCost}
          value={params.renovationCostPln}
          step={5000}
          unit="PLN"
          onChange={v => set('renovationCostPln', v)}
          hint="Stan deweloperski → gotowy: ~2 000–3 500 PLN/m² (0 = rynek wtórny)"
        />
        <SliderRow
          label="Okres kredytu"
          info={TIP.loanTerm}
          value={params.loanTermYears}
          min={5} max={35} step={1}
          unit=" lat"
          onChange={v => set('loanTermYears', v)}
        />
        <SliderRow
          label="Oprocentowanie kredytu"
          info={TIP.mortgageRate}
          value={params.mortgageRatePct}
          min={2} max={15} step={0.5}
          unit="%"
          onChange={v => set('mortgageRatePct', v)}
          hint="Stała stopa na 5 lat, potem reset — aktualnie ~6–8% w PL"
        />
        <SliderRow
          label="Reset stopy co"
          info={TIP.rateReset}
          value={params.rateResetPeriodYears}
          min={1} max={10} step={1}
          unit=" lat"
          onChange={v => set('rateResetPeriodYears', v)}
        />
        <SliderRow
          label="Nadpłacanie kredytu"
          info={TIP.overpayment}
          value={params.overpaymentPct * 100}
          min={0} max={100} step={10}
          unit="% nadwyżki"
          onChange={v => set('overpaymentPct', v / 100)}
          hint="Reszta nadwyżki jest inwestowana w ETF"
        />
      </section>

      {/* ── Owner running costs ──────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader>Koszty właściciela (mies.)</SectionHeader>
        <NumberInputRow
          label="Czynsz administracyjny"
          info={TIP.adminFees}
          value={params.adminFeesPerSqm}
          step={1}
          unit="PLN/m²"
          onChange={v => set('adminFeesPerSqm', v)}
          hint="Opłata do wspólnoty / spółdzielni — typowo 12–25 PLN/m²"
        />
        <NumberInputRow
          label="Rezerwa remontowa"
          info={TIP.maintenance}
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
          info={TIP.appreciation}
          value={params.propertyAppreciationPct}
          min={-2} max={12} step={0.5}
          unit="%"
          onChange={v => set('propertyAppreciationPct', v)}
        />
        <SliderRow
          label="Wzrost czynszów"
          info={TIP.rentGrowth}
          value={params.rentGrowthPct}
          min={0} max={10} step={0.5}
          unit="%"
          onChange={v => set('rentGrowthPct', v)}
        />
        <SliderRow
          label="Zwrot z inwestycji (ETF)"
          info={TIP.investReturn}
          value={params.investmentReturnPct}
          min={0} max={15} step={0.5}
          unit="%"
          onChange={v => set('investmentReturnPct', v)}
          hint="Globalny ETF: ~7–8% historycznie, σ ≈ 15%"
        />
        <SliderRow
          label="Inflacja"
          info={TIP.inflation}
          value={params.inflationPct}
          min={0} max={10} step={0.5}
          unit="%"
          onChange={v => set('inflationPct', v)}
        />
      </section>

      {/* ── Simulation ───────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader>Symulacja</SectionHeader>
        <SliderRow
          label="Horyzont"
          info={TIP.horizon}
          value={params.horizonYears}
          min={5} max={35} step={1}
          unit=" lat"
          onChange={v => set('horizonYears', v)}
        />
      </section>
    </div>
  );
}
