"use client";
import Link from "next/link";
import AccountProvider from "@/components/AccountProvider";
import Logo from "@/components/Logo";
import MarketStatusPill from "@/components/MarketStatusPill";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import SymbolSearch from "@/components/SymbolSearch";
import ThemeToggle from "@/components/ThemeToggle";
import Ticker from "@/components/Ticker";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn-primary">
        Skip to content
      </a>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur">
            <Ticker />
            <div className="flex items-center gap-3 px-4 md:px-8 h-16 max-w-page w-full mx-auto">
              <Link href="/" className="lg:hidden shrink-0" aria-label="Tradepath home">
                <Logo size={30} />
              </Link>
              <div className="flex-1 max-w-[460px]">
                <SymbolSearch />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <MarketStatusPill />
                <div className="lg:hidden">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>
          <main id="main" className="flex-1 px-4 md:px-8 pt-4 pb-28 lg:pb-12 max-w-page w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
    </AccountProvider>
  );
}
