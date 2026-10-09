"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ColorType, CrosshairMode, LineStyle, createChart,
  type IChartApi, type Time, type UTCTimestamp,
} from "lightweight-charts";
import { api } from "@/lib/api";
import { useMediaQuery, useResource } from "@/lib/hooks";
import { money, pct, signedMoney, tone } from "@/lib/format";
import type { HistoryPoint, HistoryRange } from "@/types";

const RANGES: { id: HistoryRange; label: string }[] = [
  { id: "1D", label: "1D" },
  { id: "1W", label: "1W" },
  { id: "1M", label: "1M" },
  { id: "3M", label: "3M" },
  { id: "1Y", label: "1Y" },
  { id: "ALL", label: "All" },
];
const SHADES = [1, 0.72, 0.5, 0.34, 0.22]; // top 4 stocks + "Other", like the allocation bar
type Mode = "total" | "stocks";

const rgb = (name: string) =>
  (getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim() || "128 128 128")
    .split(/\s+/)
    .map(Number);
const css = (c: number[], a = 1) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
/** Solid color = `fg` laid over `bg` at `alpha` (keeps stacked layers from bleeding). */
const mix = (fg: number[], bg: number[], alpha: number) => fg.map((v, i) => Math.round(v * alpha + bg[i] * (1 - alpha)));

const dayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const timeFmt = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
});
const etTick = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
const labelFor = (t: string | number) =>
  typeof t === "number" ? `${timeFmt.format(new Date(t * 1000))} ET` : dayFmt.format(new Date(`${t}T12:00:00Z`));

interface Layer {
  key: string;
  label: string;
  value: (p: HistoryPoint) => number;
}

