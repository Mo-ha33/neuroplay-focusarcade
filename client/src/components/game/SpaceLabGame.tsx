import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "../../hooks/useGameState";
import { useIngestionConfig } from "../../hooks/useIngestionConfig";
import { ContentStudio } from "../ContentStudio";
import { WelcomeScreen } from "./WelcomeScreen";
import { ClueCard } from "./ClueCard";
import { BrainBreak } from "./BrainBreak";
import { LevelUpScreen } from "./LevelUpScreen";
import { CompletionScreen } from "./CompletionScreen";
import { GameHUD } from "./GameHUD";
import { OrbitSlot } from "./OrbitSlot";
import { PlanetToken } from "./PlanetToken";
import { PLANETS } from "../../data/planets";
import { fireConfetti, fireStarBurst } from "../../lib/confetti";

export function SpaceLabGame() {
  // ── Phase A: Ingestion Hub state ──────────────────────────────────────────
  const { ingestionState, submitConfig, resetIngestion } = useIngestionConfig();

  // ── Existing game state (untouched) ──────────────────────────────────────
  const {
    state,
    startGame,
    nextClue,
    handleDrop,
    clearWrongSlot,
    resumeFromBreak,
    resumeFromLevelUp,
    restartGame,
    isLoading,
  } = useGameState();

  const [studentName, setStudentName] = useState("Space Explorer");
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  // Mobile: tap-to-select then tap-orbit
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const orbitSlotRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleStart = useCallback(async (name: string) => {
    setStudentName(name);
    await startGame(name);
  }, [startGame]);

  const triggerCorrectFeedback = useCallback((slotEl?: HTMLDivElement | null) => {
    setShowCorrectFlash(true);
    setTimeout(() => setShowCorrectFlash(false), 600);
    fireConfetti();
    if (slotEl) {
      const rect = slotEl.getBoundingClientRect();
      fireStarBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  }, []);

  const handleDropWithFeedback = useCallback(
    async (planetId: string, orbitSlot: number) => {
      const planet = PLANETS.find(p => p.id === planetId);
      const isCorrect = planet?.orbitOrder === orbitSlot;
      if (isCorrect) {
        triggerCorrectFeedback(orbitSlotRefs.current[orbitSlot]);
      }
      await handleDrop(planetId, orbitSlot);
      setSelectedPlanetId(null);
    },
    [handleDrop, triggerCorrectFeedback]
  );

  // Tap-to-select: tap planet token to select, then tap orbit slot to place
  const handlePlanetTap = useCallback((planetId: string) => {
    setSelectedPlanetId(prev => prev === planetId ? null : planetId);
  }, []);

  const handleOrbitTap = useCallback((orbitSlot: number) => {
    if (selectedPlanetId) {
      handleDropWithFeedback(selectedPlanetId, orbitSlot);
    }
  }, [selectedPlanetId, handleDropWithFeedback]);

  // ── Phase A gate: show ContentStudio before anything else ─────────────────
  if (ingestionState.phase === "ingestion") {
    return <ContentStudio onLaunch={submitConfig} />;
  }

  // ── Existing phase routing (completely unchanged) ─────────────────────────
  if (state.phase === "welcome") {
    return <WelcomeScreen onStart={handleStart} isLoading={isLoading} />;
  }

  if (state.phase === "completed") {
    return (
      <CompletionScreen
        studentName={studentName}
        totalStars={state.totalStars}
        totalXP={state.totalXP}
        score={state.score}
        timeSpentSec={
          state.startTime
            ? Math.floor((Date.now() - state.startTime) / 1000)
            : 0
        }
        onPlayAgain={() => {
          restartGame();
          // Optionally return to ingestion for a new curriculum:
          // resetIngestion();
        }}
      />
    );
  }

  const currentPlanet = state.shuffledPlanets[state.currentPlanetIndex];
  const placedPlanetIds = new Set(state.placedPlanets.map(p => p.planetId));
  const attemptCounts: Record<string, number> = {};

  const timeSpentSec = state.startTime
    ? Math.floor((Date.now() - state.startTime) / 1000)
    : 0;

  return (
    <div
      className="min-h-screen flex flex-col star-field"
      style={{ background: "#0F172A", position: "relative" }}
    >
      {/* Correct answer flash overlay */}
      <AnimatePresence>
        {showCorrectFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
              background: "radial-gradient(circle at center, rgba(174, 234, 0, 0.15) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Brain Break overlay */}
      <AnimatePresence>
        {state.phase === "brain_break" && (
          <BrainBreak
            onResume={resumeFromBreak}
            correctCount={state.correctCount}
          />
        )}
      </AnimatePresence>

      {/* Level Up overlay */}
      <AnimatePresence>
        {state.phase === "level_up" && (
          <LevelUpScreen
            onContinue={resumeFromLevelUp}
            correctCount={state.correctCount}
            totalXP={state.totalXP}
          />
        )}
      </AnimatePresence>

      {/* HUD */}
      <GameHUD
        correctCount={state.correctCount}
        totalXP={state.totalXP}
        totalStars={state.totalStars}
        score={state.score}
        studentName={studentName}
      />

      {/* Mobile tap hint */}
      {selectedPlanetId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-2 text-sm font-bold"
          style={{
            fontFamily: "'Comfortaa', sans-serif",
            color: "#AEEA00",
            background: "rgba(174, 234, 0, 0.08)",
            borderBottom: "1px solid rgba(174, 234, 0, 0.2)",
          }}
        >
          ✨ Now tap an orbit slot to place{" "}
          {PLANETS.find(p => p.id === selectedPlanetId)?.name}!
        </motion.div>
      )}

      {/* Main game area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-6xl mx-auto w-full">

        {/* Left: Clue card */}
        <div className="lg:w-72 flex flex-col gap-4">
          {currentPlanet && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPlanet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35 }}
              >
                <ClueCard
                  planet={currentPlanet}
                  clueIndex={state.currentClueIndex}
                  onNextClue={nextClue}
                  attemptCount={attemptCounts[currentPlanet.id] || 1}
                />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Mission progress text */}
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: "rgba(30, 41, 59, 0.7)",
              border: "1px solid rgba(0, 229, 255, 0.15)",
            }}
          >
            <p
              className="text-sm font-bold"
              style={{ fontFamily: "'Comfortaa', sans-serif", color: "#94A3B8" }}
            >
              {state.correctCount === 0
                ? "Drag the planet to its orbit! 🚀"
                : state.correctCount < 4
                ? `Great job! ${8 - state.correctCount} more to go! ⭐`
                : state.correctCount < 7
                ? `Amazing! Almost there! 🌟`
                : `One more planet! You've got this! 🏆`}
            </p>
          </div>
        </div>

        {/* Center: Solar System board */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {/* Sun */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{
                background: "radial-gradient(circle, #FFD700, #FF8C00)",
                boxShadow: "0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 140, 0, 0.3)",
              }}
            >
              ☀️
            </div>
            <span
              className="text-xs font-bold"
              style={{ fontFamily: "'Comfortaa', sans-serif", color: "#FFD700" }}
            >
              The Sun
            </span>
          </motion.div>

          {/* Orbit slots grid */}
          <div className="w-full">
            <p
              className="text-center text-xs font-bold mb-3"
              style={{ fontFamily: "'Comfortaa', sans-serif", color: "#475569" }}
            >
              ← Closest to Sun · · · · · · · Farthest from Sun →
            </p>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {PLANETS.map(planet => {
                const placed = state.placedPlanets.find(p => p.orbitSlot === planet.orbitOrder);
                return (
                  <div
                    key={planet.orbitOrder}
                    ref={el => { orbitSlotRefs.current[planet.orbitOrder] = el; }}
                    onClick={() => !placed && handleOrbitTap(planet.orbitOrder)}
                    style={{ cursor: selectedPlanetId && !placed ? "pointer" : "default" }}
                  >
                    <OrbitSlot
                      orbitOrder={planet.orbitOrder}
                      isOccupied={!!placed}
                      occupiedByPlanetId={placed?.planetId}
                      isWrong={state.wrongSlot === planet.orbitOrder}
                      isHighlighted={!!selectedPlanetId && !placed}
                      onDrop={(planetId, slot) => handleDropWithFeedback(planetId, slot)}
                      onWrongClear={clearWrongSlot}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Placed planets summary */}
          <div
            className="w-full rounded-2xl p-3"
            style={{
              background: "rgba(30, 41, 59, 0.5)",
              border: "1px solid rgba(71, 85, 105, 0.3)",
            }}
          >
            <p
              className="text-xs font-bold text-center mb-2"
              style={{ fontFamily: "'Comfortaa', sans-serif", color: "#475569" }}
            >
              Planets placed correctly:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {state.placedPlanets.map(placed => {
                const p = PLANETS.find(pl => pl.id === placed.planetId);
                return p ? (
                  <motion.span
                    key={placed.planetId}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: `${p.color}20`,
                      border: `1px solid ${p.color}60`,
                      color: p.color,
                      fontFamily: "'Comfortaa', sans-serif",
                    }}
                  >
                    ✓ {p.name}
                  </motion.span>
                ) : null;
              })}
              {state.placedPlanets.length === 0 && (
                <span
                  className="text-xs"
                  style={{ color: "#334155", fontFamily: "'Comfortaa', sans-serif" }}
                >
                  None yet — start dragging! 🪐
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Planet tray */}
        <div className="lg:w-64 flex flex-col gap-3">
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(30, 41, 59, 0.8)",
              border: "1px solid rgba(124, 77, 255, 0.2)",
            }}
          >
            <p
              className="text-sm font-bold text-center mb-4"
              style={{ fontFamily: "'Comfortaa', sans-serif", color: "#7C4DFF" }}
            >
              🪐 Planet Tray
            </p>
            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-2 lg:overflow-visible">
              {state.shuffledPlanets.map(planet => (
                <div
                  key={planet.id}
                  onClick={() => !placedPlanetIds.has(planet.id) && handlePlanetTap(planet.id)}
                  style={{ flexShrink: 0 }}
                >
                  <PlanetToken
                    planet={planet}
                    isActive={currentPlanet?.id === planet.id || selectedPlanetId === planet.id}
                    isPlaced={placedPlanetIds.has(planet.id)}
                    isSelected={selectedPlanetId === planet.id}
                    onDragStart={id => setSelectedPlanetId(id)}
                    onDragEnd={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Hint */}
          <div
            className="rounded-2xl p-3 text-center"
            style={{
              background: "rgba(0, 229, 255, 0.05)",
              border: "1px solid rgba(0, 229, 255, 0.15)",
            }}
          >
            <p
              className="text-xs font-bold"
              style={{ fontFamily: "'Comfortaa', sans-serif", color: "#00E5FF" }}
            >
              💡 Drag to orbit slot, or tap planet then tap slot!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
