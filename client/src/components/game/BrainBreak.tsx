import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BRAIN_BREAK_DURATION } from "../../data/planets";

interface BrainBreakProps {
  onResume: () => void;
  correctCount: number;
}

const ACTIVITIES = [
  { emoji: "🦘", text: "Jump in place 5 times!", action: "Jump!" },
  { emoji: "🌬️", text: "Take 3 deep breaths with me!", action: "Breathe!" },
  { emoji: "⭐", text: "Do 5 star jumps!", action: "Jump!" },
  { emoji: "🌀", text: "Spin around slowly 3 times!", action: "Spin!" },
  { emoji: "🤸", text: "Stretch your arms up high!", action: "Stretch!" },
];

export function BrainBreak({ onResume, correctCount }: BrainBreakProps) {
  const [timeLeft, setTimeLeft] = useState(BRAIN_BREAK_DURATION);
  const [canSkip, setCanSkip] = useState(false);
  const activity = ACTIVITIES[(Math.floor(correctCount / 3) - 1) % ACTIVITIES.length];

  useEffect(() => {
    if (timeLeft <= 0) {
      onResume();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onResume]);

  useEffect(() => {
    const skipTimer = setTimeout(() => setCanSkip(true), BRAIN_BREAK_DURATION * 1000);
    return () => clearTimeout(skipTimer);
  }, []);

  const progress = ((BRAIN_BREAK_DURATION - timeLeft) / BRAIN_BREAK_DURATION) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ background: "rgba(15, 23, 42, 0.97)" }}
    >
      {/* Breathing circle */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: "radial-gradient(circle, rgba(0,229,255,0.2) 0%, transparent 70%)",
            width: "220px",
            height: "220px",
            top: "-10px",
            left: "-10px",
          }}
        />
        {/* Main breathing circle */}
        <motion.div
          className="w-48 h-48 rounded-full flex items-center justify-center text-6xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: "radial-gradient(circle, rgba(0,229,255,0.3) 0%, rgba(124,77,255,0.2) 100%)",
            border: "3px solid rgba(0, 229, 255, 0.5)",
            boxShadow: "0 0 40px rgba(0, 229, 255, 0.3)",
          }}
        >
          {activity.emoji}
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-black text-center mb-3"
        style={{
          fontFamily: "'Poppins', sans-serif",
          color: "#00E5FF",
          textShadow: "0 0 20px rgba(0, 229, 255, 0.6)",
        }}
      >
        🧠 Brain Break Time!
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold text-center mb-8"
        style={{
          fontFamily: "'Comfortaa', sans-serif",
          color: "#E2E8F0",
        }}
      >
        {activity.text}
      </motion.p>

      {/* Countdown */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{
          background: "rgba(30, 41, 59, 0.9)",
          border: "3px solid rgba(174, 234, 0, 0.6)",
          boxShadow: "0 0 30px rgba(174, 234, 0, 0.3)",
        }}
      >
        <span
          className="text-4xl font-black"
          style={{ fontFamily: "'Poppins', sans-serif", color: "#AEEA00" }}
        >
          {timeLeft}
        </span>
      </motion.div>

      {/* Progress bar */}
      <div
        className="w-64 h-3 rounded-full mb-6 overflow-hidden"
        style={{ background: "rgba(30, 41, 59, 0.8)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #AEEA00, #00E5FF)",
            width: `${progress}%`,
            transition: "width 1s linear",
          }}
        />
      </div>

      <p
        className="text-sm text-center mb-4"
        style={{
          fontFamily: "'Comfortaa', sans-serif",
          color: "#64748B",
        }}
      >
        {canSkip ? "Ready to continue!" : `Game resumes in ${timeLeft} seconds...`}
      </p>

      {canSkip && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onResume}
          className="px-8 py-4 rounded-2xl font-black text-lg"
          style={{
            fontFamily: "'Poppins', sans-serif",
            background: "linear-gradient(135deg, #AEEA00, #00E5FF)",
            color: "#0F172A",
            border: "none",
            boxShadow: "0 0 30px rgba(174, 234, 0, 0.4)",
          }}
        >
          Continue Mission! 🚀
        </motion.button>
      )}
    </motion.div>
  );
}
