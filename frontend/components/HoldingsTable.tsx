import Link from "next/link";
import SymbolMark from "@/components/SymbolMark";
import { knownName } from "@/lib/popularStocks";
import { money, pct, shares, signedMoney, tone } from "@/lib/format";
import type { Position } from "@/types";

export default function HoldingsTable({ positions }: { positions: Position[] }) {
  return (
    <>
      <HoldingsList positions={positions} />
      <div className="hidden md:block overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm num">
        <thead>
          <tr className="border-y border-line">
            <th className="table-head px-5 py-2.5">Stock</th>
            <th className="table-head px-3 py-2.5 text-right">Shares</th>
            <th className="table-head px-3 py-2.5 text-right">Price</th>
            <th className="table-head px-3 py-2.5 text-right">Today</th>
            <th className="table-head px-3 py-2.5 text-right">Value</th>
            <th className="table-head px-5 py-2.5 text-right">Total gain</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p) => (
            <tr key={p.symbol} className="border-b border-line/70 last:border-0 hover:bg-surface2/50">
              <td className="px-5 py-3">
                <Link href={`/trade?symbol=${p.symbol}`} className="flex items-center gap-3">
                  <SymbolMark symbol={p.symbol} size={32} />
                  <span className="min-w-0">
                    <span className="block font-semibold">{p.symbol}</span>
                    <span className="block text-[13px] text-inksoft truncate max-w-[180px]">
                      {p.name ?? knownName(p.symbol) ?? `${shares(p.quantity)} shares`}
                    </span>
                  </span>
                </Link>
              </td>
              <td className="px-3 py-3 text-right">{shares(p.quantity)}</td>
              <td className="px-3 py-3 text-right">
                {money(p.current_price)}
                <span className="block text-[12.5px] text-muted">avg {money(p.avg_cost)}</span>
              </td>
              <td className={`px-3 py-3 text-right ${tone(p.day_change)}`}>{pct(p.day_change_percent)}</td>
              <td className="px-3 py-3 text-right">{money(p.market_value)}</td>
              <td className={`px-5 py-3 text-right ${tone(p.unrealized_pnl)}`}>
                {signedMoney(p.unrealized_pnl)}
                <span className="block text-[12.5px]">{pct(p.unrealized_pnl_percent)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

/** Phone layout: one tappable row per stock instead of a wide table. */
function HoldingsList({ positions }: { positions: Position[] }) {
  return (
    <ul className="md:hidden border-t border-line divide-y divide-line/70 num">
      {positions.map((p) => (
        <li key={p.symbol}>
          <Link href={`/trade?symbol=${p.symbol}`} className="flex items-center gap-3 px-4 py-3 active:bg-surface2">
            <SymbolMark symbol={p.symbol} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{p.symbol}</span>
              <span className="block text-[13px] text-inksoft truncate">
                {shares(p.quantity)} shares at {money(p.current_price)}
              </span>
            </span>
            <span className="text-right shrink-0">
              <span className="block font-medium">{money(p.market_value)}</span>
              <span className={`block text-[13px] ${tone(p.unrealized_pnl)}`}>
                {signedMoney(p.unrealized_pnl)} ({pct(p.unrealized_pnl_percent)})
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
