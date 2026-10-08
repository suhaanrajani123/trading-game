"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, ClipboardCheck, PlayCircle } from "lucide-react";
import { api, emitPortfolioChanged } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import type { Lesson } from "@/types";

const SECTIONS = [
  { from: 1, title: "The basics" },
  { from: 11, title: "Choosing and managing stocks" },
  { from: 21, title: "Options and trading tactics" },
  { from: 31, title: "Rules, the economy and volatility" },
  { from: 41, title: "How the market really works" },
];

export default function LearnView() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: lessons, error, reload } = useResource(api.lessons, []);
  const selectedId = Number(params.get("lesson")) || null;
  const selected = lessons?.find((l) => l.id === selectedId) ?? null;

  const open = (id: number | null) => router.push(id ? `/learn?lesson=${id}` : "/learn", { scroll: false });

  if (error) return <p className="panel p-6 text-inksoft">{error}</p>;

  const done = lessons?.filter((l) => l.completed).length ?? 0;
  const total = lessons?.length ?? 50;

  return (
    <div className="animate-rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-semibold">Lessons</h1>
          <p className="mt-1 text-inksoft max-w-prose">
            Fifty short lessons, from what a share is to options and the Fed. Read them in order or jump to what you&apos;re curious about.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/videos" className="btn-secondary"><PlayCircle size={16} /> Videos</Link>
          <Link href="/exam" className="btn-secondary"><ClipboardCheck size={16} /> Final exam</Link>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4 max-w-xl">
        <div className="h-2.5 flex-1 rounded-full bg-surface2 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Lessons completed">
          <div className="h-full bg-marker rounded-full transition-[width] duration-700" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <p className="num text-sm text-inksoft whitespace-nowrap">{done} of {total} done</p>
      </div>

      <div className="mt-6 grid lg:grid-cols-[360px_1fr] gap-6 items-start [&>*]:min-w-0">
        <nav aria-label="Lessons" className={`panel lg:sticky lg:top-[124px] lg:max-h-[calc(100vh-148px)] overflow-auto ${selected ? "hidden lg:block" : ""}`}>
          {!lessons ? (
            <div className="p-4 space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-11" />)}</div>
          ) : (
            SECTIONS.map((sec, si) => {
              const items = lessons.filter((l) => l.id >= sec.from && l.id < (SECTIONS[si + 1]?.from ?? Infinity));
              return (
                <div key={sec.from} className="py-2 border-b border-line last:border-0">
                  <h2 className="px-4 pt-2 pb-1 text-[13px] font-sans font-medium text-muted">{sec.title}</h2>
                  <ol>
                    {items.map((l) => (
                      <li key={l.id}>
                        <button
                          onClick={() => open(l.id)}
                          aria-current={l.id === selectedId ? "true" : undefined}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-left text-[14.5px] ${
                            l.id === selectedId ? "bg-surface2" : "hover:bg-surface2/60"
                          }`}
                        >
                          <span
                            className={`num grid place-items-center w-7 h-7 shrink-0 rounded-full text-[12px] font-semibold ${
                              l.completed ? "bg-marker text-[#14213D]" : "border border-line text-inksoft"
                            }`}
                          >
                            {l.completed ? <Check size={14} strokeWidth={3} /> : l.id}
                          </span>
                          <span className="flex-1 min-w-0 truncate">{l.title}</span>
                          <span className="num text-[12px] text-muted">{l.xp_reward} XP</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })
          )}
        </nav>

        {selected ? (
          <LessonReader
            key={selected.id}
            lesson={selected}
            next={lessons?.find((l) => l.id === selected.id + 1) ?? null}
            onBack={() => open(null)}
            onNext={(id) => open(id)}
            onCompleted={reload}
          />
        ) : (
          <div className="hidden lg:block panel p-8 text-inksoft">
            <p className="text-ink font-medium">Pick a lesson from the list.</p>
            <p className="mt-1 text-sm">Each one takes a few minutes and ends with something to try in the simulator.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LessonReader({
  lesson, next, onBack, onNext, onCompleted,
}: {
  lesson: Lesson;
  next: Lesson | null;
  onBack: () => void;
  onNext: (id: number) => void;
  onCompleted: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [gained, setGained] = useState<number | null>(null);
  const top = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.innerWidth < 1024) top.current?.scrollIntoView({ block: "start" });
  }, []);

  async function complete() {
    setSaving(true);
    try {
      const r = await api.completeLesson(lesson.id);
      setGained(r.xp_gained);
      await onCompleted();
      emitPortfolioChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <article ref={top} className="panel p-6 md:p-9 scroll-mt-32" aria-labelledby="lesson-title">
      <button onClick={onBack} className="lg:hidden btn-ghost -ml-3 mb-3"><ArrowLeft size={16} /> All lessons</button>
      <p className="text-sm text-muted num">Lesson {lesson.id}</p>
      <h2 id="lesson-title" className="mt-1 text-[30px] md:text-[34px] leading-tight font-semibold">{lesson.title}</h2>
      <p className="mt-2 text-[17px] text-inksoft max-w-prose">{lesson.description}</p>

      <div className="mt-7 max-w-prose space-y-4 text-[16.5px] leading-[1.7]">
        <LessonBody text={lesson.lesson} />
      </div>

      <div className="mt-9 pt-6 border-t border-line flex flex-wrap items-center gap-3">
        {lesson.completed || gained != null ? (
          <p className="flex items-center gap-2 text-[15px]">
            <span className="grid place-items-center w-7 h-7 rounded-full bg-marker text-[#14213D]"><Check size={15} strokeWidth={3} /></span>
            {gained ? `Lesson complete. You earned ${gained} XP.` : "You've completed this lesson."}
          </p>
        ) : (
          <button onClick={complete} disabled={saving} className="btn-primary h-11">
            {saving ? "Saving…" : `Complete lesson, +${lesson.xp_reward} XP`}
          </button>
        )}
        {next && (
          <button onClick={() => onNext(next.id)} className="btn-secondary h-11 ml-auto">
            Next: {next.title}
          </button>
        )}
      </div>
    </article>
  );
}

/** Lessons are plain text; give their recurring parts some structure. */
function LessonBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.every((l) => /^[-•]\s/.test(l))) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1.5 marker:text-muted">
              {lines.map((l, j) => <li key={j}>{l.replace(/^[-•]\s/, "")}</li>)}
            </ul>
          );
        }
        const example = block.match(/^Real[- ]Life Example:\s*/i);
        if (example) {
          return (
            <aside key={i} className="rounded-control bg-surface2 px-5 py-4 text-[15.5px]">
              <p className="font-semibold text-ink mb-1">A real-life example</p>
              <p className="text-inksoft">{block.slice(example[0].length)}</p>
            </aside>
          );
        }
        const mission = block.match(/^Your mission:\s*/i);
        if (mission) {
          return (
            <p key={i} className="border-l-4 border-marker pl-4">
              <span className="font-semibold">Try it in the simulator: </span>
              {block.slice(mission[0].length)}
            </p>
          );
        }
        return <p key={i} className="whitespace-pre-line">{block}</p>;
      })}
    </>
  );
}
