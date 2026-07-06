"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Quote } from "@/types";
import { Flame, ArrowUp, ArrowDown } from "lucide-react";
import StockLogo from "@/components/StockLogo";

const WATCH_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "NFLX", "AMD", "DIS", "NKE", "JPM"];

export default function TopMovers() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [tab, setTab] = useState<"gainers" | "losers">("gainers");

  useEffect(() => {
    let active = true;
    async function load() {
      const results = await Promise.allSettled(WATCH_SYMBOLS.map((s) => api.getQuote(s)));
      if (!active) return;
      setQuotes(
        results
          .filter((r): r is PromiseFulfilledResult<Quote> => r.status === "fulfilled")
          .map((r) => r.value)
      );
    }
    load();
    const interval = setInterval(load, 45000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const sorted = [...quotes].sort((a, b) =>
    tab === "gainers" ? b.change_percent - a.change_percent : a.change_percent - b.change_percent
  );
  const top = sorted.slice(0, 5);

  return (
    <div className="glass rounded-2xl shadow-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-xp" />
          <h3 className="font-display font-semibold text-sm">Top Movers</h3>
        </div>
        <div className="flex gap-1 glass rounded-lg p-0.5">
          {(["gainers", "losers"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors ${
                tab === t ? "bg-brand text-white" : "text-muted hover:text-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {top.length === 0 ? (
        <p className="text-xs text-muted py-4 text-center">Loading movers…</p>
      ) : (
        <ul className="space-y-1">
          {top.map((q) => {
            const positive = q.change_percent >= 0;
            return (
              <li key={q.symbol} className="flex items-center justify-between px-1 py-2 rounded-lg glass-hover">
                <div className="flex items-center gap-2.5">
                  <StockLogo symbol={q.symbol} size={24} />
                  <span className="font-mono text-sm font-medium">{q.symbol}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs">${q.price.toFixed(2)}</p>
                  <p className={`font-mono text-[11px] flex items-center justify-end gap-0.5 ${positive ? "text-gain" : "text-loss"}`}>
                    {positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {Math.abs(q.change_percent).toFixed(2)}%
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
