"use client";

import { useState, useMemo } from "react";
import type { DashboardData } from "@/lib/types";
import { getAvailableYears, rebaseDashboardData } from "@/lib/rebase";
import { DashboardHeader } from "@/components/dashboard-header";
import { CurrentPositionBanner } from "@/components/current-position";
import { StatsCards } from "@/components/stats-cards";
import { EquityCurveChart } from "@/components/equity-curve-chart";
import { DrawdownChart } from "@/components/drawdown-chart";
import { PerTradeChart } from "@/components/per-trade-chart";
import { MonthlyHeatmap } from "@/components/monthly-heatmap";

interface DashboardProps {
  data: DashboardData;
}

export function Dashboard({ data }: DashboardProps) {
  const availableYears = useMemo(
    () => getAvailableYears(data.equity_curve.dates),
    [data],
  );

  // null = "All" (use original data from the earliest date)
  const [startYear, setStartYear] = useState<number | null>(null);

  const rebased = useMemo(
    () => rebaseDashboardData(data, startYear),
    [data, startYear],
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader
        metadata={rebased.metadata}
        availableYears={availableYears}
        selectedYear={startYear}
        onYearChange={setStartYear}
      />
      <StatsCards statistics={rebased.statistics} />
      <CurrentPositionBanner position={rebased.current_position} />
      <EquityCurveChart equityCurve={rebased.equity_curve} />
      <DrawdownChart drawdown={rebased.drawdown} />
      <PerTradeChart
        trades={rebased.per_trade_returns}
        bestTradePct={rebased.statistics.best_trade_pct}
        worstTradePct={rebased.statistics.max_trade_drawdown_pct}
      />
      <MonthlyHeatmap monthlyReturns={rebased.monthly_returns} />
      <footer className="mt-8 border-t border-zinc-800 pt-4 text-center text-xs text-zinc-600">
        Performance shown is based on backtested results. Past performance does
        not guarantee future results.
      </footer>
    </main>
  );
}
