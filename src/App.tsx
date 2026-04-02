import { useState, useEffect, useRef, useCallback } from 'react';
import type { SimParams, SimulationResult, CityData, WorkerRequest, WorkerResponse } from './types';
import { cityPrices } from './data/cityPrices';
import { ZipInput } from './components/ZipInput';
import { ParameterPanel } from './components/ParameterPanel';
import { WealthChart } from './components/WealthChart';
import { BreakevenChart } from './components/BreakevenChart';
import { SummaryCards } from './components/SummaryCards';
import { DataSourceNote } from './components/DataSourceNote';

const DEFAULT_CITY = cityPrices['warszawa'];
const DEFAULT_SIZE = 55;

// Rough annuity helper for estimating default budget
function roughMonthly(principal: number, rate: number, years: number): number {
  const r = rate / 12;
  if (r <= 0) return principal / (years * 12);
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function defaultParams(city: CityData, sizeSqm: number): SimParams {
  const homePrice = city.pricePerSqm * sizeSqm;
  const monthlyRent = city.rentPerSqm * sizeSqm;
  const downPct = 0.2;
  const txCostPct = 0.05;
  const loanTerm = 25;
  const rate = 0.07;
  const adminPerSqm = 15;
  const maintPerSqm = 3;

  const loan = homePrice * (1 - downPct);
  const estMortgage = roughMonthly(loan, rate, loanTerm);
  const estOwnerCost = estMortgage + (adminPerSqm + maintPerSqm) * sizeSqm;
  const budget = Math.ceil(estOwnerCost / 500) * 500; // round up to nearest 500

  return {
    apartmentSizeSqm: sizeSqm,
    homePricePln: homePrice,
    monthlyRentPln: monthlyRent,
    startingCapitalPln: 250000,
    monthlyBudgetPln: budget,
    downPaymentPct: downPct,
    transactionCostPct: txCostPct,
    renovationCostPln: 0,
    loanTermYears: loanTerm,
    mortgageRatePct: 7.0,
    rateResetPeriodYears: 5,
    overpaymentPct: 0.5,
    adminFeesPerSqm: adminPerSqm,
    maintenancePerSqm: maintPerSqm,
    propertyAppreciationPct: 4.0,
    rentGrowthPct: 3.5,
    investmentReturnPct: 7.0,
    inflationPct: 3.5,
    horizonYears: 25,
  };
}

export default function App() {
  const [city, setCity] = useState<CityData>(DEFAULT_CITY);
  const [params, setParams] = useState<SimParams>(defaultParams(DEFAULT_CITY, DEFAULT_SIZE));
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('./workers/simulation.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
      setResult(e.data.result);
      setLoading(false);
    };
    return () => { workerRef.current?.terminate(); };
  }, []);

  const runSimulation = useCallback((p: SimParams) => {
    if (!workerRef.current) return;
    setLoading(true);
    const req: WorkerRequest = { params: p, iterations: 1000 };
    workerRef.current.postMessage(req);
  }, []);

  useEffect(() => {
    runSimulation(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scheduleRun(p: SimParams) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSimulation(p), 350);
  }

  function handleParamsChange(updated: SimParams) {
    setParams(updated);
    scheduleRun(updated);
  }

  function handleCityResolved(data: CityData) {
    setCity(data);
    const homePrice = data.pricePerSqm * params.apartmentSizeSqm;
    const monthlyRent = data.rentPerSqm * params.apartmentSizeSqm;
    const loan = homePrice * (1 - params.downPaymentPct);
    const estMortgage = roughMonthly(loan, params.mortgageRatePct / 100, params.loanTermYears);
    const estOwnerCost = estMortgage + (params.adminFeesPerSqm + params.maintenancePerSqm) * params.apartmentSizeSqm;
    const budget = Math.ceil(estOwnerCost / 500) * 500;

    const newParams: SimParams = {
      ...params,
      homePricePln: homePrice,
      monthlyRentPln: monthlyRent,
      monthlyBudgetPln: budget,
    };
    setParams(newParams);
    scheduleRun(newParams);
  }

  function handleParamsChangeWithSizeSync(updated: SimParams) {
    if (updated.apartmentSizeSqm !== params.apartmentSizeSqm) {
      updated = {
        ...updated,
        homePricePln: city.pricePerSqm * updated.apartmentSizeSqm,
        monthlyRentPln: city.rentPerSqm * updated.apartmentSizeSqm,
      };
    }
    handleParamsChange(updated);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white text-lg font-bold select-none">
              NK
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Najem czy Kupno?
              </h1>
              <p className="text-sm text-gray-500">
                Symulacja Monte Carlo &middot; {params.horizonYears} lat &middot; polski rynek nieruchomości
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          <aside className="w-full lg:w-80 xl:w-96 shrink-0">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-5 space-y-6 lg:sticky lg:top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
              <ZipInput onCityResolved={handleCityResolved} />
              <hr className="border-gray-100" />
              <ParameterPanel
                params={params}
                onChange={handleParamsChangeWithSizeSync}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0 space-y-5">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Trwa symulacja…
              </div>
            )}

            {result && (
              <>
                <SummaryCards result={result} horizonYears={params.horizonYears} />

                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-5">
                  <WealthChart result={result} horizonYears={params.horizonYears} />
                </div>

                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-5">
                  <BreakevenChart result={result} />
                </div>

                <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4 text-sm text-amber-800 space-y-1">
                  <p className="font-semibold">Model obliczeniowy v2</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-700">
                    <li>Równy budżet miesięczny — nadwyżka kupującego dzielona: nadpłata kredytu + inwestycja w ETF</li>
                    <li>Najemca inwestuje cały kapitał początkowy od dnia 0 + comiesięczną nadwyżkę</li>
                    <li>Podatek Belki (19%) na zyskach portfela obu stron; nieruchomość zwolniona po 5 latach</li>
                    <li>Koszty wejścia: PCC/notariusz/pośrednik + opcjonalne wykończenie</li>
                    <li>Stopa kredytu resetowana co {params.rateResetPeriodYears} lat (realia polskiego rynku)</li>
                    <li>Losowanie zmiennych co rok (σ: ETF ≈ 15%, nieruchomości ≈ 6%, czynsze ≈ 3%)</li>
                    <li>NW = Aktywa − Pasywa (bez podwójnego karania kosztami bieżącymi)</li>
                  </ul>
                </div>

                <DataSourceNote />
              </>
            )}

            {!result && !loading && (
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-10 text-center text-gray-400">
                Wprowadź kod pocztowy, aby uruchomić symulację.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
