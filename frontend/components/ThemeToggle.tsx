"use client";
import { useEffect, useState } from "react";
import { Sun, Moon, LayoutTemplate } from "lucide-react";

type ThemeMode = "dark" | "light" | "default";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as ThemeMode | null;
    setTheme(current === "light" ? "light" : current === "default" ? "default" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : theme === "light" ? "default" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("theme", next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Current mode: ${theme}`}
      className="w-8 h-8 rounded-lg glass glass-hover flex items-center justify-center text-muted hover:text-text transition-colors"
      title={`Switch theme (current: ${theme})`}
    >
      {theme === "dark" ? <Moon size={14} /> : theme === "light" ? <Sun size={14} /> : <LayoutTemplate size={14} />}
    </button>
  );
}
