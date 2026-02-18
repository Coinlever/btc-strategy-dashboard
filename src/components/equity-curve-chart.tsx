"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { EquityCurve } from "@/lib/types";
import { Card } from "@/components/card";
import { formatCurrency } from "@/lib/utils";

interface EquityCurveChartProps {
  equityCurve: EquityCurve;
}

export function EquityCurveChart({ equityCurve }: EquityCurveChartProps) {
  const data = useMemo(() => {
    // Downsample to ~500 points for performance
    const step = Math.max(1, Math.floor(equityCurve.dates.length / 500));
    const sampled = [];
    for (let i = 0; i < equityCurve.dates.length; i += step) {
      sampled.push({
        date: equityCurve.dates[i],
        strategy: equityCurve.portfolio_value[i],
        btc: equityCurve.btc_benchmark[i],
        stepChart: equityCurve.step_chart?.[i] ?? null,
      });
    }
    // Always include last point
    const last = equityCurve.dates.length - 1;
    if (sampled[sampled.length - 1]?.date !== equityCurve.dates[last]) {
      sampled.push({
        date: equityCurve.dates[last],
        strategy: equityCurve.portfolio_value[last],
        btc: equityCurve.btc_benchmark[last],
        stepChart: equityCurve.step_chart?.[last] ?? null,
      });
    }
    return sampled;
  }, [equityCurve]);

  const nameMap: Record<string, string> = {
    strategy: "Strategy (daily)",
    stepChart: "Strategy (trades only)",
    btc: "BTC Buy & Hold",
  };

  return (
    <Card className="mb-8 p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-200">
        Equity Curve
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            tickFormatter={(val: string) => {
              const d = new Date(val);
              return d.toLocaleDateString("en-US", {
                year: "2-digit",
                month: "short",
              });
            }}
            interval={Math.floor(data.length / 8)}
          />
          <YAxis
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            tickFormatter={(val: number) => formatCurrency(val)}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value, name) => [
              typeof value === "number" ? formatCurrency(value) : "N/A",
              nameMap[String(name)] ?? String(name),
            ]}
            labelFormatter={(label) =>
              new Date(String(label)).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            }
          />
          <Legend
            wrapperStyle={{ color: "#a1a1aa" }}
            formatter={(value: string) => nameMap[value] ?? value}
          />
          <Line
            type="monotone"
            dataKey="strategy"
            stroke="#34d399"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="stepAfter"
            dataKey="stepChart"
            stroke="#818cf8"
            dot={false}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="btc"
            stroke="#f59e0b"
            dot={false}
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
