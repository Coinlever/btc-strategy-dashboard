export interface DashboardData {
  metadata: Metadata;
  equity_curve: EquityCurve;
  drawdown: Drawdown;
  monthly_returns: Record<string, Record<string, number | null>>;
  rolling_sharpe: RollingSharpe;
  statistics: Statistics;
  per_trade_returns: PerTradeReturn[];
  current_position: CurrentPosition;
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
  max_trade_drawdown_pct: number | null;
}

export interface PerTradeReturn {
  trade_id: number;
  side: string;
  status: string;
  return_pct: number;
  cv_start: number;
  cv_exit: number;
}

export interface CurrentPosition {
  is_open: boolean;
  side: string | null;
  entry_capital: number | null;
  current_capital: number | null;
  unrealized_pnl_usdt: number | null;
  unrealized_pnl_pct: number | null;
}
