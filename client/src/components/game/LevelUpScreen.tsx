import { useEffect } from "react";
import { motion } from "framer-motion";
import { fireConfetti } from "../../lib/confetti";

interface LevelUpScreenProps {
  onContinue: () => void;
  correctCount: number;
  totalXP: number;
}

export function LevelUpScreen({ onContinue, correctCount, totalXP }: LevelUpScreenProps) {
  useEffect(() => {
    fireConfetti();
    const timer = setTimeout(onContinue, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ background: "rgba(15, 23, 42, 0.95)" }}
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-8xl"
        >
          ⚡
        </motion.div>

        <div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black mb-2"
            style={{
              fontFamily: "'Poppins', sans-serif",
              color: "#AEEA00",
              textShadow: "0 0 30px rgba(174, 234, 0, 0.8)",
            }}
          >
            LEVEL UP! 🎉
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-xl font-bold"
            style={{ fontFamily: "'Comfortaa', sans-serif", color: "#E2E8F0" }}
          >
            Halfway there, Space Explorer!
          </motion.p>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="flex gap-6"
        >
          <div
            className="px-6 py-4 rounded-2xl text-center"
            style={{
              background: "rgba(174, 234, 0, 0.1)",
              border: "2px solid rgba(174, 234, 0, 0.4)",
            }}
          >
            <div className="text-3xl font-black" style={{ color: "#AEEA00", fontFamily: "'Poppins', sans-serif" }}>
              {correctCount}
            </div>
            <div className="text-xs font-bold" style={{ color: "#64748B", fontFamily: "'Comfortaa', sans-serif" }}>
              Planets Placed
            </div>
          </div>
          <div
            className="px-6 py-4 rounded-2xl text-center"
            style={{
              background: "rgba(0, 229, 255, 0.1)",
              border: "2px solid rgba(0, 229, 255, 0.4)",
            }}
          >
            <div className="text-3xl font-black" style={{ color: "#00E5FF", fontFamily: "'Poppins', sans-serif" }}>
              {totalXP}
            </div>
            <div className="text-xs font-bold" style={{ color: "#64748B", fontFamily: "'Comfortaa', sans-serif" }}>
              XP Earned
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm"
          style={{ fontFamily: "'Comfortaa', sans-serif", color: "#64748B" }}
        >
          Continuing in 3 seconds...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
