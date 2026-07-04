import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PLANETS } from "../../data/planets";

interface OrbitSlotProps {
  orbitOrder: number;
  isOccupied: boolean;
  occupiedByPlanetId?: string;
  isWrong: boolean;
  isHighlighted?: boolean;
  onDrop: (planetId: string, orbitSlot: number) => void;
  onWrongClear: () => void;
}

const ORBIT_LABELS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

export function OrbitSlot({
  orbitOrder,
  isOccupied,
  occupiedByPlanetId,
  isWrong,
  isHighlighted = false,
  onDrop,
  onWrongClear,
}: OrbitSlotProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const planet = occupiedByPlanetId ? PLANETS.find(p => p.id === occupiedByPlanetId) : null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const planetId = e.dataTransfer.getData("planetId");
    if (planetId && !isOccupied) {
      onDrop(planetId, orbitOrder);
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(onWrongClear, 600);
    }
  };

  return (
    <motion.div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      animate={isWrong ? { x: [-8, 8, -6, 6, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-1"
    >
      {/* Orbit number label */}
      <span
        className="text-xs font-bold"
        style={{
          fontFamily: "'Comfortaa', sans-serif",
          color: isOccupied ? "#AEEA00" : "#475569",
        }}
      >
        {ORBIT_LABELS[orbitOrder - 1]}
      </span>

      {/* Drop zone */}
      <div
        className="rounded-full flex items-center justify-center transition-all duration-200 relative"
        style={{
          width: "60px",
          height: "60px",
          border: isOccupied
            ? `2px solid ${planet?.color || "#AEEA00"}`
            : isDragOver
            ? "2px dashed #00E5FF"
            : isWrong
            ? "2px dashed #FF4444"
            : isHighlighted
            ? "2px dashed #AEEA00"
            : "2px dashed rgba(71, 85, 105, 0.6)",
          background: isOccupied
            ? `${planet?.color || "#AEEA00"}15`
            : isDragOver
            ? "rgba(0, 229, 255, 0.1)"
            : isWrong
            ? "rgba(255, 68, 68, 0.1)"
            : isHighlighted
            ? "rgba(174, 234, 0, 0.08)"
            : "rgba(15, 23, 42, 0.5)",
          boxShadow: isOccupied
            ? `0 0 20px ${planet?.glowColor || "rgba(174,234,0,0.4)"}`
            : isDragOver
            ? "0 0 25px rgba(0, 229, 255, 0.5)"
            : isWrong
            ? "0 0 20px rgba(255, 68, 68, 0.4)"
            : isHighlighted
            ? "0 0 15px rgba(174, 234, 0, 0.3)"
            : "none",
          cursor: isOccupied ? "default" : "copy",
        }}
      >
        <AnimatePresence mode="wait">
          {isOccupied && planet ? (
            <motion.div
              key="planet"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{
                background: planet.bgGradient,
                boxShadow: `0 0 15px ${planet.glowColor}`,
              }}
            >
              {planet.id === "saturn" ? "🪐" : planet.id === "earth" ? "🌍" :
               planet.id === "mars" ? "🔴" : planet.id === "jupiter" ? "🟠" :
               planet.id === "uranus" ? "🔵" : planet.id === "neptune" ? "💙" :
               planet.id === "venus" ? "🟡" : "⚫"}
            </motion.div>
          ) : isDragOver ? (
            <motion.span
              key="hover"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl"
            >
              🎯
            </motion.span>
          ) : isWrong ? (
            <span className="text-xl">❌</span>
          ) : (
            <span className="text-lg" style={{ color: "#334155" }}>○</span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
