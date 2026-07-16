"use client";

// Auth gate is no longer needed since there's no sign-in flow.
// Kept as a pass-through in case any code still imports it.
export default function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
