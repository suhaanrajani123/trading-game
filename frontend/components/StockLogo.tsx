"use client";
import { useState } from "react";
import { gradientForSymbol } from "@/lib/avatarColor";

/**
 * Map of ticker symbols to their corporate domain names for logo fetching.
 * Uses the Clearbit Logo API (logo.clearbit.com) for free, high-quality transparent logos.
 */
const LOGO_DOMAINS: Record<string, string> = {
  AAPL: "apple.com",
  MSFT: "microsoft.com",
  GOOGL: "google.com",
  AMZN: "amazon.com",
  NVDA: "nvidia.com",
  META: "meta.com",
  TSLA: "tesla.com",
  NFLX: "netflix.com",
  AMD: "amd.com",
  INTC: "intel.com",
  CRM: "salesforce.com",
  ORCL: "oracle.com",
  DIS: "disney.com",
  NKE: "nike.com",
  SBUX: "starbucks.com",
  MCD: "mcdonalds.com",
  KO: "coca-cola.com",
  PEP: "pepsico.com",
  WMT: "walmart.com",
  JPM: "jpmorganchase.com",
  V: "visa.com",
  MA: "mastercard.com",
  PYPL: "paypal.com",
  BA: "boeing.com",
  XOM: "exxonmobil.com",
  SPY: "ssga.com",
  QQQ: "invesco.com",
  UBER: "uber.com",
  ABNB: "airbnb.com",
  SNAP: "snapchat.com",
  SHOP: "shopify.com",
  SQ: "squareup.com",
  COIN: "coinbase.com",
  HOOD: "robinhood.com",
  RIVN: "rivian.com",
  PLTR: "palantir.com",
  SOFI: "sofi.com",
};

export default function StockLogo({
  symbol,
  size = 28,
  className = "",
}: {
  symbol: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const domain = LOGO_DOMAINS[symbol.toUpperCase()];

  if (!domain || failed) {
    // Fallback: gradient circle with initials
    return (
      <div
        className={`rounded-md bg-gradient-to-br ${gradientForSymbol(symbol)} flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        {symbol.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}?size=${size * 2}`}
      alt={`${symbol} logo`}
      width={size}
      height={size}
      className={`rounded-md shrink-0 bg-white/10 object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
