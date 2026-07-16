import { Quote, Candle, Portfolio, OrderRequest, OrderRecord, GameLevel } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  getPortfolio: () => request<Portfolio>("/portfolio"),
  placeOrder: (order: OrderRequest) =>
    request<OrderRecord>("/orders", { method: "POST", body: JSON.stringify(order) }),
  getOrderHistory: () => request<OrderRecord[]>("/orders"),
  getLevels: () => request<GameLevel[]>("/game/levels"),
  completeLevel: (level_id: number) =>
    request<{ message: string; xp_gained: number; total_xp: number }>("/game/complete", {
      method: "POST",
      body: JSON.stringify({ level_id }),
    }),
};
