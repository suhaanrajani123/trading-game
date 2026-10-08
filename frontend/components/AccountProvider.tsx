"use client";
import { createContext, useContext } from "react";
import { api } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import type { Portfolio } from "@/types";

interface AccountState {
  portfolio: Portfolio | null;
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
}

const AccountContext = createContext<AccountState>({ portfolio: null, error: null, loading: true, reload: async () => {} });

/** One shared, auto-refreshing copy of the player's portfolio for the whole app. */
export default function AccountProvider({ children }: { children: React.ReactNode }) {
  const { data, error, loading, reload } = useResource(api.portfolio, [], {
    intervalMs: 30_000,
    events: ["tp:portfolio-changed"],
  });
  return (
    <AccountContext.Provider value={{ portfolio: data, error, loading, reload }}>{children}</AccountContext.Provider>
  );
}

export const useAccount = () => useContext(AccountContext);
