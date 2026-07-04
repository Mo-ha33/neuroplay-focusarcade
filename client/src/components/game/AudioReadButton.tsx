/**
 * AudioReadButton
 * ───────────────
 * A compact, accessible "🔊 Read Aloud" button that uses the Web Speech API
 * to read the provided text to neurodivergent learners.
 *
 * Renders nothing if the browser does not support SpeechSynthesis.
 */

import { motion } from "framer-motion";
import { useSpeech } from "../../hooks/useSpeech";

interface AudioReadButtonProps {
  /** The text to be read aloud */
  text: string;
  /** Optional label override (defaults to "🔊 Listen") */
  label?: string;
  /** Size variant */
  size?: "sm" | "md";
}

export function AudioReadButton({
  text,
  label,
  size = "md",
}: AudioReadButtonProps) {
  const { isSupported, isSpeaking, toggle } = useSpeech();

  if (!isSupported) return null;

  const isSm = size === "sm";

  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => toggle(text)}
      aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
      title={isSpeaking ? "Stop reading" : "Read aloud"}
      className="flex items-center gap-1.5 rounded-2xl font-bold transition-all duration-200 select-none"
      style={{
        fontFamily: "'Comfortaa', sans-serif",
        padding: isSm ? "4px 10px" : "6px 14px",
        fontSize: isSm ? "11px" : "13px",
        background: isSpeaking
          ? "rgba(0, 229, 255, 0.2)"
          : "rgba(0, 229, 255, 0.08)",
        border: isSpeaking
          ? "1.5px solid rgba(0, 229, 255, 0.8)"
          : "1.5px solid rgba(0, 229, 255, 0.3)",
        color: "#00E5FF",
        boxShadow: isSpeaking
          ? "0 0 12px rgba(0, 229, 255, 0.4)"
          : "none",
      }}
    >
      {/* Animated speaker icon */}
      <motion.span
        animate={isSpeaking ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={
          isSpeaking
            ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
        className="text-base leading-none"
      >
        {isSpeaking ? "🔇" : "🔊"}
      </motion.span>
      <span>{isSpeaking ? "Stop" : (label ?? "Listen")}</span>
    </motion.button>
  );
}
