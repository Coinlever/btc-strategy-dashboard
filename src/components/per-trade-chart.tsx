"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import type { PerTradeReturn } from "@/lib/types";
import { Card } from "@/components/card";

interface PerTradeChartProps {
  trades: PerTradeReturn[];
  maxTradeDrawdownPct: number | null;
}

export function PerTradeChart({
  trades,
  maxTradeDrawdownPct,
}: PerTradeChartProps) {
  const data = useMemo(() => {
    return trades.map((t) => ({
      name: `#${t.trade_id}`,
      return_pct: t.return_pct,
      side: t.side,
      status: t.status,
    }));
  }, [trades]);

  if (data.length === 0) return null;

  return (
    <Card className="mb-8 p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-zinc-200">
          Per-Trade Returns
        </h2>
        {maxTradeDrawdownPct !== null && (
          <span className="text-sm text-zinc-400">
            Worst trade:{" "}
            <span className="font-medium text-red-400">
              {maxTradeDrawdownPct.toFixed(2)}%
            </span>
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            interval={Math.max(0, Math.floor(data.length / 15))}
          />
          <YAxis
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            tickFormatter={(val: number) => `${val.toFixed(0)}%`}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value) => [
              typeof value === "number" ? `${value.toFixed(2)}%` : "N/A",
              "Return",
            ]}
            labelFormatter={(label) => `Trade ${label}`}
          />
          <ReferenceLine y={0} stroke="#3f3f46" />
          <Bar dataKey="return_pct" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.return_pct >= 0 ? "#34d399" : "#ef4444"}
                fillOpacity={0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
