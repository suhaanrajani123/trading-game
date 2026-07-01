"use client";
import { Portfolio } from "@/types";

export default function PortfolioSummary({ portfolio }: { portfolio: Portfolio }) {
  const totalPnl = portfolio.positions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0);
  const pnlPositive = totalPnl >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Total Equity" value={`$${portfolio.total_equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
      <StatCard label="Cash Available" value={`$${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
      <StatCard
        label="Unrealized P&L"
        value={`${pnlPositive ? "+" : ""}$${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        accent={pnlPositive ? "gain" : "loss"}
      />
      <StatCard label="XP · Level" value={`${portfolio.xp} XP · Lv ${portfolio.current_level}`} accent="xp" />
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: "gain" | "loss" | "xp" }) {
  const colorClass = accent === "gain" ? "text-gain" : accent === "loss" ? "text-loss" : accent === "xp" ? "text-xp" : "text-text";
  return (
    <div className="bg-surface border border-border rounded-lg px-4 py-3">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`font-mono text-lg font-medium ${colorClass}`}>{value}</p>
    </div>
  );
}
