import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Planet } from "../../data/planets";
import { AudioReadButton } from "./AudioReadButton";
import { GalacticFactPanel } from "./GalacticFactPanel";

interface ClueCardProps {
  planet: Planet;
  clueIndex: number;
  onNextClue: () => void;
  attemptCount: number;
}

export function ClueCard({ planet, clueIndex, onNextClue, attemptCount }: ClueCardProps) {
  const currentClue = planet.clues[clueIndex];
  const hasMoreClues = clueIndex < planet.clues.length - 1;
  const clueNumber = clueIndex + 1;
  const totalClues = planet.clues.length;
  const isLastClue = clueIndex === planet.clues.length - 1;
  const [showFact, setShowFact] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-sm mx-auto flex flex-col gap-3"
    >
      <div
        className="rounded-3xl p-6 flex flex-col gap-4"
        style={{
          background: "rgba(30, 41, 59, 0.95)",
          border: "2px solid rgba(124, 77, 255, 0.4)",
          boxShadow: "0 0 40px rgba(124, 77, 255, 0.15)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{
              fontFamily: "'Comfortaa', sans-serif",
              background: "rgba(124, 77, 255, 0.2)",
              color: "#7C4DFF",
              border: "1px solid rgba(124, 77, 255, 0.4)",
            }}
          >
            Clue {clueNumber} of {totalClues}
          </span>
          {attemptCount > 1 && (
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                fontFamily: "'Comfortaa', sans-serif",
                background: "rgba(255, 100, 100, 0.15)",
                color: "#FF6B6B",
                border: "1px solid rgba(255, 100, 100, 0.3)",
              }}
            >
              Try #{attemptCount}
            </span>
          )}
        </div>

        {/* Planet visual */}
        <div className="flex justify-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
            style={{
              background: planet.bgGradient,
              boxShadow: `0 0 30px ${planet.glowColor}, 0 0 60px ${planet.glowColor.replace("0.6", "0.2")}`,
            }}
          >
            {planet.id === "saturn" ? "🪐" :
             planet.id === "earth" ? "🌍" :
             planet.id === "mars" ? "🔴" :
             planet.id === "jupiter" ? "🟠" :
             planet.id === "uranus" ? "🔵" :
             planet.id === "neptune" ? "💙" :
             planet.id === "venus" ? "🟡" : "⚫"}
          </motion.div>
        </div>

        {/* Clue text — ONE at a time */}
        <AnimatePresence mode="wait">
          <motion.div
            key={clueIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-3"
          >
            <p
              className="text-xl font-bold leading-relaxed text-center"
              style={{
                fontFamily: "'Comfortaa', sans-serif",
                color: "#E2E8F0",
                lineHeight: "1.5",
              }}
            >
              {currentClue}
            </p>
            {/* 🔊 TTS Audio Read Button — accessibility for neurodivergent learners */}
            <AudioReadButton text={currentClue} label="Listen to Clue" size="sm" />
          </motion.div>
        </AnimatePresence>

        {/* Clue dots indicator */}
        <div className="flex justify-center gap-2">
          {planet.clues.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === clueIndex ? "20px" : "8px",
                height: "8px",
                background: i <= clueIndex ? "#7C4DFF" : "rgba(124, 77, 255, 0.2)",
              }}
            />
          ))}
        </div>

        {/* Next clue button */}
        {hasMoreClues && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNextClue}
            className="w-full py-3 rounded-2xl font-bold text-sm transition-all duration-200"
            style={{
              fontFamily: "'Comfortaa', sans-serif",
              background: "rgba(124, 77, 255, 0.15)",
              border: "1.5px solid rgba(124, 77, 255, 0.5)",
              color: "#7C4DFF",
            }}
          >
            Next Clue 💡
          </motion.button>
        )}

        {/* 📡 Galactic Fact reveal — only on last clue */}
        {isLastClue && !showFact && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFact(true)}
            className="w-full py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              fontFamily: "'Comfortaa', sans-serif",
              background: "rgba(0, 229, 255, 0.08)",
              border: "1.5px solid rgba(0, 229, 255, 0.3)",
              color: "#00E5FF",
            }}
          >
            <span>📡</span>
            <span>Galactic Fact</span>
          </motion.button>
        )}

        {/* Drag instruction */}
        <p
          className="text-center text-xs font-semibold"
          style={{
            fontFamily: "'Comfortaa', sans-serif",
            color: "#64748B",
          }}
        >
          Drag me to the right orbit! ☝️
        </p>
      </div>

      {/* 📡 Galactic Fact Panel (Solar System Open API) */}
      <AnimatePresence>
        {showFact && (
          <GalacticFactPanel
            planet={planet}
            onDismiss={() => setShowFact(false)}
            overlay={false}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
