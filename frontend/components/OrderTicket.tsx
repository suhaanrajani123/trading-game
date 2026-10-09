"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { api, emitPortfolioChanged } from "@/lib/api";
import { money, shares } from "@/lib/format";
import type { OrderSide, OrderType, Quote } from "@/types";

const HINTS: Record<OrderType, string> = {
  market: "Buys or sells right away at the current price.",
  limit: "Only fills at your price or better. If the price isn't there yet, the order waits.",
};

export default function OrderTicket({
  symbol,
  quote,
  owned,
  buyingPower,
}: {
  symbol: string;
  quote: Quote | null;
  owned: number;
  buyingPower: number | null;
}) {
  const [side, setSide] = useState<OrderSide>("buy");
  const [type, setType] = useState<OrderType>("market");
  const [qty, setQty] = useState("1");
  const [limit, setLimit] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setResult(null);
    setLimit("");
    setQty("1");
  }, [symbol]);

  // The phone action bar asks the ticket to switch side and scroll into view.
  useEffect(() => {
    const onSide = (e: Event) => {
      const next = (e as CustomEvent<OrderSide>).detail;
      if (next === "buy" || next === "sell") setSide(next);
      document.getElementById("order-ticket")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("tp:ticket-side", onSide);
    return () => window.removeEventListener("tp:ticket-side", onSide);
  }, []);

  useEffect(() => {
    if (type === "limit" && !limit && quote) setLimit(quote.price.toFixed(2));
  }, [type, quote, limit]);

  const q = Number(qty) || 0;
  const limitNum = Number(limit) || 0;
  const price = type === "limit" ? limitNum : quote?.price ?? 0;
  const total = price * q;
  const maxBuy = buyingPower && price ? Math.floor(buyingPower / price) : 0;
  const tooMuch = side === "buy" ? buyingPower != null && total > buyingPower : q > owned;
  const canSubmit = !busy && quote && q > 0 && !tooMuch && (type === "market" || limitNum > 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setResult(null);
    try {
      const o = await api.placeOrder({
        symbol,
        side,
        order_type: type,
        quantity: q,
        ...(type === "limit" ? { limit_price: limitNum } : {}),
      });
      setResult({
        ok: true,
        text:
          o.status === "filled"
            ? `${side === "buy" ? "Bought" : "Sold"} ${shares(o.quantity)} ${symbol} at ${money(o.price)}.`
            : `Limit order placed. It fills if ${symbol} ${side === "buy" ? "drops to" : "rises to"} ${money(o.limit_price)}.`,
      });
      emitPortfolioChanged();
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : "The order didn't go through." });
    } finally {
      setBusy(false);
    }
  }

  const verb = side === "buy" ? "Buy" : "Sell";

  return (
    <form id="order-ticket" onSubmit={submit} className="panel p-4 md:p-5 scroll-mt-32" aria-label={`Trade ${symbol}`}>
      <div className="grid grid-cols-2 gap-1 p-1 rounded-control bg-surface2" role="group" aria-label="Buy or sell">
        {(["buy", "sell"] as const).map((s) => (
          <button
            type="button"
            key={s}
            aria-pressed={side === s}
            onClick={() => setSide(s)}
            className={`h-9 rounded-[7px] text-sm font-semibold transition-colors ${
              side === s ? (s === "buy" ? "bg-gain text-white" : "bg-loss text-white") : "text-inksoft hover:text-ink"
            }`}
          >
            {s === "buy" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Order type</span>
          <div className="seg" role="group" aria-label="Order type">
            {(["market", "limit"] as const).map((t) => (
              <button type="button" key={t} aria-pressed={type === t} onClick={() => setType(t)}>
                {t === "market" ? "Market" : "Limit"}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[13px] text-inksoft">{HINTS[type]}</p>
      </div>

      <label className="block mt-5">
        <span className="flex items-center justify-between text-sm font-medium mb-1.5">
          Shares
          <button
            type="button"
            className="text-[13px] font-normal text-inksoft hover:text-ink underline underline-offset-2"
            onClick={() => setQty(String(side === "buy" ? maxBuy : owned))}
          >
            {side === "buy" ? `Max ${shares(maxBuy)}` : `All ${shares(owned)}`}
          </button>
        </span>
        <input
          className="field num text-[15px]"
          inputMode="decimal"
          type="number"
          min="0"
          step="any"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
      </label>

      {type === "limit" && (
        <label className="block mt-4">
          <span className="block text-sm font-medium mb-1.5">Limit price</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
            <input
              className="field num pl-7 text-[15px]"
              inputMode="decimal"
              type="number"
              min="0"
              step="0.01"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>
        </label>
      )}

      <dl className="mt-5 space-y-2 text-sm num">
        <div className="flex justify-between">
          <dt className="text-inksoft">Market price</dt>
          <dd>{quote ? money(quote.price) : "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-inksoft">Estimated {side === "buy" ? "cost" : "proceeds"}</dt>
          <dd className="font-semibold">{money(total)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-inksoft">{side === "buy" ? "Buying power" : "Shares you own"}</dt>
          <dd>{side === "buy" ? money(buyingPower) : shares(owned)}</dd>
        </div>
      </dl>

      {tooMuch && q > 0 && (
        <p className="mt-3 text-[13px] text-loss">
          {side === "buy" ? "That's more than your buying power." : `You only own ${shares(owned)} shares.`}
        </p>
      )}

      <button type="submit" disabled={!canSubmit} className={`btn w-full mt-5 h-11 text-[15px] font-semibold text-white ${side === "buy" ? "bg-gain hover:bg-gain/90" : "bg-loss hover:bg-loss/90"}`}>
        {busy ? "Placing order…" : type === "limit" ? `Place limit ${side}` : `${verb} ${q > 0 ? shares(q) : ""} ${symbol}`}
      </button>

      {result && (
        <p role="status" className={`mt-3 flex gap-2 text-[13.5px] ${result.ok ? "text-gain" : "text-loss"}`}>
          {result.ok ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
          <span>
            {result.text}{" "}
            {result.ok && (
              <Link href="/activity" className="underline underline-offset-2 text-ink">
                View activity
              </Link>
            )}
          </span>
        </p>
      )}
    </form>
  );
}
