import type {
  DashboardData,
  EquityCurve,
  Drawdown,
  RollingSharpe,
  Statistics,
  PerTradeReturn,
} from "@/lib/types";

/**
 * Rebase all dashboard data to a given start year.
 *
 * When a user picks e.g. 2022, we:
 *  1. Slice all date-aligned arrays from the first date >= YYYY-01-01
 *  2. Scale portfolio_value, btc_benchmark, step_chart so the first value = $10,000
 *  3. Recompute drawdowns from the rebased values
 *  4. Recompute statistics from the rebased slice
 *  5. Filter monthly returns to only include the selected year onward
 *  6. Filter per-trade returns to trades that started on or after the start date
 *  7. Slice rolling Sharpe from the start date onward
 */

const BASE_CAPITAL = 10_000;

/** Get available start years from the data. */
export function getAvailableYears(dates: string[]): number[] {
  if (dates.length === 0) return [];
  const startYear = new Date(dates[0]).getFullYear();
  const endYear = new Date(dates[dates.length - 1]).getFullYear();
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }
  return years;
}

/** Find the index of the first date >= target in a sorted date string array. */
function findStartIndex(dates: string[], target: string): number {
  for (let i = 0; i < dates.length; i++) {
    if (dates[i] >= target) return i;
  }
  return dates.length; // not found
}

/** Scale a number array so that values[0] = BASE_CAPITAL. */
function scaleValues(values: number[]): number[] {
  if (values.length === 0) return [];
  const factor = BASE_CAPITAL / values[0];
  return values.map((v) => Math.round(v * factor * 100) / 100);
}

/** Scale a nullable number array so that values[firstNonNull] = BASE_CAPITAL. */
function scaleNullableValues(values: (number | null)[]): (number | null)[] {
  if (values.length === 0) return [];
  const firstNonNull = values.findIndex((v) => v !== null && v !== 0);
  if (firstNonNull === -1) return values;
  const factor = BASE_CAPITAL / (values[firstNonNull] as number);
  return values.map((v) => (v !== null ? Math.round(v * factor * 100) / 100 : null));
}

/** Compute drawdown percentage from a value series. */
function computeDrawdown(values: number[]): number[] {
  if (values.length === 0) return [];
  let runningMax = values[0];
  return values.map((v) => {
    if (v > runningMax) runningMax = v;
    return Math.round(((v / runningMax - 1) * 100) * 100) / 100;
  });
}

/** Compute drawdown from nullable values. */
function computeDrawdownNullable(values: (number | null)[]): (number | null)[] {
  if (values.length === 0) return [];
  let runningMax: number | null = null;
  return values.map((v) => {
    if (v === null) return null;
    if (runningMax === null || v > runningMax) runningMax = v;
    return Math.round(((v / runningMax - 1) * 100) * 100) / 100;
  });
}

/** Compute Sharpe ratio from daily return percentages. */
function computeSharpe(dailyReturns: number[]): number | null {
  if (dailyReturns.length < 2) return null;
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance =
    dailyReturns.reduce((a, b) => a + (b - mean) ** 2, 0) / (dailyReturns.length - 1);
  const std = Math.sqrt(variance);
  if (std === 0 || isNaN(std)) return null;
  return Math.round(((mean / std) * Math.sqrt(365)) * 100) / 100;
}

/** Compute Sortino ratio from daily return percentages. */
function computeSortino(dailyReturns: number[]): number | null {
  if (dailyReturns.length < 2) return null;
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const negativeReturns = dailyReturns.filter((r) => r < 0);
  if (negativeReturns.length === 0) return null;
  const downVariance =
    negativeReturns.reduce((a, b) => a + b ** 2, 0) / (negativeReturns.length - 1);
  const downStd = Math.sqrt(downVariance);
  if (downStd === 0 || isNaN(downStd)) return null;
  return Math.round(((mean / downStd) * Math.sqrt(365)) * 100) / 100;
}

