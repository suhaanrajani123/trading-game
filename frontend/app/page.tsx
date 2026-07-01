"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Portfolio } from "@/types";
import PortfolioSummary from "@/components/PortfolioSummary";

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio.");
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl">
      <h1 className="font-display font-bold text-2xl mb-1">Dashboard</h1>
      <p className="text-muted text-sm mb-6">Real prices. Fake money. Zero real risk.</p>

      {error && <p className="text-loss text-sm mb-4">{error}</p>}

      {portfolio ? (
        <>
          <PortfolioSummary portfolio={portfolio} />

          <div className="mt-8">
            <h2 className="font-display font-medium text-lg mb-3">Holdings</h2>
            {portfolio.positions.length === 0 ? (
              <div className="bg-surface border border-border rounded-lg p-6 text-center text-sm text-muted">
                You don't own anything yet.{" "}
                <Link href="/trade" className="text-brand hover:underline">
                  Place your first trade
                </Link>{" "}
                to get started.
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted border-b border-border">
                      <th className="px-4 py-2 font-normal">Symbol</th>
                      <th className="px-4 py-2 font-normal">Qty</th>
                      <th className="px-4 py-2 font-normal">Avg Cost</th>
                      <th className="px-4 py-2 font-normal">Price</th>
                      <th className="px-4 py-2 font-normal">Market Value</th>
                      <th className="px-4 py-2 font-normal">Unrealized P&L</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {portfolio.positions.map((p) => (
                      <tr key={p.symbol} className="border-b border-border last:border-0">
                        <td className="px-4 py-2 font-medium">{p.symbol}</td>
                        <td className="px-4 py-2">{p.quantity}</td>
                        <td className="px-4 py-2">${p.avg_cost.toFixed(2)}</td>
                        <td className="px-4 py-2">${p.current_price?.toFixed(2)}</td>
                        <td className="px-4 py-2">${p.market_value?.toFixed(2)}</td>
                        <td className={`px-4 py-2 ${(p.unrealized_pnl || 0) >= 0 ? "text-gain" : "text-loss"}`}>
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
