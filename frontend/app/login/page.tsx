"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Login is no longer needed — redirect to dashboard
export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}
