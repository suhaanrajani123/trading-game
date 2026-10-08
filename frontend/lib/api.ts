/**
 * Typed client for the Tradepath API. The backend is the single source of
 * truth for cash, positions and orders — nothing about money is computed here.
 */
import type {
  Asset, Candle, ChartRange, Lesson, LessonCompleteResult, MarketStatus,
  Order, OrderRequest, OrderStatus, Portfolio, Quote,
} from "@/types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

const DEVICE_KEY = "deviceId"; // same key as v1, so existing players keep their account

/** Anonymous player ID, generated once per browser. */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server-render";
  try {
    let id = window.localStorage.getItem(DEVICE_KEY);
    if (!id || !/^[A-Za-z0-9_-]{6,64}$/.test(id)) {
      const rand = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      id = `guest-${rand}`;
      window.localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    // Storage blocked (private mode etc.): fall back to a per-tab ID.
    const w = window as unknown as { __tpId?: string };
    w.__tpId ??= `guest-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    return w.__tpId;
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", "X-User-ID": getDeviceId(), ...(init?.headers || {}) },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Can't reach the Tradepath server. Check that the backend is running.", 0);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(readDetail(body.detail) || `Request failed (${res.status}).`, res.status);
  }
  return res.json() as Promise<T>;
}

/** FastAPI returns either a string or a list of validation errors. */
function readDetail(detail: unknown): string | null {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg).replace(/^Value error, /, "");
  return null;
}

const enc = encodeURIComponent;

/** Notify any mounted view that cash/positions changed. */
export function emitPortfolioChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("tp:portfolio-changed"));
}

export const api = {
  // Market data
  quote: (symbol: string) => request<Quote>(`/market/quote/${enc(symbol)}`),
  quotes: (symbols: string[]) =>
    request<Record<string, Quote>>(`/market/quotes?symbols=${enc(symbols.join(","))}`),
  history: (symbol: string, range: ChartRange) =>
    request<Candle[]>(`/market/history/${enc(symbol)}?range=${range}`),
  search: (q: string) => request<Asset[]>(`/market/search?q=${enc(q)}`),
  marketStatus: () => request<MarketStatus>("/market/status"),

  // Account
  portfolio: () => request<Portfolio>("/portfolio"),
  resetPortfolio: () => request<Portfolio>("/portfolio/reset", { method: "POST" }),
  orders: (status?: OrderStatus) => request<Order[]>(`/orders${status ? `?status=${status}` : ""}`),
  placeOrder: (order: OrderRequest) => request<Order>("/orders", { method: "POST", body: JSON.stringify(order) }),
  cancelOrder: (id: number) => request<Order>(`/orders/${id}`, { method: "DELETE" }),

  // Learning
  lessons: () => request<Lesson[]>("/game/levels"),
  completeLesson: (level_id: number) =>
    request<LessonCompleteResult>("/game/complete", { method: "POST", body: JSON.stringify({ level_id }) }),
};
