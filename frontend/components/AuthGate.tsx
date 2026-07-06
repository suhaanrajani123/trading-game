"use client";
import { useAuth } from "@/components/AuthProvider";
import { TrendingUp } from "lucide-react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  // Loading state — show a branded spinner
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-bg z-50">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand2 flex items-center justify-center shadow-glow animate-pulse">
          <TrendingUp size={22} className="text-white" strokeWidth={2.5} />
        </div>
        <p className="text-muted text-sm animate-pulse">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
