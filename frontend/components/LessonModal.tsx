"use client";
import { GameLevel } from "@/types";

export default function LessonModal({
  level,
  onClose,
  onComplete,
}: {
  level: GameLevel;
  onClose: () => void;
  onComplete: (levelId: number) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-border rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-display font-bold text-xl">{level.title}</h3>
          <button onClick={onClose} className="text-muted hover:text-text text-sm">
            Close
          </button>
        </div>
        <p className="text-sm text-text/90 whitespace-pre-line leading-relaxed mb-6">{level.lesson}</p>

        {level.completed ? (
          <p className="text-sm text-gain">✓ You've already completed this level.</p>
        ) : (
          <button
            onClick={() => onComplete(level.id)}
            className="w-full py-2.5 rounded-md bg-brand text-white font-medium text-sm hover:bg-brand/90 transition-colors"
          >
            Mark complete · +{level.xp_reward} XP
          </button>
        )}
      </div>
    </div>
  );
}
