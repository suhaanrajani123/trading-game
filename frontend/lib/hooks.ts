"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface Resource<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
}

/**
 * Fetch on mount, optionally re-fetch on an interval (paused while the tab is
 * hidden) and whenever any of `events` fires on window.
 */
export function useResource<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  opts: { intervalMs?: number; events?: string[] } = {},
): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const seq = useRef(0);

  const reload = useCallback(async () => {
    const id = ++seq.current;
    try {
      const result = await fetcherRef.current();
      if (id === seq.current) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (id === seq.current) setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setData(null);
    reload();
    const timers: number[] = [];
    if (opts.intervalMs) {
      timers.push(window.setInterval(() => {
        if (document.visibilityState === "visible") reload();
      }, opts.intervalMs));
    }
    const events = opts.events ?? [];
    const onEvent = () => reload();
    events.forEach((e) => window.addEventListener(e, onEvent));
    return () => {
      timers.forEach(clearInterval);
      events.forEach((e) => window.removeEventListener(e, onEvent));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, reload };
}

export function useDebounced<T>(value: T, ms = 200): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
