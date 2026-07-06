"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, GraduationCap, Youtube, TrendingUp, LogOut, ClipboardCheck } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trade", label: "Trade", icon: ArrowLeftRight },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/exam", label: "Exam", icon: ClipboardCheck },
  { href: "/videos", label: "Videos", icon: Youtube },
];

export default function Nav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Extract display name or email
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Player";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const email = user?.email;

  return (
    <nav className="w-64 shrink-0 min-h-[calc(100vh-52px)] px-4 py-8 hidden md:flex md:flex-col border-r border-border/60">
      <div className="mb-10 flex items-center gap-2.5 px-2">
        <img src="/logo.png" alt="Tradepath Logo" className="w-10 h-10 rounded-md object-cover shadow-glow" />
        <div>
          <span className="font-display font-bold text-lg tracking-tight leading-none">Tradepath</span>
          <p className="text-[11px] text-muted mt-0.5">Learn the market. Risk nothing.</p>
        </div>
      </div>

      <ul className="space-y-1.5 flex-1">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all border-l-2 ${
                  active
                    ? "bg-slate-800/50 border-brand text-text font-medium"
                    : "border-transparent text-muted hover:text-text hover:bg-slate-800/30"
                }`}
              >
                <Icon
                  size={17}
                  strokeWidth={2}
                  className={active ? "text-brand" : "text-muted group-hover:text-text transition-colors"}
                />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* User info + Sign Out */}
      {user && (
        <div className="glass rounded-xl px-3 py-3 mb-3">
          <div className="flex items-center gap-2.5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-md shrink-0 border border-border/60"
              />
            ) : (
              <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName}</p>
              {email && <p className="text-[11px] text-muted truncate">{email}</p>}
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-2.5 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted hover:text-loss hover:bg-loss/10 transition-all"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      )}

      <div className="glass rounded-xl px-3 py-3 flex items-center justify-between">
        <span className="text-xs text-muted">Appearance</span>
        <ThemeToggle />
      </div>
    </nav>
  );
}
