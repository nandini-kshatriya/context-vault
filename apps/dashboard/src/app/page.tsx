"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "what matters",
  "preferences",
  "decisions",
  "context",
  "important details",
  "your habits",
  "your information",
];

const STEPS = [
  { key: "add", label: "Add", desc: "Input data in seconds with no config or boilerplate" },
  { key: "learn", label: "Learn", desc: "ContextVault extracts and updates memories" },
  { key: "retrieve", label: "Retrieve", desc: "ContextVault retrieves key memories as users interact" },
];

const STEP_DURATION = 6500; // ms per step, gives scenes room to actually finish typing

function useHeadlineTypewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = PHRASES[phraseIdx];
    const speed = deleting ? 28 : 55;

    const timeout = setTimeout(() => {
      if (!deleting) {
        if (typed.length < current.length) {
          setTyped(current.slice(0, typed.length + 1));
        } else {
          const pause = setTimeout(() => setDeleting(true), 1400);
          return () => clearTimeout(pause);
        }
      } else {
        if (typed.length > 0) {
          setTyped(current.slice(0, typed.length - 1));
        } else {
          setDeleting(false);
          setPhraseIdx((i) => (i + 1) % PHRASES.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [typed, deleting, phraseIdx]);

  return typed;
}

/** Types `text` once `trigger` becomes true. Resets whenever `trigger` flips back to true (new mount). */
function useTypewriter(text: string, trigger: boolean, speed = 20) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!trigger) return;
    let i = 0;
    setTyped("");
    const interval = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [trigger, text, speed]);

  return typed;
}

function AddScene() {
  const message =
    "Remember: I prefer dark roast coffee in the mornings, and I'm on the design team.";
  const typed = useTypewriter(message, true, 18);
  const done = typed.length === message.length;

  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="rounded-2xl bg-[var(--color-text)] p-5 text-[var(--color-bg)] shadow-xl">
        <p className="min-h-[3em] text-sm leading-relaxed">
          &ldquo;{typed}
          <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-0.5 bg-[var(--color-violet)] align-middle" />
          &rdquo;
        </p>
      </div>
      <div
        className={`flex items-center gap-2 text-sm text-[var(--color-violet)] transition-all duration-500 ${
          done ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <span>✓ Memory stored</span>
        <span className="rounded-full bg-[var(--color-violet)]/20 px-2 py-0.5 font-[family-name:var(--font-mono)] text-xs">
          memory_store
        </span>
      </div>
    </div>
  );
}

function LearnScene() {
  const label = "Extracting structured memory…";
  const typedLabel = useTypewriter(label, true, 22);
  const labelDone = typedLabel.length === label.length;

  const chips = [
    ["Preference", "Dark roast coffee"],
    ["Team", "Design"],
    ["Source", "manual"],
  ];

  return (
    <div className="flex flex-col gap-4 p-8">
      <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-muted)]">
        {typedLabel}
        {!labelDone && (
          <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-0.5 bg-[var(--color-violet)] align-middle" />
        )}
      </p>
      <div className="flex flex-col gap-3">
        {chips.map(([key, value], i) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg bg-[var(--color-text)]/95 px-4 py-3 text-[var(--color-bg)] shadow-lg transition-all duration-500"
            style={{
              transitionDelay: `${i * 220}ms`,
              opacity: labelDone ? 1 : 0,
              transform: labelDone ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-violet)]">
              {key}
            </span>
            <span className="text-sm">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RetrieveScene() {
  const question = "What should I know before my first day?";
  const typedQuestion = useTypewriter(question, true, 22);
  const questionDone = typedQuestion.length === question.length;

  const [showChips, setShowChips] = useState(false);
  useEffect(() => {
    if (!questionDone) return;
    const t = setTimeout(() => setShowChips(true), 350);
    return () => clearTimeout(t);
  }, [questionDone]);

  const response =
    "Office hours are 9–6, you're on the design team, and I've noted dark roast coffee for the welcome kit.";
  const typedResponse = useTypewriter(response, showChips, 16);

  const chips = ["Onboarding Guide", "Dark roast coffee", "Design team"];

  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="self-end rounded-2xl bg-[var(--color-violet)] px-4 py-2.5 text-sm text-white shadow-lg">
        {typedQuestion}
      </div>

      <div
        className={`flex flex-wrap gap-2 transition-all duration-500 ${
          showChips ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-[var(--color-text)]/90 px-3 py-1 font-[family-name:var(--font-mono)] text-xs text-[var(--color-bg)]"
          >
            {chip}
          </span>
        ))}
      </div>

      {showChips && (
        <div className="max-w-[90%] rounded-2xl bg-[var(--color-text)] p-4 text-sm leading-relaxed text-[var(--color-bg)] shadow-xl">
          {typedResponse}
          {typedResponse.length < response.length && (
            <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-0.5 bg-[var(--color-violet)] align-middle" />
          )}
        </div>
      )}
    </div>
  );
}

function Scene({ step }: { step: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [step]);

  return (
    <div
      className={`transition-all duration-500 ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {step === 0 && <AddScene />}
      {step === 1 && <LearnScene />}
      {step === 2 && <RetrieveScene />}
    </div>
  );
}

export default function Home() {
  const typed = useHeadlineTypewriter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-violet)] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-violet)]" />
        </span>
        AI memory & context layer
      </div>

            <h1 className="mb-10 min-h-[1.4em] max-w-none whitespace-nowrap font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        Add anything. ContextVault learns{" "}
        <span className="text-[var(--color-violet)]">{typed}</span>
        <span className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-1 animate-pulse bg-[var(--color-violet)]" />
      </h1>

      <div className="flex flex-col gap-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 lg:flex-row">
        <div className="relative flex flex-col gap-14 pl-1 lg:w-64 lg:shrink-0">
          <div className="absolute left-[6px] top-2 bottom-2 w-px bg-[var(--color-border)]" />
          <div
            className="absolute left-[6px] top-2 w-px bg-[var(--color-violet)] transition-all ease-in-out"
            style={{
              height: `${(step / (STEPS.length - 1)) * 100}%`,
              transitionDuration: `${STEP_DURATION * 0.6}ms`,
            }}
          />
          {STEPS.map((s, i) => (
            <div key={s.key} className="relative flex gap-4">
              <span
                className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-all duration-700 ${
                  i <= step
                    ? "border-[var(--color-violet)] bg-[var(--color-violet)] shadow-[0_0_12px_var(--color-violet)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg)]"
                }`}
              />
              <div>
                <div
                  className={`font-[family-name:var(--font-display)] text-lg transition-colors duration-700 ${
                    i === step ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {s.label}
                </div>
                <p
                  className={`mt-1 text-sm transition-colors duration-700 ${
                    i === step ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]/50"
                  }`}
                >
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-violet)]/25 via-[var(--color-surface)] to-[var(--color-bg)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(var(--color-violet) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <Scene key={step} step={step} />
        </div>
      </div>
    </div>
  );
}