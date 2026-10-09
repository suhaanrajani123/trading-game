"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "@/components/navItems";

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.filter((i) => i.mobile).map(({ href, short, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] ${active ? "text-ink font-medium" : "text-muted"}`}
              >
                <span className={`grid place-items-center w-12 h-7 rounded-full transition-colors ${active ? "bg-marker text-[#14213D]" : ""}`}>
                  <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
                </span>
                {short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
