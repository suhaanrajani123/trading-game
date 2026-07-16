"use client";
import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page no longer exists, but keep simple guard just in case
  if (pathname === "/login") {
    return <div className="app-shell">{children}</div>;
  }

  return (
    <div className="app-shell">
      <Ticker />
      <div className="w-full bg-brand/10 border-b border-brand/20 py-2.5 text-center">
        <p className="text-sm font-medium text-brand">Welcome to TradePath, where practice builds real investors</p>
      </div>
      <div className="flex">
        <Nav />
        <main className="flex-1 min-h-[calc(100vh-52px)] px-6 py-8 md:px-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
