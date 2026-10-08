"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { POPULAR_STOCKS } from "@/lib/popularStocks";
import { pct, tone } from "@/lib/format";
import SymbolMark from "@/components/SymbolMark";
import type { Quote } from "@/types";

const SYMBOLS = POPULAR_STOCKS.filter((s) => s.sector !== "Index fund").map((s) => s.symbol);

/** Biggest movers among well-known stocks, from one batched quote request. */
export default function Watchlist() {
  const [view, setView] = useState<"up" | "down">("up");
  const { data, error } = useResource(() => api.quotes(SYMBOLS), [], { intervalMs: 45_000 });
  const rows = data
    ? Object.values(data)
        .sort((a, b) => (view === "up" ? b.change_percent - a.change_percent : a.change_percent - b.change_percent))
        .slice(0, 6)
    : [];

  return (
    <section className="panel" aria-labelledby="movers-title">
      <div className="panel-head">
        <h2 id="movers-title" className="panel-title">Biggest moves today</h2>
        <div className="seg" role="group" aria-label="Direction">
          <button aria-pressed={view === "up"} onClick={() => setView("up")}>Up</button>
          <button aria-pressed={view === "down"} onClick={() => setView("down")}>Down</button>
        </div>
      </div>
      {error ? (
        <p className="px-5 pb-5 text-sm text-inksoft">{error}</p>
      ) : (
        <ul className="pb-2">
          {(rows.length ? rows : (Array.from({ length: 6 }, () => null) as (Quote | null)[])).map((q, i) =>
            q ? (
              <li key={q.symbol}>
                <Link href={`/trade?symbol=${q.symbol}`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-surface2/60">
                  <SymbolMark symbol={q.symbol} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{q.symbol}</span>
                    <span className="block text-[13px] text-inksoft truncate">
                      {POPULAR_STOCKS.find((s) => s.symbol === q.symbol)?.name}
                    </span>
                  </span>
                  <span className="num text-right">
                    <span className="block text-sm">{q.price.toFixed(2)}</span>
                    <span className={`block text-[13px] ${tone(q.change)}`}>{pct(q.change_percent)}</span>
                  </span>
                </Link>
              </li>
            ) : (
              <li key={i} className="flex items-center gap-3 px-5 py-2.5">
                <span className="skeleton w-[30px] h-[30px]" />
                <span className="skeleton h-4 flex-1" />
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
