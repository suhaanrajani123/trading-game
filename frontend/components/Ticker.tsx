"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Quote } from "@/types";
import { ArrowUp, ArrowDown } from "lucide-react";

const TICKER_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "AMZN", "SPY", "META"];

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
    return <div className="h-[52px] border-b border-border/60 bg-transparent opacity-60" />;
  }

  const items = [...quotes, ...quotes];

  return (
    <div className="h-[52px] border-b border-border/60 bg-surface/50 backdrop-blur-md overflow-hidden flex items-center relative z-10">
      <div className="flex gap-10 animate-ticker whitespace-nowrap px-5">
        {items.map((q, i) => {
          const positive = q.change >= 0;
          return (
            <span key={`${q.symbol}-${i}`} className="font-mono text-xs flex items-center gap-2.5">
              <span className="text-muted font-medium">{q.symbol}</span>
              <span className="text-text">${q.price.toFixed(2)}</span>
              <span className={`flex items-center gap-0.5 ${positive ? "text-gain" : "text-loss"}`}>
                {positive ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                {Math.abs(q.change_percent).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
