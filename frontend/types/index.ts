// Mirrors backend/schemas.py — keep the two in sync.

export interface Quote {
  symbol: string;
  name: string | null;
  price: number;
  change: number;
  change_percent: number;
  prev_close: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  currency: string;
  feed: string;
  is_delayed: boolean;
  updated_at: string | null;
}

export interface Candle {
  /** "YYYY-MM-DD" for daily+ ranges, unix seconds (UTC) for intraday */
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type ChartRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "MAX";

export interface Asset {
  symbol: string;
  name: string;
  exchange: string;
}

export interface MarketStatus {
  is_open: boolean;
  next_open: string | null;
  next_close: string | null;
}

export interface Position {
  symbol: string;
  name: string | null;
  quantity: number;
  avg_cost: number;
  current_price: number;
  market_value: number;
  cost_basis: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  day_change: number;
  day_change_percent: number;
  weight: number;
  price_is_live: boolean;
}

export interface Portfolio {
  cash: number;
  buying_power: number;
  reserved_cash: number;
  positions: Position[];
  total_market_value: number;
  total_equity: number;
  total_unrealized_pnl: number;
  total_realized_pnl: number;
  day_change: number;
  day_change_percent: number;
  starting_cash: number;
  total_return: number;
  total_return_percent: number;
  open_orders: number;
  xp: number;
  current_level: number;
}

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";
export type OrderStatus = "open" | "filled" | "cancelled";

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  order_type: OrderType;
  quantity: number;
  limit_price?: number;
}

export interface Order {
  id: number;
  symbol: string;
  side: OrderSide;
  order_type: OrderType;
  status: OrderStatus;
  quantity: number;
  price: number | null;
  limit_price: number | null;
  realized_pnl: number | null;
  note: string | null;
  timestamp: string;
  filled_at: string | null;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  lesson: string;
  unlocks: string[];
  xp_reward: number;
  locked: boolean;
  completed: boolean;
}

export interface LessonCompleteResult {
  message: string;
  xp_gained: number;
  total_xp: number;
  current_level: number;
}

export type HistoryRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

export interface HistoryPoint {
  /** "YYYY-MM-DD" for daily resolution, unix seconds for intraday */
  time: string | number;
  total: number;
  cash: number;
  holdings: Record<string, number>;
}

export interface PortfolioHistory {
  range: HistoryRange;
  resolution: string;
  intraday: boolean;
  started_at: string;
  starting_cash: number;
  symbols: string[];
  points: HistoryPoint[];
  change: number;
  change_percent: number;
}
