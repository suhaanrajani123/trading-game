"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/trade", label: "Trade" },
  { href: "/game", label: "Levels" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 border-r border-border min-h-[calc(100vh-40px)] px-5 py-8 hidden md:block">
      <div className="mb-10">
        <span className="font-display font-bold text-xl tracking-tight">Tradepath</span>
        <p className="text-xs text-muted mt-1">Learn the market. Risk nothing.</p>
      </div>
      <ul className="space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-brand/15 text-brand font-medium"
                    : "text-muted hover:text-text hover:bg-surfaceHover"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
