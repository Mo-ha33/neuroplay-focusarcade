/**
 * StudentAvatar
 * ─────────────
 * Renders a DiceBear-generated sci-fi robot/astronaut avatar for the student.
 * Falls back to an emoji if the SVG fails to load (network error / offline).
 *
 * Used in: GameHUD, CompletionScreen
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { buildAvatarUrl } from "../../lib/dicebearApi";

interface StudentAvatarProps {
  /** Student name or ID — used as the DiceBear seed */
  seed: string;
  /** Display size in px */
  size?: number;
  /** Whether to show the glowing ring */
  glow?: boolean;
  /** Whether to show a floating animation */
  float?: boolean;
  /** Optional CSS class */
  className?: string;
}

export function StudentAvatar({
  seed,
  size = 48,
  glow = true,
  float = false,
  className = "",
}: StudentAvatarProps) {
  const avatar = buildAvatarUrl({ seed, size: size * 2, radius: 50 }); // 2× for retina
  const [imgError, setImgError] = useState(false);

  const inner = imgError ? (
    // Fallback: emoji in a styled circle
    <div
      className="flex items-center justify-center rounded-full select-none"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #7C4DFF, #00E5FF)",
        fontSize: size * 0.45,
      }}
    >
      {avatar.fallbackEmoji}
    </div>
  ) : (
    <img
      src={avatar.url}
      alt={`${seed}'s avatar`}
      width={size}
      height={size}
      onError={() => setImgError(true)}
      style={{
        borderRadius: "50%",
        display: "block",
        background: "rgba(15, 23, 42, 0.8)",
      }}
      loading="lazy"
    />
  );

  const glowStyle = glow
    ? {
        boxShadow:
          "0 0 12px rgba(0, 229, 255, 0.5), 0 0 24px rgba(124, 77, 255, 0.3)",
        borderRadius: "50%",
      }
    : {};

  return (
    <motion.div
      className={`flex-shrink-0 ${className}`}
      style={{ width: size, height: size, ...glowStyle }}
      animate={float ? { y: [0, -4, 0] } : {}}
      transition={
        float
          ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          : {}
      }
    >
      {inner}
    </motion.div>
  );
}
