"use client";
import { GameLevel } from "@/types";

export default function LevelMap({
  levels,
  onSelect,
}: {
  levels: GameLevel[];
  onSelect: (level: GameLevel) => void;
}) {
  return (
    <div className="relative">
      {/* connecting path line, styled like a price chart trending up */}
      <svg
        className="absolute left-6 top-6 bottom-6 w-1 h-[calc(100%-3rem)]"
        style={{ overflow: "visible" }}
      >
        <line x1="0" y1="0" x2="0" y2="100%" stroke="#242A33" strokeWidth="2" />
      </svg>

      <ul className="space-y-4 relative">
        {levels.map((level) => (
          <li key={level.id} className="flex items-start gap-4">
            <button
              onClick={() => !level.locked && onSelect(level)}
              disabled={level.locked}
              className={`relative z-10 w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-mono text-sm font-medium border-2 transition-colors ${
                level.completed
                  ? "bg-gain/15 border-gain text-gain"
                  : level.locked
                  ? "bg-surface border-border text-muted cursor-not-allowed"
                  : "bg-brand/15 border-brand text-brand hover:bg-brand/25"
              }`}
            >
              {level.completed ? "✓" : level.id}
            </button>

            <button
              onClick={() => !level.locked && onSelect(level)}
              disabled={level.locked}
              className={`flex-1 text-left bg-surface border border-border rounded-lg px-4 py-3 transition-colors ${
                level.locked ? "opacity-50 cursor-not-allowed" : "hover:border-brand/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display font-medium">{level.title}</h4>
                <span className="text-xs text-xp font-mono">+{level.xp_reward} XP</span>
              </div>
              <p className="text-sm text-muted mt-1">{level.description}</p>
              {level.locked && <p className="text-xs text-muted mt-2">🔒 Complete the previous level to unlock</p>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
