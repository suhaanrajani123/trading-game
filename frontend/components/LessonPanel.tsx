"use client";
import { GameLevel } from "@/types";
import { X, CheckCircle2 } from "lucide-react";

export default function LessonPanel({
  level,
  onClose,
  onComplete,
}: {
  level: GameLevel;
  onClose: () => void;
  onComplete: (levelId: number) => void;
}) {
  return (
    <div className="glass shadow-glass rounded-2xl w-full p-6 animate-fade-up">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-display font-bold text-xl">{level.title}</h3>
        <button onClick={onClose} className="text-muted hover:text-text transition-colors">
          <X size={18} />
        </button>
      </div>
      <p className="text-sm text-text/90 whitespace-pre-line leading-relaxed mb-6">{level.lesson}</p>

      {level.completed ? (
        <p className="text-sm text-gain flex items-center gap-1.5">
          <CheckCircle2 size={15} /> You've already completed this level.
        </p>
      ) : (
        <button
          onClick={() => onComplete(level.id)}
          className="w-full py-3 rounded-xl bg-gradient-to-br from-brand to-brand2 text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-glow"
        >
          Mark complete · +{level.xp_reward} XP
        </button>
      )}
    </div>
  );
}
