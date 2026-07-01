"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GameLevel } from "@/types";
import LevelMap from "@/components/LevelMap";
import LessonModal from "@/components/LessonModal";

export default function GamePage() {
  const [levels, setLevels] = useState<GameLevel[]>([]);
  const [selected, setSelected] = useState<GameLevel | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await api.getLevels();
      setLevels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load levels.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleComplete(levelId: number) {
    await api.completeLevel(levelId);
    await load();
    setSelected(null);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-2xl mb-1">Learning Path</h1>
      <p className="text-muted text-sm mb-6">Complete levels in order to unlock new trading tools.</p>

      {error && <p className="text-loss text-sm mb-4">{error}</p>}

      {levels.length > 0 && <LevelMap levels={levels} onSelect={setSelected} />}

      {selected && (
        <LessonModal level={selected} onClose={() => setSelected(null)} onComplete={handleComplete} />
      )}
    </div>
  );
}
