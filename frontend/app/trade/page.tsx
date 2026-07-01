"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Quote, Candle } from "@/types";
import StockChart from "@/components/StockChart";
import TradePanel from "@/components/TradePanel";

export default function TradePage() {
  const [symbolInput, setSymbolInput] = useState("AAPL");
  const [symbol, setSymbol] = useState("AAPL");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadSymbolData(sym: string) {
    setLoading(true);
    setError(null);
    try {
      const [q, h] = await Promise.all([api.getQuote(sym), api.getHistory(sym, "3mo", "1d")]);
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

  useEffect(() => {
    loadSymbolData(symbol);
  }, [symbol]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSymbol(symbolInput.trim().toUpperCase());
  }

  return (
    <div className="max-w-5xl">
      <h1 className="font-display font-bold text-2xl mb-1">Trade</h1>
      <p className="text-muted text-sm mb-6">Search any real ticker — prices are live/delayed market data.</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-sm">
        <input
          value={symbolInput}
          onChange={(e) => setSymbolInput(e.target.value)}
          placeholder="e.g. AAPL, TSLA, SPY"
          className="flex-1 bg-surface border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button type="submit" className="px-4 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-brand/90">
          Search
        </button>
      </form>

      {error && <p className="text-loss text-sm mb-4">{error}</p>}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-surface border border-border rounded-lg p-5 mb-4">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display font-bold text-xl">{symbol}</h2>
              {quote && (
                <div className="text-right">
                  <p className="font-mono text-xl">${quote.price.toFixed(2)}</p>
                  <p className={`font-mono text-sm ${quote.change >= 0 ? "text-gain" : "text-loss"}`}>
                    {quote.change >= 0 ? "+" : ""}
                    {quote.change.toFixed(2)} ({quote.change_percent.toFixed(2)}%)
                  </p>
                </div>
              )}
            </div>
            {loading ? (
              <p className="text-muted text-sm py-16 text-center">Loading chart…</p>
            ) : candles.length > 0 ? (
              <StockChart candles={candles} />
            ) : (
              <p className="text-muted text-sm py-16 text-center">No chart data available.</p>
            )}
          </div>
        </div>

        <div>
          <TradePanel symbol={symbol} quote={quote} onOrderPlaced={() => loadSymbolData(symbol)} />
        </div>
      </div>
    </div>
  );
}
