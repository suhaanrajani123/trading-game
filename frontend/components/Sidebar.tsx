"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { NAV_ITEMS, isActive } from "@/components/navItems";
import { useAccount } from "@/components/AccountProvider";

const TOTAL_LESSONS = 50;

export default function Sidebar() {
  const pathname = usePathname();
  const { portfolio } = useAccount();
  const level = portfolio?.current_level ?? 1;
  const done = Math.min(level - 1, TOTAL_LESSONS);

  return (
    <aside className="hidden lg:block w-[232px] shrink-0 border-r border-line bg-surface">
      <div className="sticky top-0 h-screen flex flex-col">
      <Link href="/" className="flex items-center gap-2.5 px-5 h-16">
        <Logo size={30} />
        <span className="font-display text-[19px] font-semibold tracking-tight">Tradepath</span>
      </Link>

      <nav aria-label="Main" className="px-3 pt-2 flex-1">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 h-10 px-3 rounded-control text-[14.5px] transition-colors ${
                    active ? "bg-surface2 text-ink font-medium" : "text-inksoft hover:text-ink hover:bg-surface2/60"
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  <span className={active ? "marker" : undefined}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 space-y-2">
        <Link href="/learn" className="block rounded-panel border border-line p-4 hover:bg-surface2/60 transition-colors">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">Your progress</p>
            <p className="num text-xs text-muted">{portfolio?.xp ?? 0} XP</p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-surface2 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL_LESSONS} aria-valuenow={done} aria-label="Lessons completed">
            <div className="h-full rounded-full bg-marker transition-[width] duration-700" style={{ width: `${(done / TOTAL_LESSONS) * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-inksoft">
            {done >= TOTAL_LESSONS ? "Every lesson complete" : `Up next: lesson ${level} of ${TOTAL_LESSONS}`}
          </p>
        </Link>
        <ThemeToggle />
      </div>
      </div>
    </aside>
  );
}
