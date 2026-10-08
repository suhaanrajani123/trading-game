/**
 * A quiet monogram tile for a ticker. (Third-party logo APIs come and go —
 * Clearbit's shut down — so the app doesn't depend on one.)
 */
const HUES = [215, 160, 30, 275, 345, 190, 120, 245];

export default function SymbolMark({ symbol, size = 32 }: { symbol: string; size?: number }) {
  let h = 0;
  for (const ch of symbol) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = HUES[h % HUES.length];
  const letters = symbol.replace(/[^A-Z]/g, "").slice(0, symbol.length > 3 ? 2 : 3);
  return (
    <span
      aria-hidden="true"
      className="inline-grid place-items-center shrink-0 rounded-[8px] font-semibold tracking-tight"
      style={{
        width: size,
        height: size,
        fontSize: size * (letters.length > 2 ? 0.3 : 0.36),
        background: `hsl(${hue} 45% 50% / 0.14)`,
        color: `hsl(${hue} 40% 42%)`,
      }}
    >
      <span className="dark:brightness-[1.7]">{letters}</span>
    </span>
  );
}
