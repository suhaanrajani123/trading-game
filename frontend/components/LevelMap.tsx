"use client";
import { GameLevel } from "@/types";
import { Check, Lock } from "lucide-react";

export default function LevelMap({
  levels,
  onSelect,
}: {
  levels: GameLevel[];
  onSelect: (level: GameLevel) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-brand/60 via-border to-border" />

      <ul className="space-y-4 relative">
        {levels.map((level) => (
          <li key={level.id} className="flex items-start gap-4">
            <button
              onClick={() => !level.locked && onSelect(level)}
              disabled={level.locked}
              className={`relative z-10 w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-mono text-sm font-medium transition-all ${
                level.completed
                  ? "bg-gradient-to-br from-gain to-emerald-400 text-white shadow-glass"
                  : level.locked
                  ? "glass text-muted cursor-not-allowed"
                  : "bg-gradient-to-br from-brand to-brand2 text-white shadow-glow"
              }`}
            >
              {level.completed ? <Check size={18} /> : level.locked ? <Lock size={14} /> : level.id}
            </button>

            <button
              onClick={() => !level.locked && onSelect(level)}
              disabled={level.locked}
              className={`flex-1 text-left glass rounded-2xl shadow-glass px-4 py-3.5 transition-all ${
                level.locked ? "opacity-50 cursor-not-allowed" : "glass-hover"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display font-medium">{level.title}</h4>
                <span className="text-xs text-xp font-mono">+{level.xp_reward} XP</span>
              </div>
              <p className="text-sm text-muted mt-1">{level.description}</p>
              {level.locked && <p className="text-xs text-muted mt-2">Complete the previous level to unlock</p>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
