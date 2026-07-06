"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Quote } from "@/types";
import { ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle } from "lucide-react";

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
    <div className="glass rounded-2xl shadow-glass p-5">
      <h3 className="font-display font-semibold text-base mb-4">Trade {symbol}</h3>

      <div className="flex gap-2 mb-4">
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all flex items-center justify-center gap-1.5 ${
              side === s
                ? s === "buy"
                  ? "bg-gradient-to-br from-gain to-emerald-400 text-white shadow-glass"
                  : "bg-gradient-to-br from-loss to-rose-400 text-white shadow-glass"
                : "glass glass-hover text-muted"
            }`}
          >
            {s === "buy" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 mb-4 text-xs glass rounded-lg p-1">
        {(["market", "limit"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`flex-1 px-3 py-1.5 rounded-md capitalize transition-colors ${
              orderType === t ? "bg-brand text-white" : "text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <label className="block text-xs text-muted mb-1.5">Quantity</label>
      <input
        type="number"
        min="0"
        step="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 mb-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />

      {orderType === "limit" && (
        <>
          <label className="block text-xs text-muted mb-1.5">Limit price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 mb-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </>
      )}

      <div className="glass rounded-xl p-3 mb-5 space-y-2">
        <div className="flex justify-between text-xs text-muted">
          <span>Current price</span>
          <span className="font-mono text-text">{quote ? `$${quote.price.toFixed(2)}` : "—"}</span>
        </div>
        <div className="flex justify-between text-xs text-muted">
          <span>Estimated {side === "buy" ? "cost" : "proceeds"}</span>
          <span className="font-mono text-text">${estCost.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || qtyNum <= 0}
        className="w-full py-3 rounded-xl bg-gradient-to-br from-brand to-brand2 text-white font-medium text-sm hover:opacity-90 disabled:opacity-40 transition-opacity shadow-glow"
      >
        {submitting ? "Placing order…" : `Place ${side} order`}
      </button>

      {status && (
        <p className={`mt-3 text-xs flex items-center gap-1.5 ${status.type === "success" ? "text-gain" : "text-loss"}`}>
          {status.type === "success" ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
          {status.message}
        </p>
      )}
    </div>
  );
}
