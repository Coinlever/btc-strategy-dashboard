"use client";

import { useMemo, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { Drawdown } from "@/lib/types";
import { Card } from "@/components/card";

interface DrawdownChartProps {
  drawdown: Drawdown;
}

type SeriesKey = "strategy" | "tradeOnly" | "btc";

export function DrawdownChart({ drawdown }: DrawdownChartProps) {
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
    const step = Math.max(1, Math.floor(drawdown.dates.length / 500));
    const sampled = [];
    for (let i = 0; i < drawdown.dates.length; i += step) {
      sampled.push({
        date: drawdown.dates[i],
        strategy: drawdown.drawdown_pct[i],
        tradeOnly: drawdown.trade_only_drawdown_pct?.[i] ?? null,
        btc: drawdown.btc_drawdown_pct?.[i] ?? null,
      });
    }
    const last = drawdown.dates.length - 1;
    if (sampled[sampled.length - 1]?.date !== drawdown.dates[last]) {
      sampled.push({
        date: drawdown.dates[last],
        strategy: drawdown.drawdown_pct[last],
        tradeOnly: drawdown.trade_only_drawdown_pct?.[last] ?? null,
        btc: drawdown.btc_drawdown_pct?.[last] ?? null,
      });
    }
    return sampled;
  }, [drawdown]);

  const nameMap: Record<string, string> = {
    strategy: "Strategy (incl. unrealised PnL)",
    tradeOnly: "Strategy (Realised PnL Only)",
    btc: "BTC Buy & Hold",
  };

  return (
    <Card className="mb-8 p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-200">Drawdown</h2>
      <ResponsiveContainer width="100%" height={300}>
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
            tickFormatter={(val: number) => `${val.toFixed(0)}%`}
            width={50}
            domain={["dataMin", 0]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value, name) => [
              typeof value === "number" ? `${value.toFixed(2)}%` : "N/A",
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
          <Area
            type="monotone"
            dataKey="strategy"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={hidden.has("strategy") ? 0 : 0.1}
            strokeWidth={1.5}
            hide={hidden.has("strategy")}
          />
          <Line
            type="stepAfter"
            dataKey="tradeOnly"
            stroke="#818cf8"
            dot={false}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            connectNulls
            hide={hidden.has("tradeOnly")}
          />
          <Line
            type="monotone"
            dataKey="btc"
            stroke="#f59e0b"
            dot={false}
            strokeWidth={1}
            strokeDasharray="4 2"
            hide={hidden.has("btc")}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
