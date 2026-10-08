"use client";
import Link from "next/link";
import { api } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { TICKER_TAPE } from "@/lib/popularStocks";
import { pct, tone } from "@/lib/format";

export default function Ticker() {
  const { data } = useResource(() => api.quotes(TICKER_TAPE), [], { intervalMs: 30_000 });
  const quotes = data ? TICKER_TAPE.map((s) => data[s]).filter(Boolean) : [];

  if (quotes.length === 0) return <div className="h-9 border-b border-line" aria-hidden="true" />;

  // Two identical copies scroll by exactly half their width, so the loop is seamless.
  const loop = [...quotes, ...quotes, ...quotes, ...quotes];
  return (
    <div className="h-9 border-b border-line overflow-hidden relative" aria-label="Market prices">
      <div className="flex w-max animate-ticker">
        {loop.map((q, i) => (
          <Link
            key={`${q.symbol}-${i}`}
            href={`/trade?symbol=${q.symbol}`}
            tabIndex={i < quotes.length ? 0 : -1}
            aria-hidden={i >= quotes.length}
            className="num flex items-center gap-2 h-9 px-5 text-[13px] border-r border-line/70 hover:bg-surface2/70"
          >
            <span className="font-semibold">{q.symbol}</span>
            <span className="text-inksoft">{q.price.toFixed(2)}</span>
            <span className={tone(q.change)}>{pct(q.change_percent)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
