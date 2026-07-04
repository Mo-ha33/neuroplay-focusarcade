import { useState } from "react";
import { motion } from "framer-motion";
import { StudentAvatar } from "./StudentAvatar";
import { useLanguage } from "../../contexts/LanguageContext";

interface WelcomeScreenProps {
  onStart: (name: string) => void;
  isLoading: boolean;
}

export function WelcomeScreen({ onStart, isLoading }: WelcomeScreenProps) {
  const [name, setName] = useState("");
  const { lang, isRTL } = useLanguage();
  const fontFamily = lang === "ar" ? "'Cairo', 'Almarai', sans-serif" : "'Comfortaa', sans-serif";

  const labels = {
    subtitle: lang === "ar" ? "مختبر النظام الشمسي 🌌" : "Solar System Space Lab 🌌",
    missionTitle: lang === "ar" ? "مهمتك:" : "Your Mission:",
    missionBody: lang === "ar"
      ? "اسحب كل كوكب إلى مداره الصحيح حول الشمس! 🌟"
      : "Drag each planet to its correct orbit around the Sun! 🌟",
    nameLabel: lang === "ar" ? "ما اسمك يا مستكشف الفضاء؟" : "What's your name, Space Explorer?",
    namePlaceholder: lang === "ar" ? "أدخل اسمك..." : "Enter your name...",
    launch: lang === "ar" ? "🚀 انطلق في المهمة!" : "🚀 Launch Mission!",
    launching: lang === "ar" ? "جارٍ الإطلاق..." : "Launching...",
    defaultName: lang === "ar" ? "مستكشف الفضاء" : "Space Explorer",
  };

  const handleStart = () => {
    onStart(name.trim() || labels.defaultName);
  };

  return (
    <div
      className="min-h-screen star-field flex flex-col items-center justify-center p-6 relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
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
              fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Poppins', sans-serif",
              color: "#00E5FF",
              letterSpacing: lang === "ar" ? "0" : "-0.02em",
            }}
          >
            NeuroPlay AI
          </h1>
          <p
            className="text-xl font-bold"
            style={{ fontFamily, color: "#7C4DFF" }}
          >
            {labels.subtitle}
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
            style={{ fontFamily, color: "#E2E8F0" }}
          >
            {labels.missionTitle}
          </p>
          <p
            className="text-base"
            style={{ fontFamily, color: "#94A3B8" }}
          >
            {labels.missionBody}
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
            style={{ fontFamily, color: "#94A3B8" }}
          >
            {labels.nameLabel}
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
            placeholder={labels.namePlaceholder}
            maxLength={30}
            dir={isRTL ? "rtl" : "ltr"}
            className="w-full px-5 py-4 rounded-2xl text-center text-lg font-bold outline-none transition-all duration-200"
            style={{
              fontFamily,
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
            fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Poppins', sans-serif",
            background: "linear-gradient(135deg, #00E5FF, #7C4DFF)",
            color: "#0F172A",
            boxShadow: "0 0 30px rgba(0, 229, 255, 0.4), 0 4px 20px rgba(0,0,0,0.3)",
            border: "none",
          }}
        >
          {isLoading ? labels.launching : labels.launch}
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
