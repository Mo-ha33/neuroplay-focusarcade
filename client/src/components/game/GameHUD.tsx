import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { PLANETS } from "../../data/planets";

interface GameHUDProps {
  correctCount: number;
  totalXP: number;
  totalStars: number;
  score: number;
  studentName: string;
}

export function GameHUD({ correctCount, totalXP, totalStars, score, studentName }: GameHUDProps) {
  const [prevXP, setPrevXP] = useState(totalXP);
  const [showXPGain, setShowXPGain] = useState(false);
  const [prevScore, setPrevScore] = useState(score);
  const [scoreAnimating, setScoreAnimating] = useState(false);

  const progress = (correctCount / PLANETS.length) * 100;

  useEffect(() => {
    if (totalXP > prevXP) {
      setShowXPGain(true);
      setScoreAnimating(true);
      const t1 = setTimeout(() => setShowXPGain(false), 1200);
      const t2 = setTimeout(() => setScoreAnimating(false), 500);
      setPrevXP(totalXP);
      setPrevScore(score);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [totalXP]);

  return (
    <div
      className="w-full px-4 py-3 flex flex-col gap-2"
      style={{
        background: "rgba(15, 23, 42, 0.95)",
        borderBottom: "1px solid rgba(0, 229, 255, 0.15)",
      }}
    >
      {/* Top row: name + stats */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span
          className="text-sm font-bold truncate max-w-[120px]"
          style={{ fontFamily: "'Comfortaa', sans-serif", color: "#64748B" }}
        >
          👨‍🚀 {studentName}
        </span>

        <div className="flex items-center gap-3">
          {/* Stars */}
          <div className="flex items-center gap-1">
            <span className="text-lg">⭐</span>
            <motion.span
              key={totalStars}
              animate={totalStars > 0 ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="text-base font-black"
              style={{ fontFamily: "'Poppins', sans-serif", color: "#FFD700" }}
            >
              {totalStars}
            </motion.span>
          </div>

          {/* XP */}
          <div className="relative flex items-center gap-1">
            <span className="text-lg">⚡</span>
            <motion.span
              key={totalXP}
              className="text-base font-black"
              style={{ fontFamily: "'Poppins', sans-serif", color: "#00E5FF" }}
            >
              {totalXP}
            </motion.span>
            <AnimatePresence>
              {showXPGain && (
                <motion.span
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: -40, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute -top-1 left-0 text-sm font-black pointer-events-none"
                  style={{ fontFamily: "'Poppins', sans-serif", color: "#AEEA00" }}
                >
                  +100
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Score */}
          <div
            className="px-3 py-1 rounded-full flex items-center gap-1"
            style={{
              background: "rgba(174, 234, 0, 0.1)",
              border: "1px solid rgba(174, 234, 0, 0.3)",
            }}
          >
            <motion.span
              key={score}
              animate={scoreAnimating ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="text-sm font-black"
              style={{ fontFamily: "'Poppins', sans-serif", color: "#AEEA00" }}
            >
              🏆 {score}
            </motion.span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-bold whitespace-nowrap"
          style={{ fontFamily: "'Comfortaa', sans-serif", color: "#64748B" }}
        >
          {correctCount}/{PLANETS.length} planets
        </span>
        <div
          className="flex-1 h-3 rounded-full overflow-hidden"
          style={{ background: "rgba(30, 41, 59, 0.8)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #7C4DFF, #00E5FF, #AEEA00)",
              boxShadow: "0 0 10px rgba(0, 229, 255, 0.5)",
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
        <span className="text-xs font-bold" style={{ color: "#AEEA00", fontFamily: "'Poppins', sans-serif" }}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