/** Compute monthly returns from dates and values. */
function computeMonthlyReturns(
  dates: string[],
  values: number[],
): Record<string, Record<string, number | null>> {
  if (dates.length < 2) return {};

  const monthly: Record<string, Record<string, number>> = {};

  for (let i = 1; i < dates.length; i++) {
    const dailyReturn = values[i] / values[i - 1] - 1;
    const d = new Date(dates[i]);
    const year = String(d.getFullYear());
    const month = String(d.getMonth() + 1);

    if (!monthly[year]) monthly[year] = {};
    if (monthly[year][month] === undefined) {
      monthly[year][month] = 1 + dailyReturn;
    } else {
      monthly[year][month] *= 1 + dailyReturn;
    }
  }

  // Convert cumulative products to percentage returns
  const result: Record<string, Record<string, number | null>> = {};
  for (const year of Object.keys(monthly)) {
    result[year] = {};
    for (const month of Object.keys(monthly[year])) {
      result[year][month] = Math.round((monthly[year][month] - 1) * 100 * 100) / 100;
    }
  }

  return result;
}

/**
 * Rebase all dashboard data assuming investment starts on Jan 1 of the given year.
 * If startYear is null, returns the original data unchanged.
 */
export function rebaseDashboardData(
  data: DashboardData,
  startYear: number | null,
): DashboardData {
  if (startYear === null) return data;

  const target = `${startYear}-01-01`;
  const eqDates = data.equity_curve.dates;
  const idx = findStartIndex(eqDates, target);

  // If start year is the same as data start or no data found, return original
  if (idx === 0) return data;
  if (idx >= eqDates.length) return data;

  // Slice equity curve
  const slicedDates = eqDates.slice(idx);
  const slicedPtf = data.equity_curve.portfolio_value.slice(idx);
  const slicedBtc = data.equity_curve.btc_benchmark.slice(idx);
  const slicedStep = data.equity_curve.step_chart.slice(idx);

  // Scale to $10k
  const rebasedPtf = scaleValues(slicedPtf);
  const rebasedBtc = scaleNullableValues(slicedBtc);
  const rebasedStep = scaleNullableValues(slicedStep);

  const equityCurve: EquityCurve = {
    dates: slicedDates,
    portfolio_value: rebasedPtf,
    btc_benchmark: rebasedBtc,
    step_chart: rebasedStep,
  };

  // Recompute drawdowns from rebased values
  const rebasedDrawdownPct = computeDrawdown(rebasedPtf);
  const rebasedTradeOnlyDd = computeDrawdownNullable(rebasedStep);
  const rebasedBtcDd = computeDrawdownNullable(rebasedBtc);

  const drawdown: Drawdown = {
    dates: slicedDates,
    drawdown_pct: rebasedDrawdownPct,
    trade_only_drawdown_pct: rebasedTradeOnlyDd as number[],
    btc_drawdown_pct: rebasedBtcDd as (number | null)[],
  };

  // Rolling Sharpe — slice from start date
  const rsIdx = findStartIndex(data.rolling_sharpe.dates, target);
  const rollingSharpe: RollingSharpe = {
    dates: data.rolling_sharpe.dates.slice(rsIdx),
    sharpe_90d: data.rolling_sharpe.sharpe_90d.slice(rsIdx),
  };

  // Monthly returns — recompute from rebased portfolio values
  const monthlyReturns = computeMonthlyReturns(slicedDates, rebasedPtf);

  // Filter per-trade returns to trades starting on/after target date
  // We use trade_id ordering — trades after the start
  // Since we don't have dates on per-trade returns, filter by cv_start threshold
  // Better: check which trades have cv_start values in the rebased period
  // Actually, we need to check against the original portfolio value at the start date
  const originalStartValue = slicedPtf[0]; // original value at start of rebased period
  const filteredTrades: PerTradeReturn[] = data.per_trade_returns.filter(
    (t) => t.cv_start >= originalStartValue * 0.95, // trades whose start value >= ~start of period
  );

  // Re-ID the filtered trades from 0
  const reIndexedTrades = filteredTrades.map((t, i) => ({
    ...t,
    trade_id: i,
  }));

  // Recompute statistics
  const finalCapital = rebasedPtf[rebasedPtf.length - 1];
  const totalReturnPct = Math.round(((finalCapital / BASE_CAPITAL - 1) * 100) * 100) / 100;
  const maxDrawdownPct = Math.min(...rebasedDrawdownPct);

  // Max drawdown on realised PnL only (step chart)
  const tradeOnlyNonNull = rebasedTradeOnlyDd.filter((v): v is number => v !== null);
  const maxRealisedDrawdownPct =
    tradeOnlyNonNull.length > 0
      ? Math.round(Math.min(...tradeOnlyNonNull) * 100) / 100
      : null;

  // Daily returns for Sharpe/Sortino
  const dailyReturns: number[] = [];
  for (let i = 1; i < rebasedPtf.length; i++) {
    dailyReturns.push(rebasedPtf[i] / rebasedPtf[i - 1] - 1);
  }
  const sharpeRatio = computeSharpe(dailyReturns);
  const sortinoRatio = computeSortino(dailyReturns);

  // BTC return
  const btcStart = rebasedBtc.find((v) => v !== null);
  const btcEnd = rebasedBtc[rebasedBtc.length - 1];
  const btcReturnPct =
    btcStart !== null && btcStart !== undefined && btcEnd !== null
      ? (btcEnd / btcStart - 1) * 100
      : null;
  const strategyVsBtc =
    btcReturnPct !== null
      ? Math.round((totalReturnPct - btcReturnPct) * 100) / 100
      : null;

  // Best/worst trade in period
  const bestTrade =
    reIndexedTrades.length > 0
      ? Math.max(...reIndexedTrades.map((t) => t.return_pct))
      : null;
  const worstTrade =
    reIndexedTrades.length > 0
      ? Math.min(...reIndexedTrades.map((t) => t.return_pct))
      : null;

  // Monthly aggregates
  const allMonthly: number[] = [];
  for (const yearData of Object.values(monthlyReturns)) {
    for (const v of Object.values(yearData)) {
      if (v !== null) allMonthly.push(v);
    }
  }

  const statistics: Statistics = {
    total_return_pct: totalReturnPct,
    sharpe_ratio: sharpeRatio,
    sortino_ratio: sortinoRatio,
    max_drawdown_pct: Math.round(maxDrawdownPct * 100) / 100,
    max_realised_drawdown_pct: maxRealisedDrawdownPct,
    max_trade_drawdown_pct: worstTrade !== null ? Math.round(worstTrade * 100) / 100 : null,
    best_trade_pct: bestTrade !== null ? Math.round(bestTrade * 100) / 100 : null,
    num_trades: reIndexedTrades.length,
    strategy_vs_btc_pct: strategyVsBtc,
    best_month_pct: allMonthly.length > 0 ? Math.max(...allMonthly) : null,
    worst_month_pct: allMonthly.length > 0 ? Math.min(...allMonthly) : null,
    winning_months: allMonthly.filter((m) => m > 0).length,
    losing_months: allMonthly.filter((m) => m < 0).length,
    starting_capital: BASE_CAPITAL,
    final_capital: Math.round(finalCapital * 100) / 100,
  };

  // Update metadata dates
  const metadata = {
    ...data.metadata,
    start_date: slicedDates[0],
  };

  return {
    ...data,
    metadata,
    equity_curve: equityCurve,
    drawdown,
    monthly_returns: monthlyReturns,
    rolling_sharpe: rollingSharpe,
    statistics,
    per_trade_returns: reIndexedTrades,
    // current_position stays the same
  };
}
