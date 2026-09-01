import { Quote, Candle, Portfolio, OrderRequest, OrderRecord, GameLevel, Position } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface GameState {
  cash: number;
  xp: number;
  current_level: number;
  positions: Position[];
  orders: OrderRecord[];
  completed_levels: number[];
}

function loadState(): GameState {
  if (typeof window === "undefined") return defaultState();
  const raw = localStorage.getItem("trading_game_state");
  if (!raw) {
    const s = defaultState();
    saveState(s);
    return s;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return defaultState();
  }
}

function saveState(state: GameState) {
  if (typeof window !== "undefined") {
    localStorage.setItem("trading_game_state", JSON.stringify(state));
  }
}

function defaultState(): GameState {
  return {
    cash: 100000.0,
    xp: 0,
    current_level: 1,
    positions: [],
    orders: [],
    completed_levels: [],
  };
}

function getDeviceId() {
  if (typeof window === "undefined") return "server-side";
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = "guest-" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const userId = getDeviceId();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 
      "Content-Type": "application/json", 
      "X-User-ID": userId,
      ...(options?.headers || {}) 
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getQuote: (symbol: string) => request<Quote>(`/market/quote/${symbol}`),
  
  getHistory: (symbol: string, period = "1mo", interval = "1d") =>
    request<Candle[]>(`/market/history/${symbol}?period=${period}&interval=${interval}`),
    
  getPortfolio: async (): Promise<Portfolio> => {
    const state = loadState();
    const positions_out: Position[] = [];
    let total_market_value = 0.0;

    for (const pos of state.positions) {
      if (pos.quantity <= 0) continue;
      let current_price = pos.avg_cost;
      try {
        const q = await api.getQuote(pos.symbol);
        current_price = q.price;
      } catch (e) {
        // use avg_cost if quote fails
      }
      
      const market_value = current_price * pos.quantity;
      const unrealized_pnl = (current_price - pos.avg_cost) * pos.quantity;
      total_market_value += market_value;
      
      positions_out.push({
        symbol: pos.symbol,
        quantity: pos.quantity,
        avg_cost: pos.avg_cost,
        current_price,
        market_value: parseFloat(market_value.toFixed(2)),
        unrealized_pnl: parseFloat(unrealized_pnl.toFixed(2)),
      });
    }

    return {
      cash: parseFloat(state.cash.toFixed(2)),
      positions: positions_out,
      total_market_value: parseFloat(total_market_value.toFixed(2)),
      total_equity: parseFloat((state.cash + total_market_value).toFixed(2)),
      xp: state.xp,
      current_level: state.current_level,
    };
  },

  placeOrder: async (order: OrderRequest): Promise<OrderRecord> => {
    const state = loadState();
    const symbol = order.symbol.toUpperCase();
    if (order.quantity <= 0) throw new Error("Quantity must be greater than zero.");
    
    const quote = await api.getQuote(symbol);
    let exec_price = quote.price;

    if (order.order_type === "limit") {
      if (order.limit_price === undefined) throw new Error("Limit orders require a limit_price.");
      if (order.side === "buy" && exec_price > order.limit_price) throw new Error("Market price is above your limit — order not filled yet.");
      if (order.side === "sell" && exec_price < order.limit_price) throw new Error("Market price is below your limit — order not filled yet.");
      exec_price = order.limit_price;
    }

    const posIndex = state.positions.findIndex(p => p.symbol === symbol);
    let position = posIndex >= 0 ? state.positions[posIndex] : null;
    let realized_pnl: number | null = null;

    if (order.side === "buy") {
      const cost = exec_price * order.quantity;
      if (cost > state.cash) throw new Error("Not enough cash for this trade.");
      state.cash -= cost;

      if (position) {
        const total_cost = position.avg_cost * position.quantity + cost;
        position.quantity += order.quantity;
        position.avg_cost = total_cost / position.quantity;
      } else {
        state.positions.push({ symbol, quantity: order.quantity, avg_cost: exec_price });
      }
    } else if (order.side === "sell") {
      if (!position || position.quantity < order.quantity) throw new Error("You don't own enough shares to sell that much.");
      const proceeds = exec_price * order.quantity;
      realized_pnl = (exec_price - position.avg_cost) * order.quantity;
      state.cash += proceeds;
      position.quantity -= order.quantity;
      if (position.quantity === 0) {
        state.positions.splice(posIndex, 1);
      }
    } else {
      throw new Error("side must be 'buy' or 'sell'.");
    }

    const new_order: OrderRecord = {
      id: Date.now(),
      symbol,
      side: order.side,
      order_type: order.order_type,
      quantity: order.quantity,
      price: exec_price,
      realized_pnl,
      timestamp: new Date().toISOString(),
    };
    state.orders.push(new_order);
    saveState(state);
    return new_order;
  },

  getOrderHistory: async (): Promise<OrderRecord[]> => {
    const state = loadState();
    return [...state.orders].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getLevels: async (): Promise<GameLevel[]> => {
    const levels = await request<GameLevel[]>("/game/levels");
    const state = loadState();
    return levels.map(l => ({
      ...l,
      completed: state.completed_levels.includes(l.id)
    }));
  },

  completeLevel: async (level_id: number) => {
    const levels = await request<GameLevel[]>("/game/levels");
    const level = levels.find(l => l.id === level_id);
    if (!level) throw new Error("Level not found.");
    
    const state = loadState();
    if (state.completed_levels.includes(level_id)) {
      return { message: "Level already completed.", xp_gained: 0, total_xp: state.xp };
    }
    
    state.completed_levels.push(level_id);
    state.xp += level.xp_reward;
    if (level_id >= state.current_level) {
      state.current_level = level_id + 1;
    }
    
    saveState(state);
    return { message: `Level ${level_id} complete!`, xp_gained: level.xp_reward, total_xp: state.xp };
  },
};
