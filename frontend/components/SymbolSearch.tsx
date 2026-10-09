"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useDebounced } from "@/lib/hooks";
import { POPULAR_STOCKS } from "@/lib/popularStocks";
import SymbolMark from "@/components/SymbolMark";
import type { Asset } from "@/types";

/** Ticker/company search. Press "/" anywhere to focus it. */
export default function SymbolSearch({ autoFocus = false, onPick }: { autoFocus?: boolean; onPick?: (symbol: string) => void }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Asset[]>([]);
  const [active, setActive] = useState(0);
  const debounced = useDebounced(q.trim(), 180);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(t.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!debounced) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const local = POPULAR_STOCKS.filter(
      (s) => s.symbol.startsWith(debounced.toUpperCase()) || s.name.toLowerCase().includes(debounced.toLowerCase()),
    ).map((s) => ({ symbol: s.symbol, name: s.name, exchange: "" }));
    setResults(local.slice(0, 8));
    api
      .search(debounced)
      .then((r) => !cancelled && r.length && setResults(r))
      .catch(() => {}); // keep local matches if the server search is unavailable
    setActive(0);
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  function pick(symbol: string) {
    const clean = symbol.trim().toUpperCase();
    if (!clean) return;
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
    if (onPick) onPick(clean);
    else router.push(`/trade?symbol=${encodeURIComponent(clean)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(results[active]?.symbol ?? q);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showList = open && debounced.length > 0;

  return (
    <div className="relative w-full">
      <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        placeholder="Search a company or ticker"
        aria-label="Search stocks"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        className="field h-10 md:h-11 pl-10 pr-10"
        autoComplete="off"
        spellCheck={false}
      />
      <kbd className="hidden md:grid absolute right-2.5 top-1/2 -translate-y-1/2 place-items-center w-6 h-6 rounded-md border border-line text-[12px] text-muted">
        /
      </kbd>

      {showList && (
        <ul id={listId} role="listbox" className="absolute z-50 mt-1.5 w-full panel py-1.5 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)] max-h-[360px] overflow-auto">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">
              No matches. Press Enter to look up &ldquo;{q.trim().toUpperCase()}&rdquo; anyway.
            </li>
          ) : (
            results.map((a, i) => (
              <li
                key={a.symbol}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(a.symbol);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${i === active ? "bg-surface2" : ""}`}
              >
                <SymbolMark symbol={a.symbol} size={30} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{a.symbol}</span>
                  <span className="block text-[13px] text-inksoft truncate">{a.name}</span>
                </span>
                {a.exchange && <span className="ml-auto text-[12px] text-muted">{a.exchange}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
