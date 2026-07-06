"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";

import Link from "next/link";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Login page gets no nav/ticker — just raw content
  if (pathname === "/login") {
    return <div className="app-shell">{children}</div>;
  }

  return (
    <div className="app-shell">
      <Ticker />
      <div className="flex">
        <Nav />
        <main className="flex-1 min-h-[calc(100vh-52px)] px-6 py-8 md:px-10 relative">
          {!user && (
            <div className="absolute top-6 right-6 md:top-8 md:right-10 z-50">
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand to-brand2 text-white font-medium text-sm shadow-glow hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
