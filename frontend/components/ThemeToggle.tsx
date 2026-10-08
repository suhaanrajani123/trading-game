"use client";
import { useEffect, useState } from "react";
import { Circle, Moon, Sun } from "lucide-react";

export type Theme = "light" | "dark" | "black";

const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "black", label: "Black", icon: Circle },
];

function readTheme(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "dark" || t === "black" ? t : "light";
}

function applyTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch {
    /* storage blocked — theme still applies for this visit */
  }
  window.dispatchEvent(new Event("tp:theme-changed"));
}

function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    setTheme(readTheme());
    const sync = () => setTheme(readTheme());
    window.addEventListener("tp:theme-changed", sync);
    return () => window.removeEventListener("tp:theme-changed", sync);
  }, []);
  return [theme, (t) => { setTheme(t); applyTheme(t); }];
}

/** Light / Dark / Black. `compact` is a single button that cycles (for the mobile header). */
export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useTheme();

  if (compact) {
    const i = THEMES.findIndex((t) => t.id === theme);
    const next = THEMES[(i + 1) % THEMES.length];
    const Current = THEMES[i].icon;
    return (
      <button
        onClick={() => setTheme(next.id)}
        aria-label={`Theme: ${THEMES[i].label}. Switch to ${next.label}`}
        title={`Switch to ${next.label.toLowerCase()} mode`}
        className="btn-ghost w-10 px-0"
      >
        <Current size={17} fill={theme === "black" ? "currentColor" : "none"} />
      </button>
    );
  }

  return (
    <div className="seg w-full" role="group" aria-label="Theme">
      {THEMES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          aria-pressed={theme === id}
          onClick={() => setTheme(id)}
          className="flex-1 inline-flex items-center justify-center gap-1 !px-1 !text-[12.5px]"
        >
          <Icon size={14} fill={id === "black" ? "currentColor" : "none"} />
          {label}
        </button>
      ))}
    </div>
  );
}
