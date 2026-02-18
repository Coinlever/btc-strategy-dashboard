import fs from "fs";
import path from "path";
import { Dashboard } from "@/components/dashboard";
import type { DashboardData } from "@/lib/types";

export default function Page() {
  const filePath = path.join(process.cwd(), "public/data/dashboard.json");

  let data: DashboardData | null = null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    // Provide defaults for fields that may not exist in older JSON exports
    const eq = parsed.equity_curve ?? {};
    const dd = parsed.drawdown ?? {};
    data = {
      ...parsed,
      equity_curve: {
        ...eq,
        step_chart: eq.step_chart ?? [],
      },
      drawdown: {
        ...dd,
        trade_only_drawdown_pct: dd.trade_only_drawdown_pct ?? [],
        btc_drawdown_pct: dd.btc_drawdown_pct ?? [],
      },
      per_trade_returns: parsed.per_trade_returns ?? [],
      current_position: parsed.current_position ?? {
        is_open: false,
        side: null,
        entry_capital: null,
        current_capital: null,
        unrealized_pnl_usdt: null,
        unrealized_pnl_pct: null,
      },
      statistics: {
        ...parsed.statistics,
        max_trade_drawdown_pct: parsed.statistics?.max_trade_drawdown_pct ?? null,
        strategy_vs_btc_pct: parsed.statistics?.strategy_vs_btc_pct ?? null,
      },
    };
  } catch {
    // File doesn't exist yet — show placeholder
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">
          Dashboard data not available. Run the export script to generate data.
        </p>
      </main>
    );
  }

  return <Dashboard data={data} />;
}
