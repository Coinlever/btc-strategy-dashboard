export interface DashboardData {
  metadata: Metadata;
  equity_curve: EquityCurve;
  drawdown: Drawdown;
  monthly_returns: Record<string, Record<string, number | null>>;
  rolling_sharpe: RollingSharpe;
  statistics: Statistics;
}

export interface Metadata {
  strategy_name: string;
  asset: string;
  exchange: string;
  start_date: string;
  end_date: string;
  last_updated: string;
  starting_capital: number;
}

export interface EquityCurve {
  dates: string[];
  portfolio_value: number[];
  btc_benchmark: (number | null)[];
}

export interface Drawdown {
  dates: string[];
  drawdown_pct: number[];
}

export interface RollingSharpe {
  dates: string[];
  sharpe_90d: (number | null)[];
}

export interface Statistics {
  total_return_pct: number;
  sharpe_ratio: number | null;
  sortino_ratio: number | null;
  max_drawdown_pct: number;
  win_rate_pct: number | null;
  profit_factor: number | null;
  num_trades: number;
  expectancy_usdt: number | null;
  best_month_pct: number | null;
  worst_month_pct: number | null;
  winning_months: number;
  losing_months: number;
  starting_capital: number;
  final_capital: number;
  btc_buy_hold_return_pct: number | null;
}
