import { money } from "@/lib/format";
import type { Portfolio } from "@/types";

const SHADES = ["bg-primary", "bg-primary/75", "bg-primary/55", "bg-primary/40", "bg-primary/25"];

/** Where the money is: one bar, each holding sized by its share of the account. */
export default function AllocationStrip({ portfolio }: { portfolio: Portfolio }) {
  const equity = portfolio.total_equity || 1;
  const top = portfolio.positions.slice(0, 4);
  const rest = portfolio.positions.slice(4).reduce((s, p) => s + p.market_value, 0);
  const segments = [
    ...top.map((p, i) => ({ key: p.symbol, label: p.symbol, value: p.market_value, cls: SHADES[i] })),
    ...(rest > 0 ? [{ key: "other", label: "Other", value: rest, cls: SHADES[4] }] : []),
    { key: "cash", label: "Cash", value: portfolio.cash, cls: "bg-marker" },
  ].filter((s) => s.value > 0);

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface2 gap-[2px]" role="img" aria-label="Account allocation">
        {segments.map((s) => (
          <div key={s.key} className={`${s.cls} h-full first:rounded-l-full last:rounded-r-full`} style={{ width: `${(s.value / equity) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 sm:flex sm:flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-inksoft num">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <span className={`w-2.5 h-2.5 rounded-sm ${s.cls}`} aria-hidden="true" />
            <span className="text-ink font-medium">{s.label}</span>
            {money(s.value)}
            <span className="text-muted hidden sm:inline">({((s.value / equity) * 100).toFixed(1)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
