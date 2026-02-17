"use client";

import type { Metadata } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface DashboardHeaderProps {
  metadata: Metadata;
}

export function DashboardHeader({ metadata }: DashboardHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
        {metadata.strategy_name}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
        <span>{metadata.asset}</span>
        <span className="text-zinc-600">|</span>
        <span>{metadata.exchange}</span>
        <span className="text-zinc-600">|</span>
        <span>
          {formatDate(metadata.start_date)} &mdash;{" "}
          {formatDate(metadata.end_date)}
        </span>
      </div>
      <div className="mt-2">
        <span className="inline-flex items-center rounded-md bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
          Last updated: {formatDate(metadata.last_updated)}
        </span>
      </div>
    </header>
  );
}
