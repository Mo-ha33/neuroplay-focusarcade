/**
 * NeuroPlay AI FocusArcade — Student Portal
 * ==========================================
 * ADHD-optimized gamified landing page for students.
 * Features: XP display, daily missions, streak counter, direct SpaceLab entry.
 * Design: Minimal text, large visual elements, instant dopamine triggers.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useRbac } from "@/contexts/RbacContext";
import { SpaceLabGame } from "@/components/game/SpaceLabGame";

export default function StudentPortal() {
  const { user, logout } = useRbac();
  const [, navigate] = useLocation();
  const [launchGame, setLaunchGame] = useState(false);

  if (!user || user.role !== "student") {
    navigate("/login");
    return null;
  }

  if (launchGame) {
    return <SpaceLabGame />;
  }

  const xpPercent = Math.min(100, Math.round(((user.totalXP ?? 0) % 500) / 500 * 100));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        fontFamily: "'Comfortaa', 'Poppins', sans-serif",
        padding: "0 0 40px",
        overflowX: "hidden",
      }}
    >
      {/* Top HUD */}
      <div
        style={{
          background: "rgba(30,41,59,0.9)",
          borderBottom: "1px solid rgba(0,229,255,0.15)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>{user.avatarEmoji}</span>
          <div>
            <div style={{ color: "#00E5FF", fontWeight: 700, fontSize: 14 }}>{user.name}</div>
            <div style={{ color: "#64748B", fontSize: 11 }}>{user.classroomName}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#AEEA00", fontWeight: 700, fontSize: 16 }}>⚡ {user.totalXP}</div>
            <div style={{ color: "#64748B", fontSize: 10 }}>XP</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>⭐ {user.totalStars}</div>
            <div style={{ color: "#64748B", fontSize: 10 }}>Stars</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 16 }}>🔥 {user.streakDays}</div>
            <div style={{ color: "#64748B", fontSize: 10 }}>Streak</div>
          </div>
          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#64748B",
              fontSize: 11,
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Exit
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px" }}>
        {/* XP Level Bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "#94A3B8", fontSize: 12 }}>Level {Math.floor((user.totalXP ?? 0) / 500) + 1}</span>
            <span style={{ color: "#AEEA00", fontSize: 12 }}>{xpPercent}% to next level</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 100, height: 10, overflow: "hidden" }}>
            <div
              style={{
                width: `${xpPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg, #AEEA00, #00E5FF)",
                borderRadius: 100,
                transition: "width 1s ease",
                boxShadow: "0 0 12px rgba(174,234,0,0.6)",
              }}
            />
          </div>
        </div>

        {/* Main Mission CTA */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,77,255,0.12))",
            border: "2px solid rgba(0,229,255,0.3)",
            borderRadius: 24,
            padding: "28px 24px",
            textAlign: "center",
            marginBottom: 20,
            boxShadow: "0 0 40px rgba(0,229,255,0.1)",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 12 }}>🪐</div>
          <h2 style={{ color: "#00E5FF", fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
            Solar System Lab
          </h2>
          <p style={{ color: "#94A3B8", fontSize: 14, margin: "0 0 20px", lineHeight: 1.5 }}>
            Drag the planets to their orbits!<br />
            Can you place all 8 correctly? 🚀
          </p>
          <button
            onClick={() => setLaunchGame(true)}
            style={{
              background: "linear-gradient(135deg, #00E5FF, #7C4DFF)",
              border: "none",
              borderRadius: 100,
              color: "#0F172A",
              fontSize: 18,
              fontWeight: 800,
              padding: "16px 40px",
              cursor: "pointer",
              boxShadow: "0 0 30px rgba(0,229,255,0.4)",
              fontFamily: "'Comfortaa', sans-serif",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            🚀 Launch Mission!
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { icon: "🎮", label: "Missions Done", value: user.sessionsCompleted ?? 0, color: "#7C4DFF" },
            { icon: "🏆", label: "High Score", value: user.highScore ?? 0, color: "#FFD700" },
            { icon: "🔥", label: "Day Streak", value: `${user.streakDays ?? 0} days`, color: "#FF6B6B" },
            { icon: "👩‍🏫", label: "Teacher", value: user.teacherName ?? "—", color: "#AEEA00" },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                background: "#1E293B",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "16px 14px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ color: stat.color, fontWeight: 700, fontSize: 16 }}>{stat.value}</div>
              <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Daily Tip */}
        <div
          style={{
            background: "rgba(174,234,0,0.06)",
            border: "1px solid rgba(174,234,0,0.2)",
            borderRadius: 16,
            padding: "14px 16px",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 20 }}>💡</span>
          <p style={{ color: "#94A3B8", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: "#AEEA00" }}>Brain Tip:</strong> If you feel wiggly, click the Brain Break button during the mission! It helps you focus better. 🧠
          </p>
        </div>
      </div>
    </div>
  );
}
