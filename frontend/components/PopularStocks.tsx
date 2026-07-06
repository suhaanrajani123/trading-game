"use client";
import { POPULAR_STOCKS } from "@/lib/popularStocks";
import StockLogo from "@/components/StockLogo";

export default function PopularStocks({
  onSelect,
  activeSymbol,
}: {
  onSelect: (symbol: string) => void;
  activeSymbol: string | null;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display font-semibold text-sm text-muted uppercase tracking-wide">
          Popular right now
        </h2>
        <span className="text-xs text-muted">Don't know a ticker? Pick one below.</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {POPULAR_STOCKS.map((stock) => {
          const active = stock.symbol === activeSymbol;
          return (
            <button
              key={stock.symbol}
              onClick={() => onSelect(stock.symbol)}
              className={`text-left rounded-xl p-3 transition-all glass-hover ${
                active ? "glass shadow-glow" : "glass"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <StockLogo symbol={stock.symbol} size={28} />
                <span className="font-mono text-sm font-semibold">{stock.symbol}</span>
              </div>
              <p className="text-xs text-muted truncate">{stock.name}</p>
              <p className="text-[10px] text-muted/70 mt-0.5">{stock.sector}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
