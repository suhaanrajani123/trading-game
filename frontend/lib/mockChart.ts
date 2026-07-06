/**
 * Generates a placeholder candlestick series for the Trade page's
 * initial state, before any real symbol is selected. Deliberately
 * not tied to any real company — random-walk data only.
 */
import { Candle } from "@/types";

export function generatePreviewCandles(days = 90, startPrice = 100): Candle[] {
  const candles: Candle[] = [];
  let price = startPrice;
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const drift = (Math.random() - 0.48) * (price * 0.02);
    const open = price;
    const close = Math.max(1, open + drift);
    const high = Math.max(open, close) + Math.random() * (price * 0.008);
    const low = Math.min(open, close) - Math.random() * (price * 0.008);

    candles.push({
      time: date.toISOString().slice(0, 10),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: 0,
    });

    price = close;
  }

  return candles;
}
