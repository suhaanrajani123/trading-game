"use client";
import { useEffect, useRef, useState } from "react";
import {
  ColorType, CrosshairMode, createChart,
  type IChartApi, type Time, type UTCTimestamp,
} from "lightweight-charts";
import type { Candle } from "@/types";

type Mode = "line" | "candles";

const cssColor = (name: string, alpha = 1) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim() || "128 128 128";
  return `rgba(${v.split(/\s+/).join(", ")}, ${alpha})`;
};

const etTime = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
const etDay = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" });
const etFull = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
});

function toDate(t: Time): Date {
  if (typeof t === "number") return new Date(t * 1000);
  if (typeof t === "string") return new Date(`${t}T12:00:00Z`);
  return new Date(Date.UTC(t.year, t.month - 1, t.day, 12));
}

export default function StockChart({
  candles,
  intraday,
  height = 380,
}: {
  candles: Candle[];
  intraday: boolean;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [mode, setMode] = useState<Mode>("line");
  const [themeTick, setThemeTick] = useState(0);

  useEffect(() => {
    const bump = () => setThemeTick((n) => n + 1);
    window.addEventListener("tp:theme-changed", bump);
    return () => window.removeEventListener("tp:theme-changed", bump);
  }, []);

  useEffect(() => {
    if (!ref.current || candles.length === 0) return;
    const rising = candles[candles.length - 1].close >= candles[0].open;
    const lineColor = cssColor(rising ? "gain" : "loss");

    const chart = createChart(ref.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: cssColor("muted"),
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        fontSize: 12,
      },
      grid: { vertLines: { visible: false }, horzLines: { color: cssColor("line", 0.7) } },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.08, bottom: 0.22 } },
      timeScale: {
        borderVisible: false,
        timeVisible: intraday,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        tickMarkFormatter: intraday ? (t: Time) => {
          const d = toDate(t);
          const hm = etTime.format(d);
          return hm === "9:30 AM" ? etDay.format(d) : hm;
        } : undefined,
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { color: cssColor("ink-soft", 0.4), labelBackgroundColor: cssColor("primary") },
        horzLine: { color: cssColor("ink-soft", 0.4), labelBackgroundColor: cssColor("primary") },
      },
      localization: {
        locale: "en-US",
        priceFormatter: (p: number) => `$${p.toFixed(2)}`,
        timeFormatter: (t: Time) => (intraday ? `${etFull.format(toDate(t))} ET` : etDay.format(toDate(t)) + `, ${toDate(t).getUTCFullYear()}`),
      },
      handleScale: { axisPressedMouseMove: false },
    });

    const data = candles.map((c) => ({ ...c, time: (typeof c.time === "number" ? (c.time as UTCTimestamp) : c.time) as Time }));

    if (mode === "line") {
      const s = chart.addAreaSeries({
        lineColor,
        lineWidth: 2,
        topColor: cssColor(rising ? "gain" : "loss", 0.18),
        bottomColor: cssColor(rising ? "gain" : "loss", 0.0),
        priceLineVisible: false,
        crosshairMarkerRadius: 4,
      });
      s.setData(data.map((c) => ({ time: c.time, value: c.close })));
    } else {
      const s = chart.addCandlestickSeries({
        upColor: cssColor("gain"),
        downColor: cssColor("loss"),
        wickUpColor: cssColor("gain"),
        wickDownColor: cssColor("loss"),
        borderVisible: false,
        priceLineVisible: false,
      });
      s.setData(data);
    }

    const vol = chart.addHistogramSeries({ priceScaleId: "vol", priceFormat: { type: "volume" }, lastValueVisible: false, priceLineVisible: false });
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.84, bottom: 0 } });
    vol.setData(
      data.map((c) => ({ time: c.time, value: c.volume, color: cssColor(c.close >= c.open ? "gain" : "loss", 0.28) })),
    );

    chart.timeScale().fitContent();
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, intraday, mode, themeTick]);

  return (
    <div>
      <div ref={ref} style={{ height }} className="w-full" />
      <div className="mt-3 flex justify-end">
        <div className="seg" role="group" aria-label="Chart style">
          <button aria-pressed={mode === "line"} onClick={() => setMode("line")}>Line</button>
          <button aria-pressed={mode === "candles"} onClick={() => setMode("candles")}>Candles</button>
        </div>
      </div>
    </div>
  );
}
