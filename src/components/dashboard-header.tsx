"use client";

import type { Metadata } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface DashboardHeaderProps {
  metadata: Metadata;
  availableYears: number[];
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
}

export function DashboardHeader({
  metadata,
  availableYears,
  selectedYear,
  onYearChange,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            {metadata.strategy_name}
          </h1>
          <div className="mt-2">
            <span className="inline-flex items-center rounded-md bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
              Last updated: {formatDate(metadata.last_updated)}
            </span>
          </div>
        </div>

        {availableYears.length > 1 && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="start-year"
              className="text-sm font-medium text-zinc-400"
            >
              Start year
            </label>
            <select
              id="start-year"
              value={selectedYear === null ? "" : String(selectedYear)}
              onChange={(e) => {
                const val = e.target.value;
                onYearChange(val === "" ? null : Number(val));
              }}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            >
              <option value="">All</option>
              {availableYears.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </header>
  );
}
