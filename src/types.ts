export interface CityData {
  city: string;
  voivodeship: string;
  pricePerSqm: number; // PLN / m²
  rentPerSqm: number;  // PLN / m² / month
}

export interface SimParams {
  // Property
  apartmentSizeSqm: number;
  homePricePln: number;
  monthlyRentPln: number;

  // Your finances
  startingCapitalPln: number;    // total savings (K₀)
  monthlyBudgetPln: number;      // equal monthly budget for housing + investing

  // Purchase structure
  downPaymentPct: number;        // 0–1
  transactionCostPct: number;    // entry costs (PCC, notary, agent) as fraction
  renovationCostPln: number;     // one-time fit-out cost (stan deweloperski → gotowy)
  loanTermYears: number;
  mortgageRatePct: number;       // mean nominal annual %
  rateResetPeriodYears: number;  // fixed-rate window before reset (default 5)
  overpaymentPct: number;        // 0–1, fraction of monthly surplus directed to overpaying the mortgage

  // Owner running costs (PLN / m² / month, inflation-adjusted)
  adminFeesPerSqm: number;      // czynsz administracyjny + fundusz remontowy
  maintenancePerSqm: number;    // own maintenance / renovation reserve

  // Market assumptions (annual %, means for year-by-year sampling)
  propertyAppreciationPct: number;
  rentGrowthPct: number;
  investmentReturnPct: number;
  inflationPct: number;

  // Simulation
  horizonYears: number;          // default 25
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