/** Account value over time: one line for the total, or stacked bands per stock + cash. */
export default function PortfolioChart() {
  const [range, setRange] = useState<HistoryRange>("ALL");
  const [mode, setMode] = useState<Mode>("total");
  const [hover, setHover] = useState<number | null>(null);
  const [themeTick, setThemeTick] = useState(0);
  const isPhone = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const { data, error, loading } = useResource(() => api.portfolioHistory(range), [range], {
    intervalMs: 60_000,
    events: ["tp:portfolio-changed"],
  });

  useEffect(() => {
    const bump = () => setThemeTick((n) => n + 1);
    window.addEventListener("tp:theme-changed", bump);
    return () => window.removeEventListener("tp:theme-changed", bump);
  }, []);

  // Strictly increasing, de-duplicated points (the chart library requires it).
  const points = useMemo(() => {
    const seen = new Map<string | number, HistoryPoint>();
    (data?.points ?? []).forEach((p) => seen.set(p.time, p));
    return [...seen.values()].sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
  }, [data]);

  // Biggest stocks first, the rest grouped, cash on top — same as the allocation bar.
  const layers: Layer[] = useMemo(() => {
    if (!points.length) return [];
    const last = points[points.length - 1];
    const ranked = [...(data?.symbols ?? [])].sort(
      (a, b) => (last.holdings[b] ?? 0) - (last.holdings[a] ?? 0) || a.localeCompare(b),
    );
    const top = ranked.slice(0, 4);
    const rest = ranked.slice(4);
    const out: Layer[] = top.map((s) => ({ key: s, label: s, value: (p) => p.holdings[s] ?? 0 }));
    if (rest.length) out.push({ key: "other", label: "Other", value: (p) => rest.reduce((t, s) => t + (p.holdings[s] ?? 0), 0) });
    out.push({ key: "cash", label: "Cash", value: (p) => p.cash });
    return out;
  }, [points, data?.symbols]);

  const height = isPhone ? 220 : 280;

  useEffect(() => {
    if (!ref.current || points.length === 0) return;
    const surface = rgb("surface");
    const primary = rgb("primary");
    const marker = rgb("marker");
    const first = points[0].total;
    const last = points[points.length - 1].total;
    const up = last >= first;
    const accent = rgb(up ? "gain" : "loss");
    const intraday = Boolean(data?.intraday);
    const totals = points.map((p) => p.total);
    const spread = Math.max(...totals, data?.starting_cash ?? 0) - Math.min(...totals, data?.starting_cash ?? Infinity);
    const toTime = (t: string | number) => (typeof t === "number" ? (t as UTCTimestamp) : t) as Time;

    const chart = createChart(ref.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: css(rgb("muted")),
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        fontSize: 12,
      },
      grid: { vertLines: { visible: false }, horzLines: { color: css(rgb("line"), 0.7) } },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.1, bottom: mode === "stocks" ? 0 : 0.08 } },
      timeScale: {
        borderVisible: false,
        timeVisible: intraday,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        // Market time (ET), not UTC
        tickMarkFormatter: intraday
          ? (t: Time) => etTick.format(new Date((t as number) * 1000))
          : undefined,
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: { color: css(rgb("ink-soft"), 0.4), labelVisible: false },
        horzLine: { color: css(rgb("ink-soft"), 0.4), labelBackgroundColor: css(primary) },
      },
      localization: {
        locale: "en-US",
        // Show cents when the account has barely moved, so labels don't repeat.
        priceFormatter: (p: number) =>
          spread < 200
            ? `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `$${Math.round(p).toLocaleString("en-US")}`,
      },
      handleScale: false,
      handleScroll: false,
    });

    if (mode === "total") {
      const s = chart.addAreaSeries({
        lineColor: css(accent),
        lineWidth: 2,
        topColor: css(accent, 0.2),
        bottomColor: css(accent, 0),
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerRadius: 4,
      });
      s.setData(points.map((p) => ({ time: toTime(p.time), value: p.total })));
      s.createPriceLine({
        price: data?.starting_cash ?? 100_000,
        color: css(rgb("muted"), 0.8),
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        // Skip the axis tag when it would sit on top of the current value's tag.
        axisLabelVisible: Math.abs(last - (data?.starting_cash ?? 100_000)) / (data?.starting_cash ?? 100_000) > 0.006,
        title: "Start",
      });
    } else {
      // Stacked bands: draw cumulative totals from the top layer down so each
      // lower band paints over the one above it.
      const cumulative = points.map((p) => {
        let run = 0;
        return layers.map((l) => (run += l.value(p)));
      });
      for (let i = layers.length - 1; i >= 0; i--) {
        const isCash = layers[i].key === "cash";
        const color = isCash ? mix(marker, surface, 0.55) : mix(primary, surface, SHADES[Math.min(i, SHADES.length - 1)]);
        const s = chart.addAreaSeries({
          lineColor: css(color),
          lineWidth: 1,
          topColor: css(color),
          bottomColor: css(color),
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        });
        s.setData(points.map((p, j) => ({ time: toTime(p.time), value: cumulative[j][i] })));
      }
    }

    chart.timeScale().fitContent();
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) return setHover(null);
      const key = typeof param.time === "object" ? null : param.time;
      const idx = points.findIndex((p) => p.time === key);
      setHover(idx >= 0 ? idx : null);
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [points, layers, mode, data?.intraday, data?.starting_cash, themeTick]);

  const shown = hover != null ? points[hover] : points[points.length - 1];
  const base = points[0]?.total ?? 0;
  const delta = shown ? shown.total - base : 0;

  return (
    <section className="panel" aria-labelledby="value-chart-title">
      <div className="px-4 md:px-5 pt-4 md:pt-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="value-chart-title" className="panel-title">Account value over time</h2>
          {shown ? (
            <p className="num mt-1 text-sm">
              <span className="font-semibold text-ink text-[15px]">{money(shown.total)}</span>{" "}
              <span className={tone(delta)}>
                {signedMoney(delta)} ({pct(base ? (delta / base) * 100 : 0)})
              </span>{" "}
              <span className="text-inksoft">{hover != null ? `on ${labelFor(shown.time)}` : rangeLabel(range)}</span>
            </p>
          ) : (
            <div className="skeleton h-4 w-56 mt-2" />
          )}
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="seg w-full sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none" role="group" aria-label="Time range">
            {RANGES.map((r) => (
              <button key={r.id} aria-pressed={range === r.id} onClick={() => setRange(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
          <div className="seg w-full sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none" role="group" aria-label="Chart view">
            <button aria-pressed={mode === "total"} onClick={() => setMode("total")}>Total</button>
            <button aria-pressed={mode === "stocks"} onClick={() => setMode("stocks")}>By stock</button>
          </div>
        </div>
      </div>

      <div className="px-2 md:px-3 pt-3 pb-2">
        {loading && !data ? (
          <div className="skeleton mx-2" style={{ height }} />
        ) : error && !data ? (
          <div className="grid place-items-center text-sm text-inksoft text-center px-6" style={{ height }}>{error}</div>
        ) : (
          <div ref={ref} style={{ height }} className="w-full" />
        )}
      </div>

      {mode === "stocks" && shown && (
        <ul className="px-4 md:px-5 pb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-inksoft num">
          {layers.map((l, i) => (
            <li key={l.key} className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-sm ${l.key === "cash" ? "bg-marker" : "bg-primary"}`}
                style={{ opacity: l.key === "cash" ? 0.55 : SHADES[Math.min(i, SHADES.length - 1)] }}
                aria-hidden="true"
              />
              <span className="text-ink font-medium">{l.label}</span>
              {money(l.value(shown))}
            </li>
          ))}
        </ul>
      )}
      {mode === "total" && <div className="pb-2" />}
    </section>
  );
}

const rangeLabel = (r: HistoryRange) =>
  ({ "1D": "today", "1W": "past week", "1M": "past month", "3M": "past 3 months", "1Y": "past year", ALL: "since you started" })[r];
