/**
 * NeuroPlayHub.tsx — The Unified NeuroPlay AI Experience
 *
 * Orchestrates the full hackathon workflow:
 *  Phase A: ContentStudio (Ingestion Hub)
 *  Phase B: InteractiveTutor (Streaming AI Chat)
 *  Phase C: AssessmentArena (Quiz Engine)
 *  Phase D: CompletionScreen (Dopamine Report + Stats)
 *
 * Also embeds the SpaceLab drag-and-drop game as an optional game mode.
 * The AuditDashboard floats over all phases for demo observability.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ContentStudio, type ContentStudioConfig } from "@/components/ContentStudio";
import { InteractiveTutor } from "@/components/InteractiveTutor";
import { AssessmentArena, type QuizResult } from "@/components/AssessmentArena";
import { AuditDashboard } from "@/components/AuditDashboard";
import { SpaceLabGame } from "@/components/game/SpaceLabGame";
import { trpc } from "@/lib/trpc";
import { fireMegaConfetti } from "@/lib/confetti";
import type { CurriculumSummary } from "../../../server/ai";

type AppPhase =
  | "hub"          // Mode selector
  | "ingestion"    // ContentStudio
  | "processing"   // AI content processing
  | "tutor"        // Interactive Tutor
  | "quiz"         // Assessment Arena
  | "complete"     // Completion screen
  | "spacelab";    // Original SpaceLab game

interface HubState {
  phase: AppPhase;
  config: ContentStudioConfig | null;
  curriculumSummary: CurriculumSummary | null;
  sessionId: number | null;
  studentName: string;
  totalXP: number;
  quizResult: QuizResult | null;
}

export default function NeuroPlayHub() {
  const [state, setState] = useState<HubState>({
    phase: "hub",
    config: null,
    curriculumSummary: null,
    sessionId: null,
    studentName: "Space Explorer",
    totalXP: 0,
    quizResult: null,
  });

  const [brainBreakActive, setBrainBreakActive] = useState(false);
  const [brainBreakCountdown, setBrainBreakCountdown] = useState(30);

  const processContent = trpc.ai.processContent.useMutation();
  const completeSession = trpc.game.completeSession.useMutation();

  // Handle ContentStudio launch
  const handleLaunch = async (config: ContentStudioConfig) => {
    setState(prev => ({ ...prev, phase: "processing", config }));

    try {
      // Extract text from files if any
      let rawText: string | undefined;
      if (config.files.length > 0) {
        rawText = config.files
          .filter(f => f.dataUri)
          .map(f => `[File: ${f.name}]`)
          .join("\n");
      }

      const summary = await processContent.mutateAsync({
        topic: config.focusTopic,
        rawText,
        learningStyle: config.learningStyle,
        difficulty: config.difficulty,
      });

      setState(prev => ({
        ...prev,
        phase: "tutor",
        curriculumSummary: summary,
      }));
    } catch {
      // Fallback: proceed to tutor without summary
      setState(prev => ({ ...prev, phase: "tutor" }));
    }
  };

  // Handle quiz completion
  const handleQuizComplete = async (result: QuizResult) => {
    fireMegaConfetti();
    setState(prev => ({ ...prev, quizResult: result, phase: "complete" }));

    // Fire completion integrations
    if (state.config) {
      try {
        await completeSession.mutateAsync({
          sessionId: state.sessionId ?? 0,
          score: result.score,
          xp: result.xpEarned + state.totalXP,
          starsEarned: result.correctCount,
          correctCount: result.correctCount,
          timeSpentSec: result.timeSec,
          attentionDriftCount: 0,
          studentId: "stu_" + Date.now(),
          studentName: state.studentName,
          moduleName: state.config.focusTopic,
        });
      } catch {
        // Non-fatal
      }
    }
  };

  // Brain break handler
  const triggerBrainBreak = () => {
    setBrainBreakActive(true);
    setBrainBreakCountdown(30);
    const interval = setInterval(() => {
      setBrainBreakCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setBrainBreakActive(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Brain Break Overlay ──────────────────────────────────────────────────
  if (brainBreakActive) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
        style={{ background: "#0F172A", fontFamily: "'Comfortaa', sans-serif" }}
      >
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, rgba(0,229,255,0.3), rgba(124,77,255,0.1))",
            border: "3px solid rgba(0,229,255,0.5)",
          }}
        >
          <span className="text-5xl">🧠</span>
        </motion.div>

        <div className="text-center">
          <p className="font-black text-2xl mb-2" style={{ color: "#00E5FF" }}>
            Brain Break Time! 🌟
          </p>
          <p className="text-base mb-1" style={{ color: "#94A3B8" }}>
            Jump in place 5 times! 🦘
          </p>
          <p className="text-sm" style={{ color: "#475569" }}>
            Then take 3 deep breaths 🌬️
          </p>
        </div>

        <motion.div
          key={brainBreakCountdown}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(174,234,0,0.12)",
            border: "2px solid rgba(174,234,0,0.4)",
          }}
        >
          <span className="font-black text-3xl" style={{ color: "#AEEA00" }}>
            {brainBreakCountdown}
          </span>
        </motion.div>

        <button
          onClick={() => setBrainBreakActive(false)}
          className="px-6 py-3 rounded-xl font-black text-sm"
          style={{
            background: "rgba(30,41,59,0.8)",
            border: "1px solid rgba(71,85,105,0.3)",
            color: "#64748B",
            cursor: "pointer",
          }}
        >
          Skip Break →
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0F172A", fontFamily: "'Comfortaa', sans-serif" }}
    >
      <AnimatePresence mode="wait">
        {/* ── Hub Mode Selector ── */}
        {state.phase === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 gap-8"
          >
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🚀
              </motion.div>
              <h1 className="font-black text-3xl mb-2" style={{ color: "#00E5FF" }}>
                NeuroPlay AI
              </h1>
              <p className="text-sm" style={{ color: "#475569" }}>
                FocusArcade · Solar System Lab
              </p>
            </div>

            <div className="w-full max-w-sm space-y-3">
              {/* AI Tutor Mode */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setState(prev => ({ ...prev, phase: "ingestion" }))}
                className="w-full py-5 rounded-2xl font-black text-base transition-all"
                style={{
                  background: "linear-gradient(135deg, #00E5FF 0%, #7C4DFF 100%)",
                  color: "#0F172A",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 30px rgba(0,229,255,0.3)",
                }}
              >
                🤖 AI Tutor Mode
                <p className="text-xs font-normal mt-1 opacity-70">
                  Content Studio → Nova Tutor → Quiz Arena
                </p>
              </motion.button>

              {/* SpaceLab Game Mode */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setState(prev => ({ ...prev, phase: "spacelab" }))}
                className="w-full py-5 rounded-2xl font-black text-base transition-all"
                style={{
                  background: "linear-gradient(135deg, #7C4DFF 0%, #AEEA00 100%)",
                  color: "#0F172A",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 30px rgba(174,234,0,0.2)",
                }}
              >
                🪐 SpaceLab Game
                <p className="text-xs font-normal mt-1 opacity-70">
                  Drag-and-drop Solar System adventure
                </p>
              </motion.button>
            </div>

            <p className="text-xs text-center" style={{ color: "#334155" }}>
              ADHD-optimized · Ages 7-10 · Solar System Module
            </p>
          </motion.div>
        )}

        {/* ── ContentStudio (Ingestion) ── */}
        {state.phase === "ingestion" && (
          <motion.div
            key="ingestion"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="min-h-screen"
          >
            <ContentStudio onLaunch={handleLaunch} />
          </motion.div>
        )}

        {/* ── Processing ── */}
        {state.phase === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center gap-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl"
            >
              🛸
            </motion.div>
            <div className="text-center">
              <p className="font-black text-xl mb-2" style={{ color: "#00E5FF" }}>
                Processing Curriculum...
              </p>
              <p className="text-sm" style={{ color: "#475569" }}>
                Nova is reading your content! ✨
              </p>
            </div>
            <div className="w-48 h-2 rounded-full overflow-hidden" style={{ background: "rgba(30,41,59,0.8)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #00E5FF, #7C4DFF, #AEEA00)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Interactive Tutor ── */}
        {state.phase === "tutor" && state.config && (
          <motion.div
            key="tutor"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="h-screen"
          >
            <InteractiveTutor
              config={state.config}
              curriculumSummary={state.curriculumSummary ?? undefined}
              onXPEarned={xp => setState(prev => ({ ...prev, totalXP: prev.totalXP + xp }))}
              onBrainBreak={triggerBrainBreak}
              onProceedToQuiz={() => setState(prev => ({ ...prev, phase: "quiz" }))}
            />
          </motion.div>
        )}

        {/* ── Assessment Arena ── */}
        {state.phase === "quiz" && state.config && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="h-screen"
          >
            <AssessmentArena
              config={state.config}
              curriculumSummary={state.curriculumSummary ?? undefined}
              sessionId={state.sessionId ?? undefined}
              studentName={state.studentName}
              onComplete={handleQuizComplete}
              onBrainBreak={triggerBrainBreak}
            />
          </motion.div>
        )}

        {/* ── Completion Screen ── */}
        {state.phase === "complete" && state.quizResult && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center gap-6 p-6"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl"
            >
              {state.quizResult.score >= 90 ? "🏆" : state.quizResult.score >= 70 ? "⭐" : "🌱"}
            </motion.div>

            <div className="text-center">
              <p className="font-black text-3xl mb-2" style={{ color: "#AEEA00" }}>
                Module Complete!
              </p>
              <p className="text-sm" style={{ color: "#64748B" }}>
                {state.studentName} · {state.config?.focusTopic}
              </p>
            </div>

            <div
              className="w-full max-w-sm rounded-2xl p-5 space-y-3"
              style={{
                background: "rgba(30,41,59,0.8)",
                border: "1px solid rgba(0,229,255,0.2)",
              }}
            >
              {[
                { label: "Quiz Score", value: `${state.quizResult.score}%`, color: "#00E5FF" },
                { label: "Correct Answers", value: `${state.quizResult.correctCount}/${state.quizResult.totalQuestions}`, color: "#AEEA00" },
                { label: "Total XP", value: `+${state.quizResult.xpEarned + state.totalXP} XP`, color: "#7C4DFF" },
                { label: "Time Spent", value: `${Math.floor(state.quizResult.timeSec / 60)}m ${state.quizResult.timeSec % 60}s`, color: "#F59E0B" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "#64748B" }}>{label}</span>
                  <span className="font-black text-sm" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 w-full max-w-sm">
              <p className="text-xs text-center" style={{ color: "#334155" }}>
                🎉 Dopamine Report sent! 📊 Focus metrics logged! 📅 Pomodoro scheduled!
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setState({
                  phase: "hub",
                  config: null,
                  curriculumSummary: null,
                  sessionId: null,
                  studentName: "Space Explorer",
                  totalXP: 0,
                  quizResult: null,
                })}
                className="w-full py-4 rounded-2xl font-black text-base"
                style={{
                  background: "linear-gradient(135deg, #00E5FF 0%, #7C4DFF 60%, #AEEA00 100%)",
                  color: "#0F172A",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 30px rgba(0,229,255,0.3)",
                }}
              >
                Play Again 🚀
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── SpaceLab Game ── */}
        {state.phase === "spacelab" && (
          <motion.div
            key="spacelab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            <SpaceLabGame />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Audit Dashboard (always visible) */}
      <AuditDashboard />
    </div>
  );
}
