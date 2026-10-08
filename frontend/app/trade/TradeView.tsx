"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, X } from "lucide-react";
import { useAccount } from "@/components/AccountProvider";
import OrderTicket from "@/components/OrderTicket";
import StockChart from "@/components/StockChart";
import SymbolMark from "@/components/SymbolMark";
import { api, emitPortfolioChanged } from "@/lib/api";
import { useDebounced, useResource } from "@/lib/hooks";
import { POPULAR_STOCKS, knownName } from "@/lib/popularStocks";
import { compactNum, money, pct, shares, signedMoney, tone } from "@/lib/format";
import type { ChartRange, Quote } from "@/types";

const RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y", "5Y"];
const DEFAULT_SYMBOL = "AAPL";

/**
 * Master–detail trade screen: stock list (with search) on the left, the chart
 * and order ticket for the selected stock on the right. On phones the two are
 * separate screens: the list, then the stock once you tap one.
 */
export default function TradeView() {
  const params = useSearchParams();
  const router = useRouter();
  const picked = params.get("symbol")?.toUpperCase() ?? null;
  const symbol = picked ?? DEFAULT_SYMBOL;

  const select = (s: string) => router.replace(`/trade?symbol=${encodeURIComponent(s)}`, { scroll: false });

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start animate-rise [&>*]:min-w-0">
      <div className={picked ? "hidden lg:block" : ""}>
        <StockList active={picked ? symbol : null} desktopActive={symbol} onSelect={select} />
      </div>
      <div className={picked ? "" : "hidden lg:block"}>
        {picked && (
          <button onClick={() => router.push("/trade")} className="lg:hidden btn-ghost -ml-3 mb-2">
            <ArrowLeft size={16} /> All stocks
          </button>
        )}
        <SymbolView key={symbol} symbol={symbol} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* Left: searchable stock list                                               */
/* ------------------------------------------------------------------------- */

interface Row {
  symbol: string;
  name: string;
  detail: string;
}

function StockList({
  active,
  desktopActive,
  onSelect,
}: {
  active: string | null;
  desktopActive: string;
  onSelect: (symbol: string) => void;
}) {
  const [q, setQ] = useState("");
  const query = useDebounced(q.trim(), 200);
  const [remote, setRemote] = useState<Row[] | null>(null);
  const [searching, setSearching] = useState(false);

  // Search every US stock on the server; fall back to the local list if it's down.
  useEffect(() => {
    if (!query) {
      setRemote(null);
      return;
    }
    let cancelled = false;
    setSearching(true);
    api
      .search(query)
      .then((r) => !cancelled && setRemote(r.map((a) => ({ symbol: a.symbol, name: a.name, detail: a.exchange }))))
      .catch(() => !cancelled && setRemote(null))
      .finally(() => !cancelled && setSearching(false));
    return () => {
      cancelled = true;
    };
  }, [query]);

  const rows: Row[] = useMemo(() => {
    if (!query) return POPULAR_STOCKS.map((s) => ({ symbol: s.symbol, name: s.name, detail: s.sector }));
    if (remote) return remote;
    const ql = query.toLowerCase();
    return POPULAR_STOCKS.filter((s) => s.symbol.toLowerCase().startsWith(ql) || s.name.toLowerCase().includes(ql)).map(
      (s) => ({ symbol: s.symbol, name: s.name, detail: s.sector }),
    );
  }, [query, remote]);

  const symbols = rows.map((r) => r.symbol);
  const quotes = useResource(() => (symbols.length ? api.quotes(symbols) : Promise.resolve({} as Record<string, Quote>)), [symbols.join(",")], {
    intervalMs: 45_000,
  });

  return (
    <section className="panel lg:sticky lg:top-[124px] flex flex-col lg:max-h-[calc(100vh-148px)]" aria-label="Stocks">
      <div className="p-3 border-b border-line">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && rows[0]) onSelect(rows[0].symbol);
              if (e.key === "Escape") setQ("");
            }}
            placeholder="Search companies"
            aria-label="Search companies"
            className="field h-10 pl-9 pr-9"
            autoComplete="off"
            spellCheck={false}
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-6 h-6 rounded-md text-muted hover:text-ink"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <p className="mt-2 px-1 text-[12.5px] text-muted">
          {query ? (searching ? "Searching…" : `${rows.length} result${rows.length === 1 ? "" : "s"}`) : "Popular stocks"}
        </p>
      </div>

      <ul className="overflow-y-auto py-1">
        {rows.length === 0 && !searching && (
          <li className="px-4 py-6 text-sm text-inksoft">
            No companies match &ldquo;{query}&rdquo;.{" "}
            <button className="underline underline-offset-2 text-ink" onClick={() => onSelect(query.toUpperCase())}>
              Look up {query.toUpperCase()} anyway
            </button>
          </li>
        )}
        {rows.map((r) => {
          const quote = quotes.data?.[r.symbol];
          const isActive = r.symbol === (active ?? desktopActive);
          return (
            <li key={r.symbol}>
              <button
                onClick={() => onSelect(r.symbol)}
                aria-current={isActive ? "true" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left border-l-2 transition-colors ${
                  isActive ? "bg-surface2 border-marker" : "border-transparent hover:bg-surface2/60"
                }`}
              >
                <SymbolMark symbol={r.symbol} size={34} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold truncate">{r.name}</span>
                  <span className="block text-[12.5px] text-inksoft truncate">
                    {r.symbol}
                    {r.detail ? `, ${r.detail.toLowerCase()}` : ""}
                  </span>
                </span>
                <span className="num text-right text-sm shrink-0">
                  {quote ? (
                    <>
                      <span className="block">{money(quote.price)}</span>
                      <span className={`block text-[12.5px] ${tone(quote.change)}`}>{pct(quote.change_percent)}</span>
                    </>
                  ) : quotes.loading ? (
                    <span className="skeleton block h-8 w-14" />
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------------- */
/* Right: chart + order ticket for one stock                                 */
/* ------------------------------------------------------------------------- */

function SymbolView({ symbol }: { symbol: string }) {
  const [range, setRange] = useState<ChartRange>("1M");
  const { portfolio } = useAccount();
  const quote = useResource(() => api.quote(symbol), [symbol], { intervalMs: 20_000 });
  const history = useResource(() => api.history(symbol, range), [symbol, range]);
  const openOrders = useResource(() => api.orders("open"), [symbol], { events: ["tp:portfolio-changed"] });

  useEffect(() => {
    document.title = `${symbol} · Tradepath`;
  }, [symbol]);

  const q = quote.data;
  const position = portfolio?.positions.find((p) => p.symbol === symbol) ?? null;
  const symbolOrders = (openOrders.data ?? []).filter((o) => o.symbol === symbol);
  const name = q?.name ?? knownName(symbol);

  // Change over the selected range (the quote's change is always "today").
  const candles = history.data ?? [];
  const rangeChange = candles.length > 1 && range !== "1D" ? candles[candles.length - 1].close - candles[0].open : null;
  const rangePct = rangeChange != null ? (rangeChange / candles[0].open) * 100 : null;

  if (quote.error && !q) {
    return (
      <div className="panel p-8">
        <h1 className="text-2xl font-semibold">We couldn&apos;t load {symbol}</h1>
        <p className="mt-2 text-inksoft">{quote.error}</p>
        <p className="mt-1 text-sm text-muted">Pick another stock from the list, or search for a different company.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="panel p-5 md:p-6">
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <SymbolMark symbol={symbol} size={44} />
            <div className="min-w-0">
              <h1 className="text-[26px] leading-tight font-semibold">{symbol}</h1>
              <p className="text-sm text-inksoft truncate">{name ?? " "}</p>
            </div>
          </div>
          <div className="w-full sm:w-auto sm:text-right num">
            {q ? (
              <>
                <p className="font-display text-[34px] leading-none font-semibold">{money(q.price)}</p>
                <p className={`mt-1.5 text-[15px] ${tone(range === "1D" || rangeChange == null ? q.change : rangeChange)}`}>
                  {range === "1D" || rangeChange == null
                    ? `${signedMoney(q.change)} (${pct(q.change_percent)}) today`
                    : `${signedMoney(rangeChange)} (${pct(rangePct ?? 0)}) past ${rangeLabel(range)}`}
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <div className="skeleton h-8 w-36 sm:ml-auto" />
                <div className="skeleton h-4 w-44" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="seg max-w-full shrink-0" role="group" aria-label="Chart range">
            {RANGES.map((r) => (
              <button key={r} aria-pressed={r === range} onClick={() => setRange(r)}>
                {r}
              </button>
            ))}
          </div>
          {q && (
            <p className="hidden 2xl:block text-[12.5px] text-muted text-right">
              {q.feed === "iex" ? "Live price from IEX" : "Live price"}, candles from Alpaca
            </p>
          )}
        </div>

        <div className="mt-4">
          {history.loading ? (
            <div className="skeleton h-[380px]" />
          ) : history.error ? (
            <div className="h-[380px] grid place-items-center text-sm text-inksoft text-center px-6">{history.error}</div>
          ) : (
            <StockChart candles={candles} intraday={range === "1D" || range === "1W"} />
          )}
        </div>

        {q && (
          <dl className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-4 border-t border-line pt-5 num text-sm">
            <Fact label="Open" value={money(q.open)} />
            <Fact label="Day high" value={money(q.high)} />
            <Fact label="Day low" value={money(q.low)} />
            <Fact label="Prev. close" value={money(q.prev_close)} />
            <Fact label="Volume" value={compactNum(q.volume)} />
          </dl>
        )}
      </section>

      <div className="grid 2xl:grid-cols-2 gap-6 items-start">
        <OrderTicket symbol={symbol} quote={q} owned={position?.quantity ?? 0} buyingPower={portfolio?.buying_power ?? null} />

        <div className="space-y-6">
          <section className="panel p-5 num" aria-labelledby="pos-title">
            <h2 id="pos-title" className="panel-title">Your {symbol}</h2>
            {position ? (
              <dl className="mt-3 grid grid-cols-2 gap-y-3 text-sm">
                <Fact label="Shares" value={shares(position.quantity)} />
                <Fact label="Avg cost" value={money(position.avg_cost)} />
                <Fact label="Value" value={money(position.market_value)} />
                <Fact
                  label="Total gain"
                  value={`${signedMoney(position.unrealized_pnl)} (${pct(position.unrealized_pnl_percent)})`}
                  valueClass={tone(position.unrealized_pnl)}
                />
              </dl>
            ) : (
              <p className="mt-2 text-sm text-inksoft">You don&apos;t own any {symbol} yet.</p>
            )}
          </section>

          {symbolOrders.length > 0 && (
            <section className="panel p-5" aria-labelledby="open-title">
              <h2 id="open-title" className="panel-title">Waiting to fill</h2>
              <ul className="mt-3 divide-y divide-line">
                {symbolOrders.map((o) => (
                  <li key={o.id} className="py-2.5 flex items-center justify-between gap-3 text-sm num">
                    <span>
                      <span className={o.side === "buy" ? "text-gain font-medium" : "text-loss font-medium"}>
                        {o.side === "buy" ? "Buy" : "Sell"}
                      </span>{" "}
                      {shares(o.quantity)} at {money(o.limit_price)}
                    </span>
                    <button
                      className="text-inksoft hover:text-ink underline underline-offset-2"
                      onClick={async () => {
                        await api.cancelOrder(o.id).catch(() => null);
                        emitPortfolioChanged();
                      }}
                    >
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

const rangeLabel = (r: ChartRange) =>
  ({ "1D": "day", "1W": "week", "1M": "month", "3M": "3 months", "6M": "6 months", "1Y": "year", "5Y": "5 years", MAX: "all time" })[r];

function Fact({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <dt className="text-[12.5px] text-inksoft">{label}</dt>
      <dd className={`mt-0.5 font-medium ${valueClass}`}>{value}</dd>
    </div>
  );
}
