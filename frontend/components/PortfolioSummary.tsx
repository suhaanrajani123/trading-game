"use client";
import { Portfolio } from "@/types";
import { Wallet, TrendingUp, PieChart, Award } from "lucide-react";

export default function PortfolioSummary({ portfolio }: { portfolio: Portfolio }) {
  const totalPnl = portfolio.positions.reduce((sum, p) => sum + (p.unrealized_pnl || 0), 0);
  const pnlPositive = totalPnl >= 0;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        icon={TrendingUp}
        label="Total Equity"
        value={`$${portfolio.total_equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        accent="from-brand to-brand2"
      />
      <StatCard
        icon={Wallet}
        label="Cash Available"
        value={`$${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
      />
      <StatCard
        icon={PieChart}
        label="Unrealized P&L"
        value={`${pnlPositive ? "+" : ""}$${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        valueClass={pnlPositive ? "text-gain" : "text-loss"}
        accent={pnlPositive ? "from-gain to-emerald-400" : "from-loss to-rose-400"}
      />
      <StatCard
        icon={Award}
        label={`Level ${portfolio.current_level}`}
        value={`${portfolio.xp} XP`}
        accent="from-xp to-amber-300"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  valueClass,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
  accent?: string;
}) {
  return (
    <div className="relative glass glass-hover rounded-2xl shadow-glass p-5 overflow-hidden group">
      {accent && (
        <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${accent} opacity-80 group-hover:opacity-100 transition-opacity`} />
      )}
      <div className="flex flex-col gap-3 relative z-10">
        <div className="flex items-center gap-2.5 text-slate-400">
          <div className={accent ? `p-1.5 rounded-lg bg-gradient-to-br ${accent} shadow-glow` : "p-1.5"}>
            <Icon size={16} strokeWidth={2.5} className={accent ? "text-white" : ""} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        </div>
        <p className={`font-mono text-2xl font-bold truncate ${valueClass ?? "text-text"}`}>
          {value}
        </p>
      </div>
      <Icon size={80} strokeWidth={1} className="absolute -right-6 -bottom-6 text-white/[0.02] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none" />
    </div>
  );
}
