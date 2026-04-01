import type { SimParams, SimulationResult, YearlyPoint } from '../types';

// Box-Muller transform: returns standard normal sample
function randNormal(mean: number, sd: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + sd * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Annuity monthly payment
function monthlyPayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 12;
  if (r === 0) return principal / (years * 12);
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

interface IterationResult {
  buyWealth: number[];  // length = years
  rentWealth: number[];
  breakevenYear: number | null;
}

function runIteration(params: SimParams): IterationResult {
  const {
    homePricePln,
    monthlyRentPln,
    downPaymentPct,
    loanTermYears,
    mortgageRatePct,
    propertyAppreciationPct,
    propertyTaxAndFeesPct,
    maintenancePct,
    rentGrowthPct,
    investmentReturnPct,
  } = params;

  // Sample stochastic rates for this iteration (annual)
  const mortgageRate = Math.max(0.01, randNormal(mortgageRatePct / 100, 0.008));
  const appreciationRate = randNormal(propertyAppreciationPct / 100, 0.02);
  const rentGrowthRate = Math.max(-0.05, randNormal(rentGrowthPct / 100, 0.015));
  const investmentRate = randNormal(investmentReturnPct / 100, 0.03);

  const downPayment = homePricePln * downPaymentPct;
  const loanAmount = homePricePln - downPayment;
  const monthlyMortgage = monthlyPayment(loanAmount, mortgageRate, loanTermYears);

  let homeValue = homePricePln;
  let remainingLoan = loanAmount;
  let rent = monthlyRentPln;
  // Renter invests the down payment from day 1
  let rentPortfolio = downPayment;

  const buyWealth: number[] = [];
  const rentWealth: number[] = [];
  let breakevenYear: number | null = null;

  for (let year = 1; year <= 30; year++) {
    // --- BUY path (annual approximation) ---
    homeValue *= 1 + appreciationRate;
    const annualMortgage = monthlyMortgage * 12;

    // Principal repaid this year (approximate: interest is front-loaded)
    const annualInterest = remainingLoan * mortgageRate;
    const annualPrincipal = Math.min(Math.max(annualMortgage - annualInterest, 0), remainingLoan);
    remainingLoan = Math.max(remainingLoan - annualPrincipal, 0);

    const annualRunningCosts = homeValue * (propertyTaxAndFeesPct / 100 + maintenancePct / 100);

    // Net worth for buyer: home equity minus cumulative running costs (already in equity via appreciation)
    // We track it as: home value - remaining loan - running costs paid this year (simplified)
    const buyNetWorth = homeValue - remainingLoan - annualRunningCosts * year;

    // --- RENT path ---
    // Monthly surplus: if mortgage > rent, renter invests the difference; otherwise no extra investment
    const monthlyRentNow = rent;
    const monthlySurplus = Math.max(monthlyMortgage - monthlyRentNow, 0);
    const annualSurplus = monthlySurplus * 12;

    // Portfolio grows and receives surplus contributions
    rentPortfolio = rentPortfolio * (1 + investmentRate) + annualSurplus;

    // Rent for next year
    rent *= 1 + rentGrowthRate;

    // Renter net worth: portfolio value (down payment + invested surplus, compounded)
    const rentNetWorth = rentPortfolio;

    buyWealth.push(buyNetWorth);
    rentWealth.push(rentNetWorth);

    if (breakevenYear === null && buyNetWorth > rentNetWorth) {
      breakevenYear = year;
    }
  }

  return { buyWealth, rentWealth, breakevenYear };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
}

export function runMonteCarlo(params: SimParams, iterations = 1000): SimulationResult {
  const results: IterationResult[] = [];
  for (let i = 0; i < iterations; i++) {
    results.push(runIteration(params));
  }

  const years = 30;
  const yearlyData: YearlyPoint[] = [];

  for (let y = 0; y < years; y++) {
    const buyArr = results.map(r => r.buyWealth[y]).sort((a, b) => a - b);
    const rentArr = results.map(r => r.rentWealth[y]).sort((a, b) => a - b);

    yearlyData.push({
      year: y + 1,
      buyP5: percentile(buyArr, 5),
      buyP25: percentile(buyArr, 25),
      buyP50: percentile(buyArr, 50),
      buyP75: percentile(buyArr, 75),
      buyP95: percentile(buyArr, 95),
      rentP5: percentile(rentArr, 5),
      rentP25: percentile(rentArr, 25),
      rentP50: percentile(rentArr, 50),
      rentP75: percentile(rentArr, 75),
      rentP95: percentile(rentArr, 95),
    });
  }

  // Breakeven histogram
  const breakevenCounts: Record<number, number> = {};
  let neverBreaksEven = 0;
  let buyWins = 0;

  for (const r of results) {
    if (r.breakevenYear === null) {
      neverBreaksEven++;
    } else {
      buyWins++;
      breakevenCounts[r.breakevenYear] = (breakevenCounts[r.breakevenYear] ?? 0) + 1;
    }
  }

  const breakevenHistogram = Object.entries(breakevenCounts)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);

  // Median breakeven year
  const breakevenYears = results
    .filter(r => r.breakevenYear !== null)
    .map(r => r.breakevenYear as number)
    .sort((a, b) => a - b);
  const medianBreakevenYear = breakevenYears.length > 0
    ? breakevenYears[Math.floor(breakevenYears.length / 2)]
    : null;

  const buyFinalArr = results.map(r => r.buyWealth[29]).sort((a, b) => a - b);
  const rentFinalArr = results.map(r => r.rentWealth[29]).sort((a, b) => a - b);

  return {
    yearlyData,
    breakevenHistogram,
    medianBreakevenYear,
    probBuyWins: buyWins / iterations,
    buyFinalP50: percentile(buyFinalArr, 50),
    rentFinalP50: percentile(rentFinalArr, 50),
    neverBreaksEven,
  };
}
