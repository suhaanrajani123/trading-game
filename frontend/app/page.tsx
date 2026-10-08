"use client";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { useAccount } from "@/components/AccountProvider";
import AllocationStrip from "@/components/AllocationStrip";
import HoldingsTable from "@/components/HoldingsTable";
import ServerError from "@/components/ServerError";
import Watchlist from "@/components/Watchlist";
import { api } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { money, moneyWhole, pct, signedMoney, tone } from "@/lib/format";

export default function DashboardPage() {
  const { portfolio: p, error } = useAccount();
  const lessons = useResource(api.lessons, []);
  const upcoming = lessons.data?.filter((l) => !l.completed).slice(0, 4) ?? [];
  const nextLesson = upcoming[0] ?? null;
  const doneCount = lessons.data?.filter((l) => l.completed).length ?? 0;

  if (error && !p) return <ServerError message={error} />;

  return (
    <div className="space-y-6 animate-rise">
      <section className="grid lg:grid-cols-[1fr_340px] gap-6 [&>*]:min-w-0">
        <div className="panel p-6 md:p-7">
          <h1 className="text-[15px] font-sans font-medium text-inksoft">Account value</h1>
          {p ? (
            <>
              <p className="num font-display text-[44px] md:text-[56px] leading-none font-semibold tracking-tight mt-2">
                {money(p.total_equity)}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[15px] num">
                <p>
                  <span className={tone(p.day_change)}>
                    {signedMoney(p.day_change)} ({pct(p.day_change_percent)})
                  </span>{" "}
                  <span className="text-inksoft">today</span>
                </p>
                <p>
                  <span className={tone(p.total_return)}>
                    {signedMoney(p.total_return)} ({pct(p.total_return_percent)})
                  </span>{" "}
                  <span className="text-inksoft">since you started with {moneyWhole(p.starting_cash)}</span>
                </p>
              </div>
              <div className="mt-7">
                <AllocationStrip portfolio={p} />
              </div>
              <dl className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-y-4 border-t border-line pt-5 num">
                <Stat label="Cash" value={money(p.cash)} />
                <Stat label="Buying power" value={money(p.buying_power)} hint={p.reserved_cash > 0 ? `${money(p.reserved_cash)} held for open orders` : undefined} />
                <Stat label="Invested" value={money(p.total_market_value)} />
                <Stat label="Realized gains" value={signedMoney(p.total_realized_pnl)} valueClass={tone(p.total_realized_pnl)} />
              </dl>
            </>
          ) : (
            <div className="mt-3 space-y-4" aria-busy="true">
              <div className="skeleton h-14 w-72" />
              <div className="skeleton h-5 w-96 max-w-full" />
              <div className="skeleton h-3 w-full mt-8" />
            </div>
          )}
        </div>

        <aside className="panel p-6 flex flex-col">
          <div className="flex items-center gap-2 text-sm text-inksoft">
            <BookOpen size={16} />
            {lessons.data ? `${doneCount} of ${lessons.data.length} lessons done` : "Lessons"}
          </div>
          {nextLesson ? (
            <>
              <p className="mt-4 text-[13px] text-muted">Up next, lesson {nextLesson.id}</p>
              <h2 className="mt-1 text-[22px] leading-tight font-semibold">
                <span className="marker">{nextLesson.title}</span>
              </h2>
              <p className="mt-2 text-sm text-inksoft">{nextLesson.description}</p>
              <Link href={`/learn?lesson=${nextLesson.id}`} className="btn-primary mt-5 self-start">
                Start lesson
              </Link>
              {upcoming.length > 1 && (
                <div className="mt-auto pt-6">
                  <p className="text-[13px] text-muted">After that</p>
                  <ol className="mt-2 space-y-1.5">
                    {upcoming.slice(1).map((l) => (
                      <li key={l.id}>
                        <Link href={`/learn?lesson=${l.id}`} className="flex gap-3 text-sm text-inksoft hover:text-ink">
                          <span className="num w-5 text-muted">{l.id}</span>
                          <span className="truncate">{l.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          ) : lessons.data ? (
            <>
              <h2 className="mt-4 text-[22px] font-semibold">You finished every lesson.</h2>
              <p className="mt-2 text-sm text-inksoft">See how much stuck with the final exam.</p>
              <Link href="/exam" className="btn-primary mt-auto self-start">Take the exam</Link>
            </>
          ) : (
            <div className="space-y-3 mt-4"><div className="skeleton h-6 w-3/4" /><div className="skeleton h-4 w-full" /></div>
          )}
        </aside>
      </section>

      <section className="grid lg:grid-cols-[1fr_340px] gap-6 items-start [&>*]:min-w-0">
        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Your stocks</h2>
            {p && p.open_orders > 0 && (
              <Link href="/activity?status=open" className="text-sm text-inksoft hover:text-ink underline underline-offset-2">
                {p.open_orders} open order{p.open_orders === 1 ? "" : "s"}
              </Link>
            )}
          </div>
          {!p ? (
            <div className="px-5 pb-5 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-10" />)}</div>
          ) : p.positions.length === 0 ? (
            <div className="px-5 pb-8 pt-2">
              <p className="text-[15px]">You don&apos;t own any stocks yet.</p>
              <p className="text-sm text-inksoft mt-1">
                Pick a company you know, buy a few shares, and watch what the price does over the next few days.
              </p>
              <Link href="/trade" className="btn-primary mt-4">
                Find a stock <ArrowUpRight size={16} />
              </Link>
            </div>
          ) : (
            <HoldingsTable positions={p.positions} />
          )}
        </div>
        <Watchlist />
      </section>
    </div>
  );
}

function Stat({ label, value, hint, valueClass = "" }: { label: string; value: string; hint?: string; valueClass?: string }) {
  return (
    <div>
      <dt className="text-[13px] text-inksoft">{label}</dt>
      <dd className={`mt-0.5 text-[17px] font-medium ${valueClass}`}>{value}</dd>
      {hint && <dd className="text-[12px] text-muted">{hint}</dd>}
    </div>
  );
}
