"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Quote } from "@/types";

export default function TradePanel({
  symbol,
  quote,
  onOrderPlaced,
}: {
  symbol: string;
  quote: Quote | null;
  onOrderPlaced: () => void;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [quantity, setQuantity] = useState("1");
  const [limitPrice, setLimitPrice] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const qtyNum = parseFloat(quantity) || 0;
  const estCost = quote ? (orderType === "limit" && limitPrice ? parseFloat(limitPrice) : quote.price) * qtyNum : 0;

  async function handleSubmit() {
    setStatus(null);
    setSubmitting(true);
    try {
      await api.placeOrder({
        symbol,
        side,
        order_type: orderType,
        quantity: qtyNum,
        limit_price: orderType === "limit" ? parseFloat(limitPrice) : undefined,
      });
      setStatus({ type: "success", message: `${side === "buy" ? "Bought" : "Sold"} ${qtyNum} share(s) of ${symbol}.` });
      onOrderPlaced();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Order failed." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <h3 className="font-display font-bold text-lg mb-4">Trade {symbol}</h3>

      <div className="flex gap-2 mb-4">
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              side === s
                ? s === "buy"
                  ? "bg-gain/15 text-gain border border-gain/40"
                  : "bg-loss/15 text-loss border border-loss/40"
                : "bg-bg text-muted border border-border hover:text-text"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 text-xs">
        {(["market", "limit"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
              orderType === t ? "bg-brand/15 text-brand" : "text-muted hover:text-text"
            }`}
          >
            {t} order
          </button>
        ))}
      </div>

      <label className="block text-xs text-muted mb-1">Quantity</label>
      <input
        type="number"
        min="0"
        step="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-full bg-bg border border-border rounded-md px-3 py-2 mb-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />

      {orderType === "limit" && (
        <>
          <label className="block text-xs text-muted mb-1">Limit price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="w-full bg-bg border border-border rounded-md px-3 py-2 mb-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </>
      )}

      <div className="flex justify-between text-xs text-muted mb-4">
        <span>Current price</span>
        <span className="font-mono text-text">{quote ? `$${quote.price.toFixed(2)}` : "—"}</span>
      </div>
      <div className="flex justify-between text-xs text-muted mb-5">
        <span>Estimated {side === "buy" ? "cost" : "proceeds"}</span>
        <span className="font-mono text-text">${estCost.toFixed(2)}</span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || qtyNum <= 0}
        className="w-full py-2.5 rounded-md bg-brand text-white font-medium text-sm hover:bg-brand/90 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Placing order…" : `Place ${side} order`}
      </button>

      {status && (
        <p className={`mt-3 text-xs ${status.type === "success" ? "text-gain" : "text-loss"}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}
