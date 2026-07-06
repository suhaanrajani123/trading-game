"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Portfolio, Quote, Candle } from "@/types";
import { generatePreviewCandles } from "@/lib/mockChart";
import TopMovers from "@/components/TopMovers";
import StockChart from "@/components/StockChart";
import TradePanel from "@/components/TradePanel";
import { gradientForSymbol } from "@/lib/avatarColor";
import StockLogo from "@/components/StockLogo";
import { Trophy, ArrowRight, TrendingUp, Wallet, PieChart, Search } from "lucide-react";

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick chart state on dashboard
  const [chartSymbol, setChartSymbol] = useState<string | null>(null);
  const [chartQuote, setChartQuote] = useState<Quote | null>(null);
  const [chartCandles, setChartCandles] = useState<Candle[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const previewCandles = useMemo(() => generatePreviewCandles(90, 100), []);

  async function load() {
    try {
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio.");
    }
  }

  async function loadChart(sym: string) {
    setChartLoading(true);
    try {
      const [q, h] = await Promise.all([api.getQuote(sym), api.getHistory(sym, "5y", "1wk")]);
      setChartQuote(q);
      setChartCandles(h);
      setChartSymbol(sym);
    } catch {
      // silent
    } finally {
      setChartLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const clean = searchInput.trim().toUpperCase();
    if (clean) loadChart(clean);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalPnl = portfolio ? portfolio.positions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0) : 0;
  const pnlPositive = totalPnl >= 0;
  const displayCandles = chartSymbol ? chartCandles : previewCandles;

  return (
    <div className="max-w-7xl animate-fade-up">
      {error && <p className="text-loss text-sm mb-4">{error}</p>}

      {portfolio ? (
        <>
          {/* Row 1: Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass rounded-2xl shadow-glass p-5 border-l-4 border-brand overflow-hidden group relative">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Total Portfolio Value</p>
              <p className="font-mono text-3xl font-bold text-text">
                ${portfolio.total_equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className={`font-mono text-sm mt-1 ${pnlPositive ? "text-gain" : "text-loss"}`}>
                {pnlPositive ? "+" : ""}{((totalPnl / (portfolio.total_equity - totalPnl || 1)) * 100).toFixed(2)}% Day Gain
              </p>
            </div>
            <div className={`glass rounded-2xl shadow-glass p-5 border-l-4 ${pnlPositive ? "border-gain" : "border-loss"} overflow-hidden`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Today&apos;s Profit/Loss</p>
              <p className={`font-mono text-3xl font-bold ${pnlPositive ? "text-gain" : "text-loss"}`}>
                {pnlPositive ? "+" : ""}${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="glass rounded-2xl shadow-glass p-5 border-l-4 border-brand2 overflow-hidden">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Available Virtual Cash</p>
              <p className="font-mono text-3xl font-bold text-text">
                ${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Row 2: Chart + Sidebar */}
          <div className="grid lg:grid-cols-3 gap-5 mb-6">
            {/* Main Chart Area */}
            <div className="lg:col-span-2">
              <div className="glass rounded-2xl shadow-glass p-5">
                {/* Search bar */}
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search AAPL, TSLA..."
                      className="w-full glass rounded-xl pl-10 pr-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-br from-brand to-brand2 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    Go
                  </button>
                </form>

                {/* Chart header */}
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <h2 className="font-display font-bold text-lg">{chartSymbol ?? "S&P 500 Preview"}</h2>
                    {!chartSymbol && <p className="text-xs text-muted">Search a ticker to see its live chart</p>}
                  </div>
                  {chartQuote && chartSymbol && (
                    <div className="text-right">
                      <p className="font-mono text-lg font-semibold">${chartQuote.price.toFixed(2)}</p>
                      <p className={`font-mono text-xs ${chartQuote.change >= 0 ? "text-gain" : "text-loss"}`}>
                        {chartQuote.change >= 0 ? "+" : ""}
                        {chartQuote.change.toFixed(2)} ({chartQuote.change_percent.toFixed(2)}%)
                      </p>
                    </div>
                  )}
                </div>

                {chartLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <p className="text-muted text-sm">Loading chart…</p>
                  </div>
                ) : (
                  <div className={!chartSymbol ? "opacity-50" : ""}>
                    <StockChart candles={displayCandles} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              <TopMovers />

              {/* Quick Trade */}
              {chartSymbol ? (
                <TradePanel symbol={chartSymbol} quote={chartQuote} onOrderPlaced={() => { loadChart(chartSymbol); load(); }} />
              ) : (
                <div className="glass rounded-2xl shadow-glass p-5">
                  <h3 className="font-display font-semibold text-sm mb-3">Quick Trade</h3>
                  <p className="text-xs text-muted">Search a ticker above to start trading.</p>
                </div>
              )}

              {/* Level progress */}
              <Link
                href="/learn"
                className="glass glass-hover rounded-2xl shadow-glass p-5 flex items-center justify-between group block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-xp to-amber-300 flex items-center justify-center">
                    <Trophy size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Level {portfolio.current_level} · 25 lessons</p>
                    <p className="text-xs text-muted">{portfolio.xp} XP earned</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-muted group-hover:text-text group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* Row 3: My Open Positions */}
          <div>
            <h2 className="font-display font-semibold text-base mb-3">My Open Positions</h2>
            {portfolio.positions.length === 0 ? (
              <div className="glass rounded-2xl shadow-glass p-8 text-center text-sm text-muted">
                You don&apos;t own anything yet.{" "}
                <Link href="/trade" className="text-brand hover:underline">
                  Place your first trade
                </Link>{" "}
                to get started.
              </div>
            ) : (
              <div className="glass rounded-2xl shadow-glass overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold tracking-wider text-slate-500 uppercase border-b border-border/60">
                      <th className="px-5 py-3">Ticker</th>
                      <th className="px-5 py-3">Company</th>
                      <th className="px-5 py-3 text-right">Qty</th>
                      <th className="px-5 py-3 text-right">Avg Cost</th>
                      <th className="px-5 py-3 text-right">Current Price</th>
                      <th className="px-5 py-3 text-right">Market Value</th>
                      <th className="px-5 py-3 text-right">Total P/L</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono tabular-nums">
                    {portfolio.positions.map((p) => (
                      <tr key={p.symbol} className="border-b border-border/40 last:border-0 hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3.5 font-medium">
                          <div className="flex items-center gap-2.5">
                            <StockLogo symbol={p.symbol} size={28} />
                            <span className="font-sans font-semibold">{p.symbol}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted font-sans text-xs">{p.symbol}</td>
                        <td className="px-5 py-3.5 text-right">{p.quantity}</td>
                        <td className="px-5 py-3.5 text-right">${p.avg_cost.toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-right">${p.current_price?.toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-right">${p.market_value?.toFixed(2)}</td>
                        <td className={`px-5 py-3.5 text-right font-semibold ${(p.unrealized_pnl || 0) >= 0 ? "text-gain" : "text-loss"}`}>
                          {(p.unrealized_pnl || 0) >= 0 ? "+" : ""}${p.unrealized_pnl?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        !error && <p className="text-muted text-sm">Loading portfolio…</p>
      )}
    </div>
  );
}
