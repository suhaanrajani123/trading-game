"use client";
import { api } from "@/lib/api";
import { useResource } from "@/lib/hooks";

const fmt = (iso: string, withDay: boolean) =>
  new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    ...(withDay ? { weekday: "short" } : {}),
  });

export default function MarketStatusPill() {
  const { data } = useResource(api.marketStatus, [], { intervalMs: 60_000 });
  if (!data) return null;

  const text = data.is_open
    ? `Market open${data.next_close ? `, closes ${fmt(data.next_close, false)} ET` : ""}`
    : `Market closed${data.next_open ? `, opens ${fmt(data.next_open, true)} ET` : ""}`;

  return (
    <span className="hidden md:inline-flex items-center gap-2 h-8 px-3 rounded-full border border-line text-[13px] text-inksoft whitespace-nowrap">
      <span className={`w-2 h-2 rounded-full ${data.is_open ? "bg-gain" : "bg-muted"}`} aria-hidden="true" />
      {text}
    </span>
  );
}
