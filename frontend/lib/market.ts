"use client";
import { api } from "@/lib/api";
import { useResource } from "@/lib/hooks";

/**
 * "today" while the market is open; otherwise the day's change shown is from
 * the last session (e.g. Friday's move on a Monday morning).
 */
export function useDayLabel(): string {
  const { data } = useResource(api.marketStatus, [], { intervalMs: 60_000 });
  return data && !data.is_open ? "last trading day" : "today";
}
