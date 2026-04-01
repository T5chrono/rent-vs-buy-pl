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

function defaultParams(city: CityData, sizeSqm: number): SimParams {
  return {
    apartmentSizeSqm: sizeSqm,
    homePricePln: city.pricePerSqm * sizeSqm,
    monthlyRentPln: city.rentPerSqm * sizeSqm,
    downPaymentPct: 0.2,
    loanTermYears: 30,
    mortgageRatePct: 6.5,
    propertyAppreciationPct: 4.0,
    propertyTaxAndFeesPct: 0.5,
    maintenancePct: 1.0,
    rentGrowthPct: 3.5,
    investmentReturnPct: 6.0,
    inflationPct: 3.5,
  };
}

export default function App() {
  const [city, setCity] = useState<CityData>(DEFAULT_CITY);
  const [params, setParams] = useState<SimParams>(defaultParams(DEFAULT_CITY, DEFAULT_SIZE));
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialise worker once
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('./workers/simulation.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
      setResult(e.data.result);
      setLoading(false);
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const runSimulation = useCallback((p: SimParams) => {
    if (!workerRef.current) return;
    setLoading(true);
    const req: WorkerRequest = { params: p, iterations: 1000 };
    workerRef.current.postMessage(req);
  }, []);

  // Run on mount with defaults
  useEffect(() => {
    runSimulation(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleParamsChange(updated: SimParams) {
    setParams(updated);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSimulation(updated), 350);
  }

  function handleCityResolved(data: CityData) {
    setCity(data);
    const newParams: SimParams = {
      ...params,
      homePricePln: data.pricePerSqm * params.apartmentSizeSqm,
      monthlyRentPln: data.rentPerSqm * params.apartmentSizeSqm,
    };
    setParams(newParams);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSimulation(newParams), 350);
  }

  // Sync price/rent when apartment size changes
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
      {/* Header */}
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
                30-letnia symulacja Monte Carlo dla polskiego rynku nieruchomości
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* Left column — inputs */}
          <aside className="w-full lg:w-80 xl:w-96 shrink-0">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-5 space-y-6 lg:sticky lg:top-6">
              <ZipInput onCityResolved={handleCityResolved} />
              <hr className="border-gray-100" />
              <ParameterPanel
                params={params}
                onChange={handleParamsChangeWithSizeSync}
              />
            </div>
          </aside>

          {/* Right column — results */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Loading indicator */}
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
                <SummaryCards result={result} />

                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-5">
                  <WealthChart result={result} />
                </div>

                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-5">
                  <BreakevenChart result={result} />
                </div>

                {/* Methodology note */}
                <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4 text-sm text-amber-800 space-y-1">
                  <p className="font-semibold">Model obliczeniowy</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-700">
                    <li>Scenariusz kupna: kredyt annuitetowy + wzrost wartości nieruchomości − podatki i utrzymanie</li>
                    <li>Scenariusz najmu: wkład własny zainwestowany od dnia 0 + nadwyżka (różnica rat) inwestowana co rok</li>
                    <li>Każda iteracja losuje oprocentowanie, wzrost wartości, czynszów i stopy zwrotu z rozkładu normalnego</li>
                    <li>Próg opłacalności = rok, w którym wartość netto kupującego przewyższa wartość portfela najemcy</li>
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
