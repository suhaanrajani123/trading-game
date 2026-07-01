"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Quote } from "@/types";

const TICKER_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "AMZN", "SPY"];

export default function Ticker() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const results = await Promise.allSettled(TICKER_SYMBOLS.map((s) => api.getQuote(s)));
      if (!active) return;
      setQuotes(
        results
          .filter((r): r is PromiseFulfilledResult<Quote> => r.status === "fulfilled")
          .map((r) => r.value)
      );
    }

    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (quotes.length === 0) {
    return <div className="h-10 border-b border-border bg-surface" />;
  }

  const items = [...quotes, ...quotes]; // duplicate for seamless loop

  return (
    <div className="h-10 border-b border-border bg-surface overflow-hidden flex items-center">
      <div className="flex gap-8 animate-ticker whitespace-nowrap px-4">
        {items.map((q, i) => {
          const positive = q.change >= 0;
          return (
            <span key={`${q.symbol}-${i}`} className="font-mono text-xs flex items-center gap-2">
              <span className="text-muted">{q.symbol}</span>
              <span>${q.price.toFixed(2)}</span>
              <span className={positive ? "text-gain" : "text-loss"}>
                {positive ? "▲" : "▼"} {Math.abs(q.change_percent).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
