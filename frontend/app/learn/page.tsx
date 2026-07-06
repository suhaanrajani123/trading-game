"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GameLevel } from "@/types";
import LevelMap from "@/components/LevelMap";
import LessonPanel from "@/components/LessonPanel";
import { GraduationCap } from "lucide-react";

export default function LearnPage() {
  const [levels, setLevels] = useState<GameLevel[]>([]);
  const [selected, setSelected] = useState<GameLevel | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await api.getLevels();
      setLevels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lessons.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleComplete(levelId: number) {
    await api.completeLevel(levelId);
    await load();
  }

  const completedCount = levels.filter((l) => l.completed).length;

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start animate-fade-up h-full">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-xp to-amber-300 flex items-center justify-center shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl tracking-tight">Learn</h1>
        </div>
        <p className="text-muted text-sm mb-3">
          50 lessons, basics to advanced — from "what is a stock" to options, macroeconomics, and trading psychology.
          Select any lesson to begin.
        </p>
        {levels.length > 0 && (
          <p className="text-xs text-muted mb-6">
            {completedCount} of {levels.length} completed
          </p>
        )}

        {error && <p className="text-loss text-sm mb-4">{error}</p>}

        {levels.length > 0 && <LevelMap levels={levels} onSelect={setSelected} />}
      </div>
      
      <div className="sticky top-6">
        {selected ? (
          <LessonPanel level={selected} onClose={() => setSelected(null)} onComplete={handleComplete} />
        ) : (
          <div className="glass shadow-glass rounded-2xl p-8 flex flex-col items-center justify-center text-center h-64 border-dashed border-2">
            <GraduationCap size={32} className="text-muted mb-3 opacity-50" />
            <h3 className="font-display text-lg font-medium text-text/80">Select a lesson</h3>
            <p className="text-sm text-muted mt-1 max-w-[200px]">Click any lesson on the left to start learning.</p>
          </div>
        )}
      </div>
    </div>
  );
}
