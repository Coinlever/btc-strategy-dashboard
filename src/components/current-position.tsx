"use client";

import type { CurrentPosition } from "@/lib/types";
import { Card } from "@/components/card";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface CurrentPositionProps {
  position: CurrentPosition;
}

export function CurrentPositionBanner({ position }: CurrentPositionProps) {
  if (!position.is_open) {
    return (
      <Card className="mb-8 border-zinc-700 p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-zinc-700 px-2.5 py-1 text-sm font-medium text-zinc-300">
            FLAT
          </span>
          <span className="text-sm text-zinc-400">
            No open position
          </span>
        </div>
      </Card>
    );
  }

  const isLong = position.side === "BUY";
  const isProfitable =
    position.unrealized_pnl_usdt !== null && position.unrealized_pnl_usdt >= 0;

  return (
    <Card
      className={`mb-8 p-4 ${
        isLong
          ? "border-emerald-800/50 bg-emerald-950/20"
          : "border-red-800/50 bg-red-950/20"
      }`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-bold ${
            isLong
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isLong ? "LONG" : "SHORT"}
        </span>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-zinc-500">Entry Capital </span>
            <span className="font-medium text-zinc-200">
              {position.entry_capital !== null
                ? formatCurrency(position.entry_capital)
                : "N/A"}
            </span>
          </div>

          <div>
            <span className="text-zinc-500">Current Capital </span>
            <span className="font-medium text-zinc-200">
              {position.current_capital !== null
                ? formatCurrency(position.current_capital)
                : "N/A"}
            </span>
          </div>

          <div>
            <span className="text-zinc-500">Unrealized P&L </span>
            <span
              className={`font-bold ${
                isProfitable ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {position.unrealized_pnl_usdt !== null
                ? `${formatCurrency(position.unrealized_pnl_usdt)} (${formatPercent(position.unrealized_pnl_pct)})`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
