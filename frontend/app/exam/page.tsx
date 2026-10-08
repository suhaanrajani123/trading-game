"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { EXAM_QUESTIONS } from "@/lib/examData";

type Stage = "intro" | "question" | "results";
const PASS = 70;

export default function ExamPage() {
  const total = EXAM_QUESTIONS.length;
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(total).fill(null));

  const score = answers.reduce<number>((s, a, i) => s + (a === EXAM_QUESTIONS[i].correctIndex ? 1 : 0), 0);
  const percent = Math.round((score / total) * 100);

  function start() {
    setAnswers(Array(total).fill(null));
    setIndex(0);
    setStage("question");
  }

  if (stage === "intro") {
    return (
      <div className="max-w-2xl animate-rise">
        <h1 className="text-[30px] font-semibold">Final exam</h1>
        <p className="mt-2 text-inksoft text-[16.5px] max-w-prose">
          {total} multiple-choice questions covering everything in the lessons. You&apos;ll see whether each answer is right as you go.
          Score {PASS}% or more to pass, and retake it as often as you like.
        </p>
        <button onClick={start} className="btn-primary h-11 mt-6">Start the exam</button>
      </div>
    );
  }

  if (stage === "results") {
    const passed = percent >= PASS;
    const missed = EXAM_QUESTIONS.map((q, i) => ({ q, a: answers[i] })).filter(({ q, a }) => a !== q.correctIndex);
    return (
      <div className="max-w-3xl space-y-6 animate-rise">
        <section className="panel p-7">
          <p className="text-sm text-inksoft">{passed ? "You passed." : `Not yet. You need ${PASS}% to pass.`}</p>
          <p className="num font-display text-[56px] leading-none font-semibold mt-2">
            <span className={passed ? "marker" : undefined}>{percent}%</span>
          </p>
          <p className="mt-3 text-inksoft num">{score} of {total} correct</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={start} className="btn-primary"><RotateCcw size={16} /> Retake the exam</button>
            <Link href="/learn" className="btn-secondary">Review lessons</Link>
          </div>
        </section>

        {missed.length > 0 && (
          <section className="panel">
            <h2 className="panel-title px-6 pt-5">Questions to review</h2>
            <ul className="divide-y divide-line">
              {missed.map(({ q, a }) => (
                <li key={q.id} className="px-6 py-4">
                  <p className="font-medium">{q.question}</p>
                  <p className="mt-1.5 text-sm text-loss flex gap-1.5"><X size={15} className="mt-0.5 shrink-0" /> {a == null ? "No answer" : q.options[a]}</p>
                  <p className="mt-0.5 text-sm text-gain flex gap-1.5"><Check size={15} className="mt-0.5 shrink-0" /> {q.options[q.correctIndex]}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  const q = EXAM_QUESTIONS[index];
  const chosen = answers[index];
  const answered = chosen != null;
  const last = index + 1 >= total;

  return (
    <div className="max-w-2xl animate-rise">
      <div className="flex items-center gap-4">
        <div className="h-2 flex-1 rounded-full bg-surface2 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index + 1} aria-label="Exam progress">
          <div className="h-full bg-primary rounded-full transition-[width] duration-300" style={{ width: `${((index + (answered ? 1 : 0)) / total) * 100}%` }} />
        </div>
        <p className="num text-sm text-inksoft whitespace-nowrap">Question {index + 1} of {total}</p>
      </div>

      <section className="panel p-6 md:p-8 mt-5">
        <h1 className="text-[24px] leading-snug font-semibold">{q.question}</h1>
        <ul className="mt-6 space-y-2.5">
          {q.options.map((opt, i) => {
            const isRight = i === q.correctIndex;
            const isChosen = i === chosen;
            let cls = "border-line hover:border-ink/30 hover:bg-surface2/50";
            if (answered) {
              cls = isRight ? "border-gain bg-gain/10" : isChosen ? "border-loss bg-loss/10" : "border-line opacity-60";
            }
            return (
              <li key={i}>
                <button
                  disabled={answered}
                  onClick={() => setAnswers((prev) => prev.map((a, j) => (j === index ? i : a)))}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-control border transition-colors ${cls}`}
                >
                  <span className="grid place-items-center w-7 h-7 shrink-0 rounded-full border border-line text-[13px] font-semibold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {answered && isRight && <Check size={18} className="text-gain" />}
                  {answered && isChosen && !isRight && <X size={18} className="text-loss" />}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {answered && (
        <div className="mt-5 flex items-center justify-between gap-4" role="status">
          <p className={chosen === q.correctIndex ? "text-gain" : "text-loss"}>
            {chosen === q.correctIndex ? "Correct." : `The answer is ${String.fromCharCode(65 + q.correctIndex)}.`}
          </p>
          <button onClick={() => (last ? setStage("results") : setIndex(index + 1))} className="btn-primary">
            {last ? "See my score" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
}
