import { useState } from "react";
import { motion } from "framer-motion";
import { StudentAvatar } from "./StudentAvatar";

interface WelcomeScreenProps {
  onStart: (name: string) => void;
  isLoading: boolean;
}

export function WelcomeScreen({ onStart, isLoading }: WelcomeScreenProps) {
  const [name, setName] = useState("");

  const handleStart = () => {
    onStart(name.trim() || "Space Explorer");
  };

  return (
    <div className="min-h-screen star-field flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative orbiting dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-twinkle"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              backgroundColor: ["#00E5FF", "#7C4DFF", "#AEEA00", "#ffffff"][Math.floor(Math.random() * 4)],
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animationDelay: Math.random() * 3 + "s",
              animationDuration: (Math.random() * 2 + 1.5) + "s",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col items-center gap-6 max-w-md w-full z-10"
      >
        {/* Logo / Title */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-7xl mb-2"
        >
          🚀
        </motion.div>

        <div className="text-center">
          <h1
            className="text-4xl font-black text-glow-cyan mb-2"
            style={{
              fontFamily: "'Poppins', sans-serif",
              color: "#00E5FF",
              letterSpacing: "-0.02em",
            }}
          >
            NeuroPlay AI
          </h1>
          <p
            className="text-xl font-bold"
            style={{ fontFamily: "'Comfortaa', sans-serif", color: "#7C4DFF" }}
          >
            Solar System Space Lab 🌌
          </p>
        </div>

        {/* Mission card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full rounded-3xl p-6 text-center"
          style={{
            background: "rgba(30, 41, 59, 0.9)",
            border: "2px solid rgba(0, 229, 255, 0.3)",
            boxShadow: "0 0 40px rgba(0, 229, 255, 0.1)",
          }}
        >
          <p
            className="text-lg font-semibold mb-1"
            style={{ fontFamily: "'Comfortaa', sans-serif", color: "#E2E8F0" }}
          >
            Your Mission:
          </p>
          <p
            className="text-base"
            style={{ fontFamily: "'Comfortaa', sans-serif", color: "#94A3B8" }}
          >
            Drag each planet to its correct orbit around the Sun! 🌟
          </p>
        </motion.div>

        {/* Name input with live DiceBear avatar preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full"
        >
          <label
            className="block text-sm font-bold mb-2 text-center"
            style={{ fontFamily: "'Comfortaa', sans-serif", color: "#94A3B8" }}
          >
            What's your name, Space Explorer?
          </label>
          {/* Live avatar preview — updates as user types */}
          {name.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-3"
            >
              <StudentAvatar seed={name.trim()} size={56} glow={true} float={true} />
            </motion.div>
          )}
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleStart()}
            placeholder="Enter your name..."
            maxLength={30}
            className="w-full px-5 py-4 rounded-2xl text-center text-lg font-bold outline-none transition-all duration-200"
            style={{
              fontFamily: "'Comfortaa', sans-serif",
              background: "rgba(15, 23, 42, 0.8)",
              border: "2px solid rgba(124, 77, 255, 0.5)",
              color: "#E2E8F0",
              boxShadow: "0 0 0 0 rgba(124, 77, 255, 0)",
            }}
            onFocus={e => {
              e.target.style.border = "2px solid #7C4DFF";
              e.target.style.boxShadow = "0 0 20px rgba(124, 77, 255, 0.4)";
            }}
            onBlur={e => {
              e.target.style.border = "2px solid rgba(124, 77, 255, 0.5)";
              e.target.style.boxShadow = "0 0 0 0 rgba(124, 77, 255, 0)";
            }}
          />
        </motion.div>

        {/* Launch button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          disabled={isLoading}
          className="w-full py-5 rounded-2xl text-xl font-black transition-all duration-200 relative overflow-hidden"
          style={{
            fontFamily: "'Poppins', sans-serif",
            background: "linear-gradient(135deg, #00E5FF, #7C4DFF)",
            color: "#0F172A",
            boxShadow: "0 0 30px rgba(0, 229, 255, 0.4), 0 4px 20px rgba(0,0,0,0.3)",
            border: "none",
          }}
        >
          {isLoading ? "Launching..." : "🚀 Launch Mission!"}
        </motion.button>

        {/* Planet preview */}
        <div className="flex gap-3 flex-wrap justify-center mt-2">
          {["🪐", "🌍", "🔴", "🟡", "⚫", "🔵", "🟠", "💫"].map((emoji, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
