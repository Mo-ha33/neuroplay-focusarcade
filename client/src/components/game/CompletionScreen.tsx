import { useEffect } from "react";
import { motion } from "framer-motion";
import { fireMegaConfetti } from "../../lib/confetti";
import { PLANETS } from "../../data/planets";

interface CompletionScreenProps {
  studentName: string;
  totalStars: number;
  totalXP: number;
  score: number;
  timeSpentSec: number;
  onPlayAgain: () => void;
}

export function CompletionScreen({
  studentName,
  totalStars,
  totalXP,
  score,
  timeSpentSec,
  onPlayAgain,
}: CompletionScreenProps) {
  useEffect(() => {
    fireMegaConfetti();
  }, []);

  const minutes = Math.floor(timeSpentSec / 60);
  const seconds = timeSpentSec % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div
      className="min-h-screen star-field flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ background: "#0F172A" }}
    >
      {/* Animated stars background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1 + "px",
              height: Math.random() * 4 + 1 + "px",
              backgroundColor: ["#00E5FF", "#7C4DFF", "#AEEA00", "#FFD700"][Math.floor(Math.random() * 4)],
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col items-center gap-6 max-w-md w-full z-10 text-center"
      >
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 12 }}
          className="text-8xl"
        >
          🏆
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h1
            className="text-4xl font-black mb-2"
            style={{
              fontFamily: "'Poppins', sans-serif",
              color: "#AEEA00",
              textShadow: "0 0 30px rgba(174, 234, 0, 0.7)",
            }}
          >
            Mission Complete! 🎉
          </h1>
          <p
            className="text-xl font-bold"
            style={{ fontFamily: "'Comfortaa', sans-serif", color: "#E2E8F0" }}
          >
            Amazing work, {studentName}!
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full grid grid-cols-2 gap-3"
        >
          {[
            { label: "Stars Earned", value: `⭐ ${totalStars}`, color: "#FFD700" },
            { label: "Total XP", value: `⚡ ${totalXP}`, color: "#00E5FF" },
            { label: "Final Score", value: `🏆 ${score}`, color: "#AEEA00" },
            { label: "Time", value: `⏱️ ${timeStr}`, color: "#7C4DFF" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="rounded-2xl p-4 text-center"
              style={{
                background: "rgba(30, 41, 59, 0.9)",
                border: `2px solid ${stat.color}40`,
                boxShadow: `0 0 20px ${stat.color}20`,
              }}
            >
              <div
                className="text-2xl font-black mb-1"
                style={{ fontFamily: "'Poppins', sans-serif", color: stat.color }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs font-bold"
                style={{ fontFamily: "'Comfortaa', sans-serif", color: "#64748B" }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* All planets placed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex gap-2 flex-wrap justify-center"
        >
          {PLANETS.map((p, i) => (
            <motion.span
              key={p.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.08, type: "spring" }}
              className="text-2xl"
            >
              {p.id === "saturn" ? "🪐" : p.id === "earth" ? "🌍" : p.id === "mars" ? "🔴" :
               p.id === "jupiter" ? "🟠" : p.id === "uranus" ? "🔵" : p.id === "neptune" ? "💙" :
               p.id === "venus" ? "🟡" : "⚫"}
            </motion.span>
          ))}
        </motion.div>

        {/* Play Again button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPlayAgain}
          className="w-full py-5 rounded-2xl text-xl font-black"
          style={{
            fontFamily: "'Poppins', sans-serif",
            background: "linear-gradient(135deg, #AEEA00, #00E5FF)",
            color: "#0F172A",
            border: "none",
            boxShadow: "0 0 40px rgba(174, 234, 0, 0.4), 0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          Play Again
        </motion.button>
      </motion.div>
    </div>
  );
}
