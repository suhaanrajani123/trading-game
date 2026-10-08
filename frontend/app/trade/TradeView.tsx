"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "@/components/AccountProvider";
import OrderTicket from "@/components/OrderTicket";
import StockChart from "@/components/StockChart";
import SymbolMark from "@/components/SymbolMark";
import { api, emitPortfolioChanged } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { POPULAR_STOCKS, knownName } from "@/lib/popularStocks";
import { compactNum, money, pct, shares, signedMoney, tone } from "@/lib/format";
import type { ChartRange } from "@/types";

const RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

export default function TradeView() {
  const params = useSearchParams();
  const router = useRouter();
  const symbol = params.get("symbol")?.toUpperCase() ?? null;

  if (!symbol) return <StockPicker onPick={(s) => router.push(`/trade?symbol=${s}`)} />;
  return <SymbolView key={symbol} symbol={symbol} />;
}

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
      <div className="panel p-8 max-w-xl animate-rise">
        <h1 className="text-2xl font-semibold">We couldn&apos;t load {symbol}</h1>
        <p className="mt-2 text-inksoft">{quote.error}</p>
        <Link href="/trade" className="btn-secondary mt-5">Browse popular stocks</Link>
      </div>
    );
  }

  return (
    <div className="grid xl:grid-cols-[1fr_360px] gap-6 items-start animate-rise [&>*]:min-w-0">
      <div className="space-y-6 min-w-0">
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
                <div className="space-y-2"><div className="skeleton h-8 w-36 ml-auto" /><div className="skeleton h-4 w-44" /></div>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="seg overflow-x-auto max-w-full" role="group" aria-label="Chart range">
              {RANGES.map((r) => (
                <button key={r} aria-pressed={r === range} onClick={() => setRange(r)}>{r}</button>
              ))}
            </div>
            {q && (
              <p className="hidden sm:block text-[12.5px] text-muted">
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

        <div className="hidden xl:block">
          <PopularStrip current={symbol} />
        </div>
      </div>

      <div className="space-y-6 xl:sticky xl:top-[124px]">
        <OrderTicket symbol={symbol} quote={q} owned={position?.quantity ?? 0} buyingPower={portfolio?.buying_power ?? null} />

        {position && (
          <section className="panel p-5 num" aria-labelledby="pos-title">
            <h2 id="pos-title" className="panel-title">Your {symbol}</h2>
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
          </section>
        )}

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

      <div className="xl:hidden">
        <PopularStrip current={symbol} />
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

function PopularStrip({ current }: { current: string }) {
  const others = POPULAR_STOCKS.filter((s) => s.symbol !== current).slice(0, 10);
  return (
    <section aria-labelledby="also-title">
      <h2 id="also-title" className="text-[15px] font-sans font-medium text-inksoft mb-3">Other popular stocks</h2>
      <div className="flex flex-wrap gap-2">
        {others.map((s) => (
          <Link key={s.symbol} href={`/trade?symbol=${s.symbol}`} className="inline-flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-full border border-line bg-surface hover:bg-surface2 text-sm">
            <SymbolMark symbol={s.symbol} size={24} />
            <span className="font-medium">{s.symbol}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function StockPicker({ onPick }: { onPick: (s: string) => void }) {
  const { data } = useResource(() => api.quotes(POPULAR_STOCKS.map((s) => s.symbol)), [], { intervalMs: 45_000 });
  return (
    <div className="animate-rise">
      <h1 className="text-[30px] font-semibold">Pick a stock to trade</h1>
      <p className="mt-1 text-inksoft max-w-prose">
        Search any US company above, or start with one you already know. Prices are real; the money is practice.
      </p>
      <ul className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {POPULAR_STOCKS.map((s) => {
          const q = data?.[s.symbol];
          return (
            <li key={s.symbol}>
              <button onClick={() => onPick(s.symbol)} className="panel w-full p-4 flex items-center gap-3 text-left hover:border-ink/25 transition-colors">
                <SymbolMark symbol={s.symbol} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{s.name}</span>
                  <span className="block text-[13px] text-inksoft">{s.symbol}, {s.sector.toLowerCase()}</span>
                </span>
                <span className="num text-right text-sm">
                  {q ? (
                    <>
                      <span className="block">{money(q.price)}</span>
                      <span className={`block text-[13px] ${tone(q.change)}`}>{pct(q.change_percent)}</span>
                    </>
                  ) : (
                    <span className="skeleton block h-8 w-16" />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
