"use client";

import { useMemo } from "react";
import { Card } from "@/components/card";

interface MonthlyHeatmapProps {
  monthlyReturns: Record<string, Record<string, number | null>>;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getCellColor(value: number | null | undefined): string {
  if (value === null || value === undefined) return "bg-zinc-800/50";
  if (value >= 20) return "bg-emerald-500/80 text-zinc-950";
  if (value >= 10) return "bg-emerald-500/60 text-zinc-950";
  if (value >= 5) return "bg-emerald-500/40";
  if (value > 0) return "bg-emerald-500/20";
  if (value === 0) return "bg-zinc-800/50";
  if (value > -5) return "bg-red-500/20";
  if (value > -10) return "bg-red-500/40";
  if (value > -20) return "bg-red-500/60 text-zinc-50";
  return "bg-red-500/80 text-zinc-50";
}

export function MonthlyHeatmap({ monthlyReturns }: MonthlyHeatmapProps) {
  const years = useMemo(() => {
    return Object.keys(monthlyReturns).sort();
  }, [monthlyReturns]);

  return (
    <Card className="mb-8 p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-200">
        Monthly Returns (%)
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-zinc-500">
                Year
              </th>
              {MONTHS.map((month) => (
                <th
                  key={month}
                  className="px-2 py-1.5 text-center text-xs font-medium text-zinc-500"
                >
                  {month}
                </th>
              ))}
              <th className="px-2 py-1.5 text-center text-xs font-medium text-zinc-500">
                Annual
              </th>
            </tr>
          </thead>
          <tbody>
            {years.map((year) => {
              const yearData = monthlyReturns[year];
              // Compute annual return by compounding monthly
              let annual = 1;
              let hasData = false;
              for (let m = 1; m <= 12; m++) {
                const val = yearData[String(m)];
                if (val !== null && val !== undefined) {
                  annual *= 1 + val / 100;
                  hasData = true;
                }
              }
              const annualReturn = hasData ? (annual - 1) * 100 : null;

              return (
                <tr key={year}>
                  <td className="px-2 py-1 text-xs font-medium text-zinc-400">
                    {year}
                  </td>
                  {Array.from({ length: 12 }, (_, i) => {
                    const val = yearData[String(i + 1)];
                    return (
                      <td key={i} className="px-1 py-1">
                        <div
                          className={`rounded px-1.5 py-1 text-center text-xs font-mono ${getCellColor(val)}`}
                        >
                          {val !== null && val !== undefined
                            ? `${val >= 0 ? "+" : ""}${val.toFixed(1)}`
                            : ""}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-1 py-1">
                    <div
                      className={`rounded px-1.5 py-1 text-center text-xs font-bold font-mono ${getCellColor(annualReturn)}`}
                    >
                      {annualReturn !== null
                        ? `${annualReturn >= 0 ? "+" : ""}${annualReturn.toFixed(1)}`
                        : ""}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
