const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdWhole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export const money = (n: number | null | undefined) => (n == null ? "—" : usd.format(n));
export const moneyWhole = (n: number) => usdWhole.format(n);

/** "+$12.30" / "−$4.00" — uses a real minus sign so columns line up. */
export const signedMoney = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${usd.format(Math.abs(n))}`;

export const pct = (n: number, digits = 2) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(digits)}%`;

export const shares = (n: number) =>
  Number.isInteger(n) ? n.toLocaleString("en-US") : n.toLocaleString("en-US", { maximumFractionDigits: 4 });

export const compactNum = (n: number | null | undefined) => (n == null ? "—" : compact.format(n));

/** Tailwind text class for a signed number. */
export const tone = (n: number) => (n > 0 ? "text-gain" : n < 0 ? "text-loss" : "text-inksoft");

export function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
