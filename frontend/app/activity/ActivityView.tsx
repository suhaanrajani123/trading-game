"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SymbolMark from "@/components/SymbolMark";
import { api, emitPortfolioChanged } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { dateTime, money, moneyWhole, shares, signedMoney, tone } from "@/lib/format";
import { useAccount } from "@/components/AccountProvider";
import type { Order, OrderStatus } from "@/types";

const FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "filled", label: "Filled" },
  { key: "cancelled", label: "Cancelled" },
];

export default function ActivityView() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("status");
  const filter = (FILTERS.some((f) => f.key === raw) ? raw : "all") as OrderStatus | "all";
  const orders = useResource(() => api.orders(filter === "all" ? undefined : filter), [filter], {
    events: ["tp:portfolio-changed"],
  });

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <h1 className="text-[30px] font-semibold">Activity</h1>
        <p className="mt-1 text-inksoft">Every order you&apos;ve placed. Open limit orders can be cancelled until they fill.</p>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div className="seg" role="group" aria-label="Filter orders">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                aria-pressed={filter === f.key}
                onClick={() => router.replace(f.key === "all" ? "/activity" : `/activity?status=${f.key}`)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {orders.error ? (
          <p className="px-5 pb-6 text-inksoft">{orders.error}</p>
        ) : !orders.data ? (
          <div className="px-5 pb-5 space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-10" />)}</div>
        ) : orders.data.length === 0 ? (
          <div className="px-5 pb-8 pt-1">
            <p>{filter === "all" ? "No orders yet." : `No ${filter} orders.`}</p>
            <Link href="/trade" className="btn-primary mt-4">Place your first trade</Link>
          </div>
        ) : (
          <OrdersTable orders={orders.data} />
        )}
      </section>

      <ResetAccount />
    </div>
  );
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  open: "bg-marker/40 text-ink",
  filled: "bg-surface2 text-inksoft",
  cancelled: "text-muted line-through decoration-muted/60",
};

function OrdersTable({ orders }: { orders: Order[] }) {
  const [busy, setBusy] = useState<number | null>(null);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm num">
        <thead>
          <tr className="border-y border-line">
            <th className="table-head px-5 py-2.5">Placed</th>
            <th className="table-head px-3 py-2.5">Stock</th>
            <th className="table-head px-3 py-2.5">Order</th>
            <th className="table-head px-3 py-2.5 text-right">Shares</th>
            <th className="table-head px-3 py-2.5 text-right">Price</th>
            <th className="table-head px-3 py-2.5 text-right">Realized</th>
            <th className="table-head px-5 py-2.5 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-line/70 last:border-0 align-top">
              <td className="px-5 py-3 text-inksoft whitespace-nowrap">{dateTime(o.timestamp)}</td>
              <td className="px-3 py-3">
                <Link href={`/trade?symbol=${o.symbol}`} className="inline-flex items-center gap-2 font-semibold">
                  <SymbolMark symbol={o.symbol} size={26} />
                  {o.symbol}
                </Link>
              </td>
              <td className="px-3 py-3">
                <span className={o.side === "buy" ? "text-gain font-medium" : "text-loss font-medium"}>
                  {o.side === "buy" ? "Buy" : "Sell"}
                </span>
                <span className="text-inksoft"> {o.order_type === "limit" ? `limit ${money(o.limit_price)}` : "market"}</span>
                {o.note && <span className="block text-[12.5px] text-muted">{o.note}</span>}
              </td>
              <td className="px-3 py-3 text-right">{shares(o.quantity)}</td>
              <td className="px-3 py-3 text-right">{o.price != null ? money(o.price) : "—"}</td>
              <td className={`px-3 py-3 text-right ${o.realized_pnl != null ? tone(o.realized_pnl) : "text-muted"}`}>
                {o.realized_pnl != null ? signedMoney(o.realized_pnl) : "—"}
              </td>
              <td className="px-5 py-3 text-right whitespace-nowrap">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[12.5px] capitalize ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                {o.status === "open" && (
                  <button
                    disabled={busy === o.id}
                    className="ml-3 text-inksoft hover:text-ink underline underline-offset-2 disabled:opacity-50"
                    onClick={async () => {
                      setBusy(o.id);
                      await api.cancelOrder(o.id).catch(() => null);
                      setBusy(null);
                      emitPortfolioChanged();
                    }}
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResetAccount() {
  const { portfolio } = useAccount();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const start = portfolio?.starting_cash ?? 100_000;

  return (
    <section className="panel p-5 md:p-6 flex flex-wrap items-center gap-4 justify-between">
      <div className="max-w-prose">
        <h2 className="panel-title">Start over</h2>
        <p className="mt-1 text-sm text-inksoft">
          Clears your stocks and order history and gives you {moneyWhole(start)} in cash again. Your lessons and XP are kept.
        </p>
        {done && <p role="status" className="mt-2 text-sm text-gain">Your account was reset.</p>}
      </div>
      {confirming ? (
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => setConfirming(false)}>Keep my account</button>
          <button
            className="btn-danger"
            onClick={async () => {
              await api.resetPortfolio();
              setConfirming(false);
              setDone(true);
              emitPortfolioChanged();
            }}
          >
            Yes, reset everything
          </button>
        </div>
      ) : (
        <button className="btn-danger" onClick={() => { setDone(false); setConfirming(true); }}>Reset account</button>
      )}
    </section>
  );
}
