"use client";
import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi } from "lightweight-charts";
import { Candle } from "@/types";

export default function StockChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartType, setChartType] = useState<"candle" | "line">("candle");

  useEffect(() => {
    if (!containerRef.current) return;

    const toRgbString = (spaceSeparated: string, fallback: string) => {
      const value = spaceSeparated.trim() || fallback;
      return `rgb(${value.split(/\s+/).join(", ")})`;
    };

    const textColorRaw = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
    const borderColorRaw = getComputedStyle(document.documentElement).getPropertyValue("--border").trim();
    const brandColorRaw = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim();
    const textColor = toRgbString(textColorRaw, "151 160 181");
    const borderColor = toRgbString(borderColorRaw, "42 48 70");
    const brandColor = toRgbString(brandColorRaw, "132, 114, 255");

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
        fontFamily: "var(--font-plex-mono)",
      },
      grid: {
        vertLines: { color: borderColor },
        horzLines: { color: borderColor },
      },
      width: containerRef.current.clientWidth,
      height: 360,
      timeScale: { borderColor },
      rightPriceScale: { borderColor },
    });

    const data = candles.map((c) => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      value: c.close, // needed for line series
    }));

    if (chartType === "candle") {
      const series = chart.addCandlestickSeries({
        upColor: "#2dd490",
        downColor: "#fb6981",
        borderVisible: false,
        wickUpColor: "#2dd490",
        wickDownColor: "#fb6981",
      });
      series.setData(data);
    } else {
      const series = chart.addLineSeries({
        color: brandColor,
        lineWidth: 2,
        crosshairMarkerRadius: 4,
      });
      series.setData(data);
    }

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      color: "rgba(132, 114, 255, 0.35)",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });
    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? "rgba(45, 212, 144, 0.35)" : "rgba(251, 105, 129, 0.35)",
      }))
    );

    const total = candles.length;
    if (total > 52) {
      chart.timeScale().setVisibleLogicalRange({
        from: total - 52,
        to: total - 1,
      });
    } else {
      chart.timeScale().fitContent();
    }
    
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [candles, chartType]);

  return (
    <div className="w-full flex flex-col h-full gap-3">
      <div ref={containerRef} className="w-full flex-1" />
      <div className="flex justify-start">
        <div className="glass shadow-glass rounded-lg p-1 flex gap-1 items-center">
          <button
            onClick={() => setChartType("candle")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              chartType === "candle" ? "bg-surface2 text-text shadow-sm" : "text-muted hover:text-text"
            }`}
          >
            Candlestick
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              chartType === "line" ? "bg-surface2 text-text shadow-sm" : "text-muted hover:text-text"
            }`}
          >
            Line Graph
          </button>
        </div>
      </div>
    </div>
  );
}
