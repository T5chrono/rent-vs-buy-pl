import type { SimParams, SimulationResult, YearlyPoint } from '../types';

// ── Random sampling ───────────────────────────────────────────────────
// Box-Muller: standard normal → N(mean, sd)
function randNormal(mean: number, sd: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + sd * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ── Annuity monthly payment ───────────────────────────────────────────
function annuityMonthly(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const r = annualRate / 12;
  if (r <= 0) return principal / (years * 12);
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ── Annual volatilities for year-by-year sampling ─────────────────────
// These are NOT user-adjustable: they represent empirical annual σ for
// Polish / global markets, calibrated so that the 25-year envelope
// reflects realistic dispersion (sequence-of-returns risk).
const SIGMA = {
  appreciation: 0.06,     // Polish residential prices ~6 % annual vol
  investReturn: 0.15,     // global equity ETF ~15 % annual vol
  rentGrowth: 0.03,       // rental market ~3 % annual vol
  mortgageRate: 0.015,    // rate swing per 5-year reset period
  inflation: 0.015,       // CPI volatility
};

// ── Belka tax helper ──────────────────────────────────────────────────
// Poland: 19 % flat tax on realised investment gains (PIT-38).
// Applies to portfolio gains only; primary-residence property sale is
// tax-free after 5 years of ownership.
const BELKA_RATE = 0.19;

function portfolioAfterBelka(portfolio: number, contributions: number): number {
  const gain = Math.max(0, portfolio - Math.max(0, contributions));
  return portfolio - gain * BELKA_RATE;
}

// ── Single iteration ──────────────────────────────────────────────────
interface IterationResult {
  buyWealth: number[];
  rentWealth: number[];
  breakevenYear: number | null;
}

function runIteration(p: SimParams): IterationResult {
  const horizon = p.horizonYears;

  // ── Initial capital allocation ────────────────────────────────────
  const downPayment = p.homePricePln * p.downPaymentPct;
  const transactionCosts = p.homePricePln * p.transactionCostPct;
  const totalEntryCost = downPayment + transactionCosts + p.renovationCostPln;

  let loanPrincipal = p.homePricePln - downPayment;
  let buyerPortfolio: number;

  if (p.startingCapitalPln >= totalEntryCost) {
    // Leftover cash goes to buyer's investment portfolio
    buyerPortfolio = p.startingCapitalPln - totalEntryCost;
  } else {
    // Shortfall (transaction + renovation) is added to mortgage
    loanPrincipal += totalEntryCost - p.startingCapitalPln;
    buyerPortfolio = 0;
  }
  let buyerContributions = buyerPortfolio; // tracks money put INTO portfolio for Belka

  // Renter invests ALL starting capital from day 0
  let renterPortfolio = p.startingCapitalPln;
  let renterContributions = p.startingCapitalPln;

  // ── Mutable state ─────────────────────────────────────────────────
  let homeValue = p.homePricePln;
  let remainingLoan = loanPrincipal;
  let remainingTermYears = p.loanTermYears;
  let currentRent = p.monthlyRentPln;
  let inflationCumulative = 1.0;

  // First mortgage rate draw
  let mortgageRate = Math.max(0.005, randNormal(p.mortgageRatePct / 100, SIGMA.mortgageRate));
  let monthlyMortgage = annuityMonthly(remainingLoan, mortgageRate, remainingTermYears);

  const buyWealth: number[] = [];
  const rentWealth: number[] = [];
  let breakevenYear: number | null = null;

  for (let year = 1; year <= horizon; year++) {
    // ── Year-by-year stochastic draws ─────────────────────────────
    const rAppreciation = randNormal(p.propertyAppreciationPct / 100, SIGMA.appreciation);
    const rInvest       = randNormal(p.investmentReturnPct / 100, SIGMA.investReturn);
    const rRentGrowth   = randNormal(p.rentGrowthPct / 100, SIGMA.rentGrowth);
    const rInflation    = Math.max(-0.02, randNormal(p.inflationPct / 100, SIGMA.inflation));

    // ── Mortgage rate reset every N years ──────────────────────────
    if (year > 1 && (year - 1) % p.rateResetPeriodYears === 0 && remainingLoan > 0) {
      mortgageRate = Math.max(0.005, randNormal(p.mortgageRatePct / 100, SIGMA.mortgageRate));
      monthlyMortgage = annuityMonthly(remainingLoan, mortgageRate, remainingTermYears);
    }

    inflationCumulative *= (1 + rInflation);

    // ══════════ BUY PATH ══════════════════════════════════════════

    // Home appreciation
    homeValue *= (1 + rAppreciation);

    // Annual costs
    const annualMortgage = remainingLoan > 0 ? monthlyMortgage * 12 : 0;
    const annualAdmin = p.adminFeesPerSqm * p.apartmentSizeSqm * 12 * inflationCumulative;
    const annualMaint = p.maintenancePerSqm * p.apartmentSizeSqm * 12 * inflationCumulative;
    const totalBuyerCost = annualMortgage + annualAdmin + annualMaint;

    // Loan amortisation for the year (standard annuity split)
    if (remainingLoan > 0 && annualMortgage > 0) {
      const interestPortion = remainingLoan * mortgageRate;
      const principalPortion = Math.min(Math.max(annualMortgage - interestPortion, 0), remainingLoan);
      remainingLoan = Math.max(0, remainingLoan - principalPortion);
      remainingTermYears = Math.max(0, remainingTermYears - 1);
    }

    // Equal-budget surplus / deficit
    const annualBudget = p.monthlyBudgetPln * 12;
    const buyerSurplus = annualBudget - totalBuyerCost;

    if (buyerSurplus > 0) {
      // Split surplus: part overpays mortgage, part invested
      const toOverpay = buyerSurplus * p.overpaymentPct;
      const toInvest  = buyerSurplus * (1 - p.overpaymentPct);

      // Overpay mortgage (reduces principal → recalculates payment)
      if (remainingLoan > 0 && toOverpay > 0) {
        const actualOverpay = Math.min(toOverpay, remainingLoan);
        remainingLoan -= actualOverpay;
        if (remainingLoan > 0 && remainingTermYears > 0) {
          monthlyMortgage = annuityMonthly(remainingLoan, mortgageRate, remainingTermYears);
        } else {
          monthlyMortgage = 0;
        }
      }

      // Invest the rest
      buyerPortfolio = buyerPortfolio * (1 + rInvest) + toInvest;
      buyerContributions += toInvest;
    } else {
      // Deficit: portfolio still earns returns, then we withdraw
      buyerPortfolio = buyerPortfolio * (1 + rInvest) + buyerSurplus; // surplus < 0
      // Withdrawals do NOT reduce contribution basis (you already paid that money in)
    }

    // Buyer net worth = Assets − Liabilities
    //   Assets:  home (tax-free if held > 5 y) + portfolio (after Belka)
    //   Liabilities: remaining loan
    const propGainTax = year <= 5
      ? Math.max(0, homeValue - p.homePricePln) * BELKA_RATE
      : 0;
    const buyerPortfolioNet = portfolioAfterBelka(buyerPortfolio, buyerContributions);
    const buyNW = (homeValue - propGainTax) - remainingLoan + Math.max(0, buyerPortfolioNet);

    // ══════════ RENT PATH ═════════════════════════════════════════

    const annualRent = currentRent * 12;
    const renterSurplus = annualBudget - annualRent;

    // Portfolio earns returns, then surplus is added (or deficit withdrawn)
    renterPortfolio = renterPortfolio * (1 + rInvest) + renterSurplus;
    if (renterSurplus > 0) {
      renterContributions += renterSurplus;
    }

    currentRent *= (1 + rRentGrowth);

    // Renter net worth (after Belka)
    const rentNW = portfolioAfterBelka(renterPortfolio, renterContributions);

    // ── Record ────────────────────────────────────────────────────
    buyWealth.push(buyNW);
    rentWealth.push(rentNW);

    if (breakevenYear === null && buyNW > rentNW) {
      breakevenYear = year;
    }
  }

  return { buyWealth, rentWealth, breakevenYear };
}

// ── Percentile helper ─────────────────────────────────────────────────
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
}

// ── Main entry point ──────────────────────────────────────────────────
export function runMonteCarlo(params: SimParams, iterations = 1000): SimulationResult {
  const results: IterationResult[] = [];
  for (let i = 0; i < iterations; i++) {
    results.push(runIteration(params));
  }

  const horizon = params.horizonYears;
  const yearlyData: YearlyPoint[] = [];

  for (let y = 0; y < horizon; y++) {
    const buyArr  = results.map(r => r.buyWealth[y]).sort((a, b) => a - b);
    const rentArr = results.map(r => r.rentWealth[y]).sort((a, b) => a - b);

    yearlyData.push({
      year: y + 1,
      buyP5:  percentile(buyArr, 5),
      buyP25: percentile(buyArr, 25),
      buyP50: percentile(buyArr, 50),
      buyP75: percentile(buyArr, 75),
      buyP95: percentile(buyArr, 95),
      rentP5:  percentile(rentArr, 5),
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

  // Breakeven year = first year where median (p50) buy curve exceeds median (p50) rent curve
  const medianBreakevenYear = yearlyData.find(d => d.buyP50 > d.rentP50)?.year ?? null;

  const lastIdx = horizon - 1;
  const buyFinalArr  = results.map(r => r.buyWealth[lastIdx]).sort((a, b) => a - b);
  const rentFinalArr = results.map(r => r.rentWealth[lastIdx]).sort((a, b) => a - b);

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
