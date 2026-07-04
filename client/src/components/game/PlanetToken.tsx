import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Planet } from "../../data/planets";

interface PlanetTokenProps {
  planet: Planet;
  isActive: boolean;
  isPlaced: boolean;
  isSelected?: boolean;
  onDragStart: (planetId: string) => void;
  onDragEnd: () => void;
}

export function PlanetToken({ planet, isActive, isPlaced, isSelected = false, onDragStart, onDragEnd }: PlanetTokenProps) {
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("planetId", planet.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart(planet.id);
  };

  const getPlanetEmoji = (id: string) => {
    const map: Record<string, string> = {
      saturn: "🪐", earth: "🌍", mars: "🔴", jupiter: "🟠",
      uranus: "🔵", neptune: "💙", venus: "🟡", mercury: "⚫",
    };
    return map[id] || "🌑";
  };

  if (isPlaced) {
    return (
      <div
        className="flex flex-col items-center gap-1 opacity-30"
        style={{ minWidth: "64px" }}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: `${Math.max(48, planet.size * 0.8)}px`,
            height: `${Math.max(48, planet.size * 0.8)}px`,
            background: "rgba(30, 41, 59, 0.5)",
            border: "2px dashed rgba(71, 85, 105, 0.3)",
          }}
        >
          <span className="text-2xl grayscale">{getPlanetEmoji(planet.id)}</span>
        </div>
        <span
          className="text-xs font-bold"
          style={{ fontFamily: "'Comfortaa', sans-serif", color: "#334155" }}
        >
          ✓ Placed
        </span>
      </div>
    );
  }

  return (
      <motion.div
        ref={dragRef}
        className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing select-none"
        style={{ minWidth: "64px" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing select-none"
      >
        <motion.div
          className="rounded-full flex items-center justify-center relative"
          animate={isActive ? { y: [0, -6, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: `${Math.max(52, planet.size * 0.9)}px`,
            height: `${Math.max(52, planet.size * 0.9)}px`,
            background: planet.bgGradient,
            boxShadow: isActive
              ? `0 0 30px ${planet.glowColor}, 0 0 60px ${planet.glowColor.replace("0.6", "0.3")}`
              : isSelected
              ? `0 0 25px ${planet.glowColor}`
              : `0 0 15px ${planet.glowColor.replace("0.6", "0.3")}`,
            border: isActive || isSelected
              ? `2px solid ${planet.color}`
              : "2px solid transparent",
            transition: "box-shadow 0.3s ease",
          }}
        >
        <span className="text-2xl pointer-events-none">{getPlanetEmoji(planet.id)}</span>
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              border: `2px solid ${planet.color}`,
              pointerEvents: "none",
            }}
          />
        )}
      </motion.div>
      <span
        className="text-xs font-bold text-center"
        style={{
          fontFamily: "'Comfortaa', sans-serif",
          color: isActive ? planet.color : "#94A3B8",
          maxWidth: "64px",
          lineHeight: "1.2",
        }}
      >
        {planet.name}
      </span>
    </div>
    </motion.div>
  );
}
