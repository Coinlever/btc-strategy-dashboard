"use client";

import type { Statistics } from "@/lib/types";
import { Card, CardTitle, CardContent } from "@/components/card";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface StatsCardsProps {
  statistics: Statistics;
}

interface StatItem {
  label: string;
  value: string;
  color?: string;
}

export function StatsCards({ statistics }: StatsCardsProps) {
  const row1: StatItem[] = [
    {
      label: "Start Capital",
      value: formatCurrency(statistics.starting_capital),
      color: "text-zinc-50",
    },
    {
      label: "Current Capital",
      value: formatCurrency(statistics.final_capital),
      color: "text-zinc-50",
    },
    {
      label: "Total Return",
      value: formatPercent(statistics.total_return_pct),
      color:
        statistics.total_return_pct >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Strategy vs BTC",
      value: formatPercent(statistics.strategy_vs_btc_pct),
      color:
        statistics.strategy_vs_btc_pct !== null &&
        statistics.strategy_vs_btc_pct >= 0
          ? "text-emerald-400"
          : "text-red-400",
    },
  ];

  const row2: StatItem[] = [
    {
      label: "Max Drawdown (incl uPnL)",
      value: formatPercent(statistics.max_drawdown_pct),
      color: "text-red-400",
    },
    {
      label: "Max Drawdown (real PnL)",
      value: formatPercent(statistics.max_realised_drawdown_pct),
      color: "text-red-400",
    },
    {
      label: "Best Trade",
      value: formatPercent(statistics.best_trade_pct),
      color: "text-emerald-400",
    },
    {
      label: "Worst Trade",
      value: formatPercent(statistics.max_trade_drawdown_pct),
      color: "text-red-400",
    },
  ];

  const allStats = [...row1, ...row2];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {allStats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <CardTitle className="mb-1 text-xs">{stat.label}</CardTitle>
          <CardContent>
            <span className={`text-xl font-bold ${stat.color ?? "text-zinc-50"}`}>
              {stat.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
