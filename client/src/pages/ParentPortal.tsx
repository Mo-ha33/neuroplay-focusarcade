/**
 * NeuroPlay AI FocusArcade — Parent Portal
 * =========================================
 * Focus & Wellness Monitor: child's focus time, stars, sessions,
 * positive milestones, and weekly trend — warm and reassuring design.
 */

import { useLocation } from "wouter";
import { useRbac } from "@/contexts/RbacContext";
import { trpc } from "@/lib/trpc";
import { ParentUploadZone } from "@/components/uploads";

const MOOD_CONFIG = {
  superstar:   { emoji: "🌟", label: "Superstar!",   color: "#FFD700" },
  focused:     { emoji: "🎯", label: "Focused",       color: "#00E5FF" },
  good:        { emoji: "✅", label: "Good Session",  color: "#AEEA00" },
  "needs-break":{ emoji: "😮‍💨", label: "Needed Breaks", color: "#FF6B6B" },
};

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ParentPortal() {
  const { user, logout } = useRbac();
  const [, navigate] = useLocation();

  const metricsQuery = trpc.parent.getChildMetrics.useQuery();
  const sessionsQuery = trpc.parent.getChildSessions.useQuery();
  const milestonesQuery = trpc.parent.getMilestones.useQuery();

  if (!user || user.role !== "parent") {
    navigate("/login");
    return null;
  }

  const metrics = metricsQuery.data;
  const sessions = sessionsQuery.data ?? [];
  const milestones = milestonesQuery.data ?? [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        fontFamily: "'Comfortaa', 'Poppins', sans-serif",
        paddingBottom: 40,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(30,41,59,0.95)",
          borderBottom: "1px solid rgba(174,234,0,0.2)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>👨‍👩‍👦</span>
          <div>
            <div style={{ color: "#AEEA00", fontWeight: 700, fontSize: 15 }}>{user.name}</div>
            <div style={{ color: "#64748B", fontSize: 11 }}>
              Monitoring: <span style={{ color: "#00E5FF" }}>{user.childName}</span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "#64748B",
            fontSize: 11,
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
        <h1 style={{ color: "#E2E8F0", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
          🌱 Focus & Wellness Monitor
        </h1>
        <p style={{ color: "#64748B", fontSize: 13, marginBottom: 24 }}>
          {metrics?.childName}'s learning journey at a glance
        </p>

        {/* IEP & Clinical Report Upload */}
        <ParentUploadZone />

        {/* Key Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { icon: "⚡", label: "Total XP",       value: metrics?.totalXP ?? "—",                        color: "#AEEA00" },
            { icon: "⭐", label: "Stars Earned",    value: metrics?.totalStars ?? "—",                     color: "#FFD700" },
            { icon: "🎮", label: "Sessions Done",   value: metrics?.sessionsCompleted ?? "—",              color: "#00E5FF" },
            { icon: "🔥", label: "Day Streak",      value: metrics ? `${metrics.streakDays} days` : "—",  color: "#FF6B6B" },
            { icon: "🧠", label: "Focus Time",      value: metrics ? formatTime(metrics.totalFocusTimeSec ?? 0) : "—", color: "#7C4DFF" },
            { icon: "📊", label: "Avg Score",       value: metrics ? `${metrics.avgScore}%` : "—",        color: "#00E5FF" },
          ].map(s => (
            <div
              key={s.label}
              style={{
                background: "#1E293B",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "16px 12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ color: s.color, fontWeight: 700, fontSize: 18 }}>{s.value}</div>
              <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Positive Milestones */}
        <div
          style={{
            background: "#1E293B",
            border: "1px solid rgba(174,234,0,0.15)",
            borderRadius: 20,
            padding: "18px 20px",
            marginBottom: 20,
          }}
        >
          <h3 style={{ color: "#AEEA00", fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>
            🏅 Positive Milestones — Celebrate These!
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {milestones.map(m => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  background: "rgba(174,234,0,0.05)",
                  borderRadius: 12,
                  border: "1px solid rgba(174,234,0,0.1)",
                }}
              >
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#E2E8F0", fontWeight: 600, fontSize: 13 }}>{m.title}</div>
                  <div style={{ color: "#64748B", fontSize: 11 }}>{m.date}</div>
                </div>
                <div style={{ color: "#AEEA00", fontWeight: 700, fontSize: 12 }}>+{m.xp} XP</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div
          style={{
            background: "#1E293B",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            padding: "18px 20px",
            marginBottom: 20,
          }}
        >
          <h3 style={{ color: "#E2E8F0", fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>
            📅 Recent Sessions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sessions.slice(0, 5).map((s, i) => {
              const mood = MOOD_CONFIG[s.mood as keyof typeof MOOD_CONFIG] ?? MOOD_CONFIG.focused;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: 12,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{mood.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 600 }}>
                      {s.planetsCorrect}/8 planets · {Math.round(s.timeSec / 60)}m
                    </div>
                    <div style={{ color: "#64748B", fontSize: 11 }}>{s.date}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: mood.color, fontWeight: 700, fontSize: 14 }}>{s.score}%</div>
                    <div style={{ color: "#64748B", fontSize: 10 }}>{mood.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Parent Tip */}
        <div
          style={{
            background: "rgba(0,229,255,0.05)",
            border: "1px solid rgba(0,229,255,0.15)",
            borderRadius: 16,
            padding: "14px 16px",
          }}
        >
          <p style={{ color: "#94A3B8", fontSize: 12, margin: 0, lineHeight: 1.7 }}>
            <strong style={{ color: "#00E5FF" }}>💙 Parent Tip:</strong> When {metrics?.childName} finishes a session, say{" "}
            <em>"I'm so proud of you — you focused and finished the whole mission!"</em>{" "}
            This immediate praise reinforces the dopamine reward loop and builds positive associations with learning.
          </p>
        </div>
      </div>
    </div>
  );
}
