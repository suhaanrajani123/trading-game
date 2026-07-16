"use client";
import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  loading: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  // No sign-in required — every visitor gets a unique device ID (see lib/api.ts)
  // and their own $100k virtual cash portfolio on the backend.
  return (
    <AuthContext.Provider value={{ loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}
