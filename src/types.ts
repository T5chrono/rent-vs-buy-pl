export interface CityData {
  city: string;
  voivodeship: string;
  pricePerSqm: number; // PLN / m²
  rentPerSqm: number;  // PLN / m² / month
}

export interface SimParams {
  // Property
  apartmentSizeSqm: number;
  downPaymentPct: number;       // 0–1
  loanTermYears: number;

  // Rates (means; simulation will sample around these)
  mortgageRatePct: number;      // nominal annual %
  propertyAppreciationPct: number;
  propertyTaxAndFeesPct: number; // annual % of home value
  maintenancePct: number;        // annual % of home value
  rentGrowthPct: number;
  investmentReturnPct: number;
  inflationPct: number;

  // Seeded from CityData (overrideable)
  homePricePln: number;
  monthlyRentPln: number;
}

export interface YearlyPoint {
  year: number;
  buyP5: number;
  buyP25: number;
  buyP50: number;
  buyP75: number;
  buyP95: number;
  rentP5: number;
  rentP25: number;
  rentP50: number;
  rentP75: number;
  rentP95: number;
}

export interface SimulationResult {
  yearlyData: YearlyPoint[];
  breakevenHistogram: { year: number; count: number }[];
  medianBreakevenYear: number | null;
  probBuyWins: number; // 0–1
  buyFinalP50: number;
  rentFinalP50: number;
  neverBreaksEven: number; // count of iterations where buy never wins
}

export interface WorkerRequest {
  params: SimParams;
  iterations: number;
}

export interface WorkerResponse {
  result: SimulationResult;
}
