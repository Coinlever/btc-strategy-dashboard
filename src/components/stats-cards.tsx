"use client";

import type { Statistics } from "@/lib/types";
import { Card, CardTitle, CardContent } from "@/components/card";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";

interface StatsCardsProps {
  statistics: Statistics;
}

interface StatItem {
  label: string;
  value: string;
  color?: string;
}

export function StatsCards({ statistics }: StatsCardsProps) {
  const stats: StatItem[] = [
    {
      label: "Total Return",
      value: formatPercent(statistics.total_return_pct),
      color:
        statistics.total_return_pct >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Final Capital",
      value: formatCurrency(statistics.final_capital),
      color: "text-zinc-50",
    },
    {
      label: "Sharpe Ratio",
      value: formatNumber(statistics.sharpe_ratio),
      color:
        statistics.sharpe_ratio !== null && statistics.sharpe_ratio >= 1
          ? "text-emerald-400"
          : "text-zinc-50",
    },
    {
      label: "Sortino Ratio",
      value: formatNumber(statistics.sortino_ratio),
      color: "text-zinc-50",
    },
    {
      label: "Max Drawdown",
      value: formatPercent(statistics.max_drawdown_pct),
      color: "text-red-400",
    },
    {
      label: "Worst Trade",
      value: formatPercent(statistics.max_trade_drawdown_pct),
      color: "text-red-400",
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

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {stats.map((stat) => (
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
