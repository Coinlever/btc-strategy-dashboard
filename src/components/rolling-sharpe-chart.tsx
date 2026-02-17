"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { RollingSharpe } from "@/lib/types";
import { Card } from "@/components/card";

interface RollingSharpeChartProps {
  rollingSharpe: RollingSharpe;
}

export function RollingSharpeChart({
  rollingSharpe,
}: RollingSharpeChartProps) {
  const data = useMemo(() => {
    // Filter out leading nulls and downsample
    const validStart = rollingSharpe.sharpe_90d.findIndex(
      (v) => v !== null
    );
    if (validStart === -1) return [];

    const dates = rollingSharpe.dates.slice(validStart);
    const values = rollingSharpe.sharpe_90d.slice(validStart);

    const step = Math.max(1, Math.floor(dates.length / 500));
    const sampled = [];
    for (let i = 0; i < dates.length; i += step) {
      sampled.push({
        date: dates[i],
        sharpe: values[i],
      });
    }
    const last = dates.length - 1;
    if (sampled[sampled.length - 1]?.date !== dates[last]) {
      sampled.push({
        date: dates[last],
        sharpe: values[last],
      });
    }
    return sampled;
  }, [rollingSharpe]);

  return (
    <Card className="mb-8 p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-200">
        Rolling Sharpe Ratio (90-day)
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
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
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value) => [
              typeof value === "number" ? value.toFixed(2) : "N/A",
              "Sharpe",
            ]}
            labelFormatter={(label) =>
              new Date(String(label)).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            }
          />
          <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="3 3" />
          <ReferenceLine y={1} stroke="#3f3f46" strokeDasharray="2 4" />
          <ReferenceLine y={2} stroke="#3f3f46" strokeDasharray="2 4" />
          <Line
            type="monotone"
            dataKey="sharpe"
            stroke="#06b6d4"
            dot={false}
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
