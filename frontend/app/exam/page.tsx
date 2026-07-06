"use client";
import { useState, useCallback } from "react";
import { EXAM_QUESTIONS, ExamQuestion } from "@/lib/examData";
import { CheckCircle2, XCircle, RotateCcw, ChevronRight, Trophy, ClipboardCheck } from "lucide-react";

type ExamState = "intro" | "in-progress" | "results";

export default function ExamPage() {
  const [state, setState] = useState<ExamState>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(EXAM_QUESTIONS.length).fill(null)
  );
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQ = EXAM_QUESTIONS[currentIndex];
  const totalQuestions = EXAM_QUESTIONS.length;

  const score = selectedAnswers.reduce((sum, ans, i) => {
    return sum + (ans === EXAM_QUESTIONS[i].correctIndex ? 1 : 0);
  }, 0);

  const percentage = Math.round((score / totalQuestions) * 100);

  function startExam() {
    setSelectedAnswers(new Array(totalQuestions).fill(null));
    setCurrentIndex(0);
    setShowFeedback(false);
    setState("in-progress");
  }

  function selectAnswer(optionIndex: number) {
    if (showFeedback) return; // already answered
    const updated = [...selectedAnswers];
    updated[currentIndex] = optionIndex;
    setSelectedAnswers(updated);
    setShowFeedback(true);
  }

  function nextQuestion() {
    setShowFeedback(false);
    if (currentIndex + 1 >= totalQuestions) {
      setState("results");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function getGrade(): { label: string; color: string; emoji: string } {
    if (percentage >= 90) return { label: "A+", color: "text-gain", emoji: "🏆" };
    if (percentage >= 80) return { label: "A", color: "text-gain", emoji: "🌟" };
    if (percentage >= 70) return { label: "B", color: "text-brand", emoji: "👍" };
    if (percentage >= 60) return { label: "C", color: "text-xp", emoji: "📝" };
    return { label: "F", color: "text-loss", emoji: "📖" };
  }

  // --- INTRO ---
  if (state === "intro") {
    return (
      <div className="max-w-2xl mx-auto animate-fade-up">
        <div className="glass rounded-2xl shadow-glass p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand2 flex items-center justify-center mx-auto mb-5">
            <ClipboardCheck size={28} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Knowledge Exam</h1>
          <p className="text-muted text-sm mb-6 max-w-md mx-auto">
            Test your understanding of the stock market with {totalQuestions} multiple-choice questions.
            You can retake the exam as many times as you want!
          </p>
          <div className="glass rounded-xl p-4 mb-6 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Questions</span>
              <span className="font-mono text-text">{totalQuestions}</span>
            </div>
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Passing grade</span>
              <span className="font-mono text-text">70%</span>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Retries</span>
              <span className="font-mono text-gain">Unlimited</span>
            </div>
          </div>
          <button
            onClick={startExam}
            className="px-8 py-3 rounded-xl bg-gradient-to-br from-brand to-brand2 text-white font-medium text-sm shadow-glow hover:opacity-90 transition-opacity"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  // --- RESULTS ---
  if (state === "results") {
    const grade = getGrade();
    const passed = percentage >= 70;
    return (
      <div className="max-w-2xl mx-auto animate-fade-up">
        <div className="glass rounded-2xl shadow-glass p-8 text-center mb-6">
          <div className="text-5xl mb-4">{grade.emoji}</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Exam Complete!</h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className={`font-mono text-5xl font-bold ${grade.color}`}>{grade.label}</span>
          </div>
          <p className="text-muted text-sm mb-2">
            You scored <span className="text-text font-semibold">{score}</span> out of <span className="text-text font-semibold">{totalQuestions}</span> ({percentage}%)
          </p>
          <p className={`text-sm font-medium ${passed ? "text-gain" : "text-loss"}`}>
            {passed ? "You passed! Great job!" : "Keep studying and try again!"}
          </p>

          <div className="mt-6">
            <button
              onClick={startExam}
              className="px-6 py-3 rounded-xl bg-gradient-to-br from-brand to-brand2 text-white font-medium text-sm shadow-glow hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Retake Exam
            </button>
          </div>
        </div>

        {/* Review answers */}
        <div className="glass rounded-2xl shadow-glass p-5">
          <h3 className="font-display font-semibold text-sm mb-4 uppercase tracking-wider text-muted">Answer Review</h3>
          <div className="space-y-3">
            {EXAM_QUESTIONS.map((q, i) => {
              const userAns = selectedAnswers[i];
              const correct = userAns === q.correctIndex;
              return (
                <div key={q.id} className={`glass rounded-xl p-4 border-l-4 ${correct ? "border-gain" : "border-loss"}`}>
                  <p className="text-sm font-medium mb-1">
                    <span className="text-muted font-mono mr-1.5">Q{q.id}.</span> {q.question}
                  </p>
                  <p className={`text-xs ${correct ? "text-gain" : "text-loss"}`}>
                    {correct
                      ? `✓ ${q.options[q.correctIndex]}`
                      : `✗ Your answer: "${userAns !== null ? q.options[userAns] : "No answer"}" — Correct: "${q.options[q.correctIndex]}"`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- IN PROGRESS ---
  const isCorrect = selectedAnswers[currentIndex] === currentQ.correctIndex;

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted font-mono">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-xs text-muted font-mono">
            {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 glass rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand to-brand2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="glass rounded-2xl shadow-glass p-6 mb-4">
        <p className="text-xs font-mono text-muted mb-3">Question {currentQ.id}</p>
        <h2 className="font-display font-semibold text-xl mb-6">{currentQ.question}</h2>

        <div className="space-y-3">
          {currentQ.options.map((opt, i) => {
            const selected = selectedAnswers[currentIndex] === i;
            const isCorrectOption = i === currentQ.correctIndex;

            let optClass = "glass glass-hover";
            if (showFeedback) {
              if (isCorrectOption) {
                optClass = "bg-gain/10 border-gain/50 border";
              } else if (selected && !isCorrectOption) {
                optClass = "bg-loss/10 border-loss/50 border";
              } else {
                optClass = "glass opacity-50";
              }
            } else if (selected) {
              optClass = "glass border border-brand";
            }

            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                disabled={showFeedback}
                className={`w-full text-left px-5 py-3.5 rounded-xl text-sm transition-all flex items-center gap-3 ${optClass}`}
              >
                <span className="w-7 h-7 shrink-0 rounded-full glass flex items-center justify-center font-mono text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {showFeedback && isCorrectOption && (
                  <CheckCircle2 size={18} className="text-gain shrink-0" />
                )}
                {showFeedback && selected && !isCorrectOption && (
                  <XCircle size={18} className="text-loss shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback + Next */}
      {showFeedback && (
        <div className="flex items-center justify-between animate-fade-up">
          <p className={`text-sm font-medium ${isCorrect ? "text-gain" : "text-loss"}`}>
            {isCorrect ? "Correct! 🎉" : "Not quite — review the answer above."}
          </p>
          <button
            onClick={nextQuestion}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand to-brand2 text-white text-sm font-medium shadow-glow hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
          >
            {currentIndex + 1 >= totalQuestions ? "See Results" : "Next"}
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
