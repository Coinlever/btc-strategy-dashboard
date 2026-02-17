"use client";

import type { DashboardData } from "@/lib/types";
import { DashboardHeader } from "@/components/dashboard-header";
import { CurrentPositionBanner } from "@/components/current-position";
import { StatsCards } from "@/components/stats-cards";
import { EquityCurveChart } from "@/components/equity-curve-chart";
import { DrawdownChart } from "@/components/drawdown-chart";
import { RollingSharpeChart } from "@/components/rolling-sharpe-chart";
import { PerTradeChart } from "@/components/per-trade-chart";
import { MonthlyHeatmap } from "@/components/monthly-heatmap";

interface DashboardProps {
  data: DashboardData;
}

export function Dashboard({ data }: DashboardProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader metadata={data.metadata} />
      <CurrentPositionBanner position={data.current_position} />
      <StatsCards statistics={data.statistics} />
      <EquityCurveChart equityCurve={data.equity_curve} />
      <DrawdownChart drawdown={data.drawdown} />
      <PerTradeChart
        trades={data.per_trade_returns}
        maxTradeDrawdownPct={data.statistics.max_trade_drawdown_pct}
      />
      <RollingSharpeChart rollingSharpe={data.rolling_sharpe} />
      <MonthlyHeatmap monthlyReturns={data.monthly_returns} />
      <footer className="mt-8 border-t border-zinc-800 pt-4 text-center text-xs text-zinc-600">
        Performance shown is based on backtested results. Past performance does
        not guarantee future results.
      </footer>
    </main>
  );
}
