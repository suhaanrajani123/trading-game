export interface Quote {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  currency: string;
  is_delayed: boolean;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  avg_cost: number;
  current_price?: number;
  market_value?: number;
  unrealized_pnl?: number;
}

export interface Portfolio {
  cash: number;
  positions: Position[];
  total_market_value: number;
  total_equity: number;
  xp: number;
  current_level: number;
}

export interface OrderRequest {
  symbol: string;
  side: "buy" | "sell";
  order_type: "market" | "limit";
  quantity: number;
  limit_price?: number;
}

export interface OrderRecord {
  id: number;
  symbol: string;
  side: string;
  order_type: string;
  quantity: number;
  price: number;
  realized_pnl: number | null;
  timestamp: string;
}

export interface GameLevel {
  id: number;
  title: string;
  description: string;
  lesson: string;
  unlocks: string[];
  xp_reward: number;
  locked: boolean;
  completed: boolean;
}
