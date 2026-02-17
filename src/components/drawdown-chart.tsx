"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Drawdown } from "@/lib/types";
import { Card } from "@/components/card";

interface DrawdownChartProps {
  drawdown: Drawdown;
}

export function DrawdownChart({ drawdown }: DrawdownChartProps) {
  const data = useMemo(() => {
    const step = Math.max(1, Math.floor(drawdown.dates.length / 500));
    const sampled = [];
    for (let i = 0; i < drawdown.dates.length; i += step) {
      sampled.push({
        date: drawdown.dates[i],
        drawdown: drawdown.drawdown_pct[i],
      });
    }
    const last = drawdown.dates.length - 1;
    if (sampled[sampled.length - 1]?.date !== drawdown.dates[last]) {
      sampled.push({
        date: drawdown.dates[last],
        drawdown: drawdown.drawdown_pct[last],
      });
    }
    return sampled;
  }, [drawdown]);

  return (
    <Card className="mb-8 p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-200">Drawdown</h2>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
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
            formatter={(value) => [
              typeof value === "number" ? `${value.toFixed(2)}%` : "N/A",
              "Drawdown",
            ]}
            labelFormatter={(label) =>
              new Date(String(label)).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            }
          />
          <Area
            type="monotone"
            dataKey="drawdown"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.15}
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
