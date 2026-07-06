"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Quote, Candle } from "@/types";
import { generatePreviewCandles } from "@/lib/mockChart";
import StockChart from "@/components/StockChart";
import TradePanel from "@/components/TradePanel";
import PopularStocks from "@/components/PopularStocks";
import { Search } from "lucide-react";

export default function TradePage() {
  const [symbolInput, setSymbolInput] = useState("");
  const [symbol, setSymbol] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const previewCandles = useMemo(() => generatePreviewCandles(90, 100), []);

  async function loadSymbolData(sym: string) {
    setLoading(true);
    setError(null);
    try {
      const [q, h] = await Promise.all([api.getQuote(sym), api.getHistory(sym, "5y", "1wk")]);
      setQuote(q);
      setCandles(h);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load symbol.");
      setQuote(null);
      setCandles([]);
    } finally {
      setLoading(false);
    }
  }

  function selectSymbol(sym: string) {
    const clean = sym.trim().toUpperCase();
    if (!clean) return;
    setSymbol(clean);
    setSymbolInput(clean);
    loadSymbolData(clean);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    selectSymbol(symbolInput);
  }

  const displayCandles = symbol ? candles : previewCandles;

  return (
    <div className="max-w-7xl animate-fade-up">
      <h1 className="font-display font-bold text-3xl tracking-tight mb-1.5">Trade</h1>
      <p className="text-muted text-sm mb-6">Search any real ticker, or pick one below — prices are live/delayed market data.</p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Search & Popular Stocks */}
        <div className="space-y-5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={symbolInput}
                onChange={(e) => setSymbolInput(e.target.value)}
                placeholder="e.g. AAPL, TSLA, SPY"
                className="w-full glass rounded-xl pl-10 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand to-brand2 text-white text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
              Search
            </button>
          </form>

          <PopularStocks onSelect={selectSymbol} activeSymbol={symbol} />
        </div>

        {/* Right Column: Chart + Trade Panel Below */}
        <div className="lg:col-span-2 space-y-5">
          {error && <p className="text-loss text-sm mb-2">{error}</p>}

          {/* Chart */}
          <div className="glass rounded-2xl shadow-glass p-5 relative">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-xl">{symbol ?? "Preview chart"}</h2>
                {!symbol && <p className="text-xs text-muted mt-0.5">Pick a stock to see its real price history</p>}
              </div>
              {quote && symbol && (
                <div className="text-right">
                  <p className="font-mono text-xl font-semibold">${quote.price.toFixed(2)}</p>
                  <p className={`font-mono text-sm ${quote.change >= 0 ? "text-gain" : "text-loss"}`}>
                    {quote.change >= 0 ? "+" : ""}
                    {quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)
                  </p>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-muted text-sm">Loading chart…</p>
              </div>
            ) : (
              <div className="relative">
                {!symbol && (
                  <span className="absolute top-2 right-2 z-10 text-[10px] uppercase tracking-wide text-muted glass rounded-full px-2.5 py-1">
                    Sample data
                  </span>
                )}
                <div className={!symbol ? "opacity-60" : ""}>
                  <StockChart candles={displayCandles} />
                </div>
              </div>
            )}
          </div>

          {/* Trade Panel — below the chart */}
          {symbol ? (
            <TradePanel symbol={symbol} quote={quote} onOrderPlaced={() => loadSymbolData(symbol)} />
          ) : (
            <div className="glass rounded-2xl shadow-glass p-6 text-sm text-muted text-center">
              <h3 className="font-display font-bold text-lg text-text mb-2">No stock selected yet</h3>
              <p>Search a ticker above, or tap one of the popular stocks — that'll load its real chart and unlock trading here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
