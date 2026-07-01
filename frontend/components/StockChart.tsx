"use client";
import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi } from "lightweight-charts";
import { Candle } from "@/types";

export default function StockChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8B94A3",
        fontFamily: "var(--font-plex-mono)",
      },
      grid: {
        vertLines: { color: "#242A33" },
        horzLines: { color: "#242A33" },
      },
      width: containerRef.current.clientWidth,
      height: 340,
      timeScale: { borderColor: "#242A33" },
      rightPriceScale: { borderColor: "#242A33" },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#00D964",
      downColor: "#FF4757",
      borderVisible: false,
      wickUpColor: "#00D964",
      wickDownColor: "#FF4757",
    });

    series.setData(
      candles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    chart.timeScale().fitContent();
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
  }, [candles]);

  return <div ref={containerRef} className="w-full" />;
}
