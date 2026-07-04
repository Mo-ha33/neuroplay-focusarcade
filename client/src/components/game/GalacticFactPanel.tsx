/**
 * GalacticFactPanel
 * ─────────────────
 * Displays a "Galactic Fact of the Day" card fetched from the Open Solar System
 * API (https://api.le-systeme-solaire.net/) when a planet is selected or a
 * level is unlocked.
 *
 * Graceful degradation: if the API is unreachable, the card shows the local
 * static funFact from planets.ts instead of crashing.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchGalacticFact, type GalacticFact } from "../../lib/solarSystemApi";
import { type Planet } from "../../data/planets";

interface GalacticFactPanelProps {
  planet: Planet;
  /** Called when the panel should be dismissed */
  onDismiss?: () => void;
  /** Whether to show as a floating overlay (true) or inline card (false) */
  overlay?: boolean;
}

type LoadState = "loading" | "live" | "fallback" | "error";

export function GalacticFactPanel({
  planet,
  onDismiss,
  overlay = false,
}: GalacticFactPanelProps) {
  const [fact, setFact] = useState<GalacticFact | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    setFact(null);

    fetchGalacticFact(planet.id).then(result => {
      if (cancelled) return;
      if (result) {
        setFact(result);
        setLoadState("live");
      } else {
        setLoadState("fallback");
      }
    });

    return () => { cancelled = true; };
  }, [planet.id]);

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: overlay ? 20 : 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="w-full rounded-3xl p-5 flex flex-col gap-3"
      style={{
        background: "rgba(15, 23, 42, 0.97)",
        border: `2px solid ${planet.color}50`,
        boxShadow: `0 0 40px ${planet.glowColor}, 0 8px 32px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📡</span>
          <span
            className="text-sm font-black"
            style={{
              fontFamily: "'Comfortaa', sans-serif",
              color: "#00E5FF",
            }}
          >
            {loadState === "loading"
              ? "Scanning Galactic Archives..."
              : loadState === "live"
              ? "Live Galactic Data"
              : "Galactic Fact"}
          </span>
          {loadState === "live" && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{
                background: "rgba(174, 234, 0, 0.15)",
                color: "#AEEA00",
                border: "1px solid rgba(174, 234, 0, 0.3)",
              }}
            >
              LIVE
            </span>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-lg leading-none opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "#64748B" }}
            aria-label="Dismiss galactic fact"
          >
            ✕
          </button>
        )}
      </div>

      {/* Planet name */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background: planet.bgGradient,
            boxShadow: `0 0 16px ${planet.glowColor}`,
          }}
        >
          {planet.emoji}
        </div>
        <h3
          className="text-lg font-black"
          style={{
            fontFamily: "'Poppins', sans-serif",
            color: planet.color,
          }}
        >
          {planet.name}
        </h3>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loadState === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-2"
          >
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-4 rounded-full animate-pulse"
                style={{
                  background: "rgba(71, 85, 105, 0.4)",
                  width: `${60 + i * 10}%`,
                }}
              />
            ))}
            <p
              className="text-xs text-center mt-1"
              style={{ fontFamily: "'Comfortaa', sans-serif", color: "#475569" }}
            >
              🛸 Establishing satellite connection...
            </p>
          </motion.div>
        )}

        {loadState === "live" && fact && (
          <motion.div
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-3"
          >
            {/* Fun one-liner */}
            <p
              className="text-sm font-bold leading-relaxed"
              style={{
                fontFamily: "'Comfortaa', sans-serif",
                color: "#E2E8F0",
              }}
            >
              🌟 {fact.funApiLine}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: "🌍", label: "Radius", value: fact.radiusKm },
                { icon: "⚖️", label: "Gravity", value: fact.gravity },
                { icon: "📅", label: "Year Length", value: fact.orbitalPeriod },
                { icon: "🌡️", label: "Avg Temp", value: fact.avgTempCelsius },
                { icon: "🌙", label: "Moons", value: String(fact.moonCount) },
                { icon: "🔄", label: "Day Length", value: fact.rotationPeriod },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="rounded-xl p-2 flex flex-col gap-0.5"
                  style={{
                    background: "rgba(30, 41, 59, 0.8)",
                    border: "1px solid rgba(71, 85, 105, 0.3)",
                  }}
                >
                  <span className="text-xs" style={{ color: "#475569" }}>
                    {stat.icon} {stat.label}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      color: "#00E5FF",
                    }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {loadState === "fallback" && (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p
              className="text-sm font-bold leading-relaxed"
              style={{
                fontFamily: "'Comfortaa', sans-serif",
                color: "#E2E8F0",
              }}
            >
              🌟 {planet.funFact}
            </p>
            <p
              className="text-xs mt-2"
              style={{ fontFamily: "'Comfortaa', sans-serif", color: "#475569" }}
            >
              (Offline mode — showing local data)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (overlay) {
    return (
      <div
        className="fixed inset-0 z-40 flex items-end justify-center p-4 pointer-events-none"
        style={{ paddingBottom: "80px" }}
      >
        <div className="w-full max-w-sm pointer-events-auto">{cardContent}</div>
      </div>
    );
  }

  return <div className="w-full">{cardContent}</div>;
}
