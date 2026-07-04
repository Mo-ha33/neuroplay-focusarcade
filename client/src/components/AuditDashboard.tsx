/**
 * AuditDashboard.tsx — Hackathon Demo Observability Panel
 *
 * Real-time telemetry display showing:
 *  - AI tool call counts and success rates
 *  - Session lifecycle events
 *  - Integration status (Sheets, Calendar, Dopamine Report)
 *  - Recent audit log entries
 *  - Mock data seed button
 *
 * Designed for live judging demo — shows the full system is wired.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

const CATEGORY_ICONS: Record<string, string> = {
  ai_call: "🤖",
  quiz_gen: "📝",
  content_process: "📚",
  sheets_tracker: "📊",
  calendar_event: "📅",
  dopamine_report: "🎉",
  session_lifecycle: "🎮",
  error_fallback: "⚠️",
  mock_data: "🧪",
};

const LEVEL_COLORS: Record<string, string> = {
  INFO: "#00E5FF",
  WARN: "#F59E0B",
  ERROR: "#EF4444",
  SUCCESS: "#AEEA00",
};

export function AuditDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "summary" | "mock">("summary");

  const auditLogs = trpc.ai.getAuditLogs.useQuery({ limit: 50 }, { refetchInterval: 3000 });
  const auditSummary = trpc.admin.getAuditSummary.useQuery(undefined, { refetchInterval: 5000 });
  const seedMock = trpc.admin.seedMockData.useMutation();

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: "linear-gradient(135deg, #7C4DFF, #00E5FF)",
          border: "2px solid rgba(0,229,255,0.4)",
          boxShadow: "0 0 20px rgba(124,77,255,0.5)",
          cursor: "pointer",
        }}
        title="Audit Dashboard"
      >
        <span className="text-lg">📡</span>
      </motion.button>

      {/* Dashboard panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 flex flex-col shadow-2xl"
            style={{
              background: "#0F172A",
              borderLeft: "1px solid rgba(0,229,255,0.2)",
              fontFamily: "'Comfortaa', sans-serif",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "rgba(0,229,255,0.15)" }}
            >
              <div>
                <p className="font-black text-sm" style={{ color: "#00E5FF" }}>
                  📡 Audit Dashboard
                </p>
                <p className="text-xs" style={{ color: "#475569" }}>
                  Live Telemetry · NeuroPlay AI
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: "rgba(30,41,59,0.8)",
                  border: "1px solid rgba(71,85,105,0.3)",
                  color: "#64748B",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                }}
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: "rgba(0,229,255,0.1)" }}>
              {(["summary", "logs", "mock"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-2 text-xs font-bold capitalize transition-all"
                  style={{
                    background: activeTab === tab ? "rgba(0,229,255,0.08)" : "transparent",
                    color: activeTab === tab ? "#00E5FF" : "#475569",
                    borderBottom: activeTab === tab ? "2px solid #00E5FF" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {tab === "summary" ? "📊 Summary" : tab === "logs" ? "📋 Logs" : "🧪 Mock Data"}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Summary Tab */}
              {activeTab === "summary" && (
                <>
                  {auditSummary.data ? (
                    <>
                      {/* Success rate */}
                      <div
                        className="rounded-xl p-3"
                        style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(174,234,0,0.2)" }}
                      >
                        <p className="text-xs font-bold mb-2" style={{ color: "#AEEA00" }}>
                          ✅ System Health
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(15,23,42,0.8)" }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: "linear-gradient(90deg, #AEEA00, #00E5FF)" }}
                              animate={{ width: `${auditSummary.data.successRate}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                          <span className="text-xs font-black" style={{ color: "#AEEA00" }}>
                            {auditSummary.data.successRate}%
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: "#475569" }}>
                          {auditSummary.data.totalEvents} total events
                        </p>
                      </div>

                      {/* Category breakdown */}
                      <div
                        className="rounded-xl p-3"
                        style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(124,77,255,0.2)" }}
                      >
                        <p className="text-xs font-bold mb-2" style={{ color: "#7C4DFF" }}>
                          📊 Events by Category
                        </p>
                        <div className="space-y-1.5">
                          {Object.entries(auditSummary.data.byCategory).map(([cat, count]) => (
                            <div key={cat} className="flex items-center justify-between">
                              <span className="text-xs" style={{ color: "#64748B" }}>
                                {CATEGORY_ICONS[cat] ?? "•"} {cat.replace("_", " ")}
                              </span>
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  background: "rgba(0,229,255,0.1)",
                                  color: "#00E5FF",
                                }}
                              >
                                {count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Level breakdown */}
                      <div
                        className="rounded-xl p-3"
                        style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(0,229,255,0.1)" }}
                      >
                        <p className="text-xs font-bold mb-2" style={{ color: "#00E5FF" }}>
                          🎯 Events by Level
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(auditSummary.data.byLevel).map(([level, count]) => (
                            <div
                              key={level}
                              className="rounded-lg p-2 text-center"
                              style={{
                                background: `${LEVEL_COLORS[level] ?? "#64748B"}12`,
                                border: `1px solid ${LEVEL_COLORS[level] ?? "#64748B"}30`,
                              }}
                            >
                              <p className="text-sm font-black" style={{ color: LEVEL_COLORS[level] ?? "#64748B" }}>
                                {count}
                              </p>
                              <p className="text-xs" style={{ color: "#475569" }}>{level}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Integration status */}
                      <div
                        className="rounded-xl p-3"
                        style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(71,85,105,0.2)" }}
                      >
                        <p className="text-xs font-bold mb-2" style={{ color: "#64748B" }}>
                          🔌 Integration Status
                        </p>
                        {[
                          { name: "Google Sheets", icon: "📊", cat: "sheets_tracker" },
                          { name: "Google Calendar", icon: "📅", cat: "calendar_event" },
                          { name: "Dopamine Report", icon: "🎉", cat: "dopamine_report" },
                          { name: "AI Tutor", icon: "🤖", cat: "ai_call" },
                          { name: "Quiz Engine", icon: "📝", cat: "quiz_gen" },
                        ].map(({ name, icon, cat }) => {
                          const count = auditSummary.data?.byCategory[cat] ?? 0;
                          return (
                            <div key={cat} className="flex items-center justify-between py-1">
                              <span className="text-xs" style={{ color: "#64748B" }}>
                                {icon} {name}
                              </span>
                              <span
                                className="text-xs font-bold"
                                style={{ color: count > 0 ? "#AEEA00" : "#334155" }}
                              >
                                {count > 0 ? `✓ ${count} calls` : "Standby"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="text-3xl mb-2"
                      >
                        📡
                      </motion.div>
                      <p className="text-xs" style={{ color: "#475569" }}>Loading telemetry...</p>
                    </div>
                  )}
                </>
              )}

              {/* Logs Tab */}
              {activeTab === "logs" && (
                <div className="space-y-2">
                  {(auditLogs.data ?? []).slice().reverse().map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg p-2.5"
                      style={{
                        background: "rgba(30,41,59,0.7)",
                        border: `1px solid ${LEVEL_COLORS[log.level] ?? "#64748B"}25`,
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">{CATEGORY_ICONS[log.category] ?? "•"}</span>
                        <span
                          className="text-xs font-black"
                          style={{ color: LEVEL_COLORS[log.level] ?? "#64748B" }}
                        >
                          {log.level}
                        </span>
                        <span className="text-xs" style={{ color: "#334155" }}>
                          {log.durationMs !== undefined ? `${log.durationMs}ms` : ""}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "#94A3B8" }}>
                        {log.message}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#334155" }}>
                        {new Date(log.ts).toLocaleTimeString()}
                      </p>
                    </motion.div>
                  ))}
                  {(auditLogs.data ?? []).length === 0 && (
                    <p className="text-xs text-center py-8" style={{ color: "#334155" }}>
                      No events yet. Start the game! 🚀
                    </p>
                  )}
                </div>
              )}

              {/* Mock Data Tab */}
              {activeTab === "mock" && (
                <div className="space-y-3">
                  <div
                    className="rounded-xl p-3"
                    style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(124,77,255,0.2)" }}
                  >
                    <p className="text-xs font-bold mb-2" style={{ color: "#7C4DFF" }}>
                      🧪 Demo Data Seeder
                    </p>
                    <p className="text-xs mb-3" style={{ color: "#64748B" }}>
                      Inject 10 rows of realistic student data into the Google Sheets teacher dashboard for live judging demo.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => seedMock.mutate()}
                      disabled={seedMock.isPending}
                      className="w-full py-2.5 rounded-xl text-xs font-black transition-all"
                      style={{
                        background: seedMock.isPending
                          ? "rgba(30,41,59,0.8)"
                          : "linear-gradient(135deg, #7C4DFF, #00E5FF)",
                        color: seedMock.isPending ? "#475569" : "#0F172A",
                        border: "none",
                        cursor: seedMock.isPending ? "not-allowed" : "pointer",
                      }}
                    >
                      {seedMock.isPending ? "Seeding... 🛸" : "🚀 Seed 10 Mock Students"}
                    </motion.button>
                  </div>

                  {seedMock.data && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl p-3"
                      style={{
                        background: seedMock.data.success
                          ? "rgba(174,234,0,0.08)"
                          : "rgba(0,229,255,0.08)",
                        border: `1px solid ${seedMock.data.success ? "rgba(174,234,0,0.3)" : "rgba(0,229,255,0.3)"}`,
                      }}
                    >
                      <p
                        className="text-xs font-bold mb-1"
                        style={{ color: seedMock.data.success ? "#AEEA00" : "#00E5FF" }}
                      >
                        {seedMock.data.success ? "✅ Seeded!" : "ℹ️ Info"}
                      </p>
                      <p className="text-xs" style={{ color: "#94A3B8" }}>
                        {seedMock.data.message}
                      </p>
                      {seedMock.data.rows && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-bold" style={{ color: "#475569" }}>
                            Sample rows:
                          </p>
                          {seedMock.data.rows.slice(0, 3).map((row, i) => (
                            <p key={i} className="text-xs font-mono" style={{ color: "#334155" }}>
                              {(row as (string | number)[]).slice(1, 5).join(" | ")}
                            </p>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Sheet columns reference */}
                  <div
                    className="rounded-xl p-3"
                    style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(71,85,105,0.2)" }}
                  >
                    <p className="text-xs font-bold mb-2" style={{ color: "#475569" }}>
                      📋 Sheet Schema
                    </p>
                    {[
                      "Timestamp",
                      "Student_ID",
                      "Student_Name",
                      "Score_%",
                      "Time_Spent_Sec",
                      "Attention_Drift_Count",
                      "Correct_Count",
                      "Total_Planets",
                      "XP_Earned",
                      "Stars_Earned",
                    ].map((col, i) => (
                      <div key={col} className="flex items-center gap-2 py-0.5">
                        <span className="text-xs font-mono" style={{ color: "#334155" }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-xs" style={{ color: "#64748B" }}>{col}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
