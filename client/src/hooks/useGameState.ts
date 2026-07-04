import { useState, useCallback, useRef, useEffect } from "react";
import {
  PLANETS,
  Planet,
  XP_PER_CORRECT,
  STARS_PER_CORRECT,
  BRAIN_BREAK_INTERVAL,
} from "../data/planets";
import { trpc } from "../lib/trpc";

export type GamePhase =
  | "welcome"
  | "playing"
  | "brain_break"
  | "level_up"
  | "completed";

export interface PlacedPlanet {
  planetId: string;
  orbitSlot: number;
  correct: boolean;
}

export interface GameState {
  phase: GamePhase;
  sessionId: number | null;
  studentName: string;
  currentPlanetIndex: number; // which planet we're currently placing
  currentClueIndex: number;   // which clue is showing for the current planet
  placedPlanets: PlacedPlanet[];
  wrongSlot: number | null;   // orbit slot that was incorrectly targeted
  correctCount: number;
  totalXP: number;
  totalStars: number;
  score: number;
  startTime: number | null;
  brainBreakAfterCorrect: number; // how many correct before the break triggered
  levelUpTriggered: boolean;
  shuffledPlanets: Planet[];
}

const shuffleArray = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function useGameState() {
  const createSession = trpc.game.createSession.useMutation();
  const recordAttempt = trpc.game.recordAttempt.useMutation();
  const completeSession = trpc.game.completeSession.useMutation();

  const [state, setState] = useState<GameState>({
    phase: "welcome",
    sessionId: null,
    studentName: "Space Explorer",
    currentPlanetIndex: 0,
    currentClueIndex: 0,
    placedPlanets: [],
    wrongSlot: null,
    correctCount: 0,
    totalXP: 0,
    totalStars: 0,
    score: 0,
    startTime: null,
    brainBreakAfterCorrect: 0,
    levelUpTriggered: false,
    shuffledPlanets: shuffleArray(PLANETS),
  });

  const attemptCountRef = useRef<Record<string, number>>({});

  // Start the game
  const startGame = useCallback(async (studentName = "Space Explorer") => {
    const studentId = `student_${Date.now()}`;
    let sessionId: number | null = null;
    try {
      const result = await createSession.mutateAsync({ studentId, studentName });
      sessionId = result.sessionId;
    } catch {
      // offline fallback
      sessionId = Date.now();
    }
    setState(prev => ({
      ...prev,
      phase: "playing",
      sessionId,
      studentName,
      currentPlanetIndex: 0,
      currentClueIndex: 0,
      placedPlanets: [],
      wrongSlot: null,
      correctCount: 0,
      totalXP: 0,
      totalStars: 0,
      score: 0,
      startTime: Date.now(),
      brainBreakAfterCorrect: 0,
      levelUpTriggered: false,
      shuffledPlanets: shuffleArray(PLANETS),
    }));
    attemptCountRef.current = {};
  }, [createSession]);

  // Advance to next clue for current planet
  const nextClue = useCallback(() => {
    setState(prev => {
      const planet = prev.shuffledPlanets[prev.currentPlanetIndex];
      if (!planet) return prev;
      const maxClue = planet.clues.length - 1;
      return {
        ...prev,
        currentClueIndex: Math.min(prev.currentClueIndex + 1, maxClue),
      };
    });
  }, []);

  // Handle a planet drop onto an orbit slot
  const handleDrop = useCallback(
    async (planetId: string, targetOrbitSlot: number) => {
      setState(prev => {
        const planet = PLANETS.find(p => p.id === planetId);
        if (!planet) return prev;

        const isCorrect = planet.orbitOrder === targetOrbitSlot;
        const attemptNum = (attemptCountRef.current[planetId] || 0) + 1;
        attemptCountRef.current[planetId] = attemptNum;

        if (!isCorrect) {
          return { ...prev, wrongSlot: targetOrbitSlot };
        }

        // Correct placement
        const newCorrectCount = prev.correctCount + 1;
        const newXP = prev.totalXP + XP_PER_CORRECT;
        const newStars = prev.totalStars + STARS_PER_CORRECT;
        const newScore = prev.score + Math.max(100, 200 - (attemptNum - 1) * 50);
        const newPlaced = [
          ...prev.placedPlanets,
          { planetId, orbitSlot: targetOrbitSlot, correct: true },
        ];

        // Find next unplaced planet index
        const placedIds = new Set(newPlaced.map(p => p.planetId));
        const nextIdx = prev.shuffledPlanets.findIndex(p => !placedIds.has(p.id));

        // Check if all placed
        if (newPlaced.length === PLANETS.length) {
          return {
            ...prev,
            placedPlanets: newPlaced,
            correctCount: newCorrectCount,
            totalXP: newXP,
            totalStars: newStars,
            score: newScore,
            wrongSlot: null,
            phase: "completed",
            currentPlanetIndex: nextIdx >= 0 ? nextIdx : prev.currentPlanetIndex,
            currentClueIndex: 0,
          };
        }

        // Check if brain break needed
        const needsBrainBreak =
          newCorrectCount % BRAIN_BREAK_INTERVAL === 0 &&
          newCorrectCount > 0 &&
          newPlaced.length < PLANETS.length;

        // Check level up (at 4 correct = halfway)
        const justHitLevelUp = newCorrectCount === 4 && prev.correctCount < 4;

        return {
          ...prev,
          placedPlanets: newPlaced,
          correctCount: newCorrectCount,
          totalXP: newXP,
          totalStars: newStars,
          score: newScore,
          wrongSlot: null,
          currentPlanetIndex: nextIdx >= 0 ? nextIdx : prev.currentPlanetIndex,
          currentClueIndex: 0,
          phase: needsBrainBreak ? "brain_break" : justHitLevelUp ? "level_up" : "playing",
          brainBreakAfterCorrect: needsBrainBreak ? newCorrectCount : prev.brainBreakAfterCorrect,
          levelUpTriggered: justHitLevelUp,
        };
      });

      // Fire-and-forget server record
      const planet = PLANETS.find(p => p.id === planetId);
      if (planet && state.sessionId) {
        try {
          await recordAttempt.mutateAsync({
            sessionId: state.sessionId,
            planetName: planet.name.en, // server stores canonical English name
            correct: planet.orbitOrder === targetOrbitSlot,
            attemptNumber: (attemptCountRef.current[planetId] || 1),
          });
        } catch {
          // offline — ignore
        }
      }
    },
    [state.sessionId, recordAttempt]
  );

  // Clear wrong slot highlight
  const clearWrongSlot = useCallback(() => {
    setState(prev => ({ ...prev, wrongSlot: null }));
  }, []);

  // Resume from brain break
  const resumeFromBreak = useCallback(() => {
    setState(prev => ({ ...prev, phase: "playing" }));
  }, []);

  // Resume from level up
  const resumeFromLevelUp = useCallback(() => {
    setState(prev => ({ ...prev, phase: "playing", levelUpTriggered: false }));
  }, []);

  // Complete the session and save to DB
  const finalizeSession = useCallback(async (studentName = "Space Explorer") => {
    if (!state.sessionId || !state.startTime) return;
    const timeSpent = Math.floor((Date.now() - state.startTime) / 1000);
    const studentId = `student_${state.sessionId}`;
    try {
      await completeSession.mutateAsync({
        sessionId: state.sessionId,
        studentId,
        studentName,
        score: state.score,
        xp: state.totalXP,
        starsEarned: state.totalStars,
        correctCount: state.correctCount,
        timeSpentSec: timeSpent,
        attentionDriftCount: 0,
      });
    } catch {
      // offline — ignore
    }
  }, [state, completeSession]);

  // Auto-finalize when game completes
  useEffect(() => {
    if (state.phase === "completed") {
      finalizeSession(state.studentName);
    }
  }, [state.phase]);

  // Restart the game
  const restartGame = useCallback(() => {
    attemptCountRef.current = {};
    setState({
      phase: "welcome",
      sessionId: null,
      studentName: "Space Explorer",
      currentPlanetIndex: 0,
      currentClueIndex: 0,
      placedPlanets: [],
      wrongSlot: null,
      correctCount: 0,
      totalXP: 0,
      totalStars: 0,
      score: 0,
      startTime: null,
      brainBreakAfterCorrect: 0,
      levelUpTriggered: false,
      shuffledPlanets: shuffleArray(PLANETS),
    });
  }, []);

  return {
    state,
    startGame,
    nextClue,
    handleDrop,
    clearWrongSlot,
    resumeFromBreak,
    resumeFromLevelUp,
    restartGame,
    isLoading: createSession.isPending,
  };
}
