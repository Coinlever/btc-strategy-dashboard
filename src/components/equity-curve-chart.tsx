"use client";

import { useMemo, useState, useCallback } from "react";
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

type SeriesKey = "strategy" | "stepChart" | "btc";

export function EquityCurveChart({ equityCurve }: EquityCurveChartProps) {
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());

  const toggleSeries = useCallback((dataKey: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      const key = dataKey as SeriesKey;
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const data = useMemo(() => {
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
    strategy: "Strategy (incl. unrealised PnL)",
    stepChart: "Strategy (Realised PnL Only)",
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
            wrapperStyle={{ color: "#a1a1aa", cursor: "pointer" }}
            formatter={(value: string) => {
              const label = nameMap[value] ?? value;
              const isHidden = hidden.has(value as SeriesKey);
              return (
                <span style={{ opacity: isHidden ? 0.35 : 1 }}>
                  {label}
                </span>
              );
            }}
            onClick={(e) => {
              if (e && e.dataKey) {
                toggleSeries(String(e.dataKey));
              }
            }}
          />
          <Line
            type="monotone"
            dataKey="strategy"
            stroke="#34d399"
            dot={false}
            strokeWidth={2}
            hide={hidden.has("strategy")}
          />
          <Line
            type="stepAfter"
            dataKey="stepChart"
            stroke="#818cf8"
            dot={false}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            connectNulls
            hide={hidden.has("stepChart")}
          />
          <Line
            type="monotone"
            dataKey="btc"
            stroke="#f59e0b"
            dot={false}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            hide={hidden.has("btc")}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
