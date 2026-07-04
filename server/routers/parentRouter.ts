/**
 * NeuroPlay AI FocusArcade — Parent Router
 * =========================================
 * Provides child focus metrics, session history, and positive milestones
 * for the Parent Portal (Focus & Wellness Monitor).
 */

import { publicProcedure, router } from "../_core/trpc";
import { DEMO_USERS } from "./rbacRouter";

const MOCK_CHILD_SESSIONS = [
  { date: "2026-07-04", score: 87, xp: 300, stars: 3, timeSec: 420, brainBreaks: 1, planetsCorrect: 7, mood: "focused" },
  { date: "2026-07-03", score: 94, xp: 350, stars: 4, timeSec: 380, brainBreaks: 0, planetsCorrect: 8, mood: "superstar" },
  { date: "2026-07-02", score: 72, xp: 250, stars: 2, timeSec: 510, brainBreaks: 2, planetsCorrect: 6, mood: "good" },
  { date: "2026-07-01", score: 81, xp: 300, stars: 3, timeSec: 440, brainBreaks: 1, planetsCorrect: 7, mood: "focused" },
  { date: "2026-06-30", score: 65, xp: 200, stars: 2, timeSec: 600, brainBreaks: 3, planetsCorrect: 5, mood: "needs-break" },
  { date: "2026-06-29", score: 88, xp: 350, stars: 3, timeSec: 390, brainBreaks: 1, planetsCorrect: 7, mood: "focused" },
  { date: "2026-06-28", score: 91, xp: 400, stars: 4, timeSec: 360, brainBreaks: 0, planetsCorrect: 8, mood: "superstar" },
];

const MOCK_MILESTONES = [
  { id: 1, title: "First Mission Complete! 🚀",    date: "2026-06-28", xp: 100, icon: "🚀", type: "achievement" },
  { id: 2, title: "3-Day Focus Streak! 🔥",        date: "2026-06-30", xp: 150, icon: "🔥", type: "streak" },
  { id: 3, title: "Placed All 8 Planets! 🪐",      date: "2026-07-03", xp: 200, icon: "🪐", type: "perfect" },
  { id: 4, title: "5-Day Focus Streak! ⭐",         date: "2026-07-04", xp: 250, icon: "⭐", type: "streak" },
  { id: 5, title: "1,000 XP Collected! ⚡",         date: "2026-07-01", xp: 100, icon: "⚡", type: "xp" },
];

export const parentRouter = router({
  /** Get the child's overall focus metrics summary. */
  getChildMetrics: publicProcedure.query(() => {
    const parent = DEMO_USERS.parent;
    return {
      childName: parent.childName,
      totalXP: parent.childXP,
      totalStars: parent.childStars,
      sessionsCompleted: parent.childSessions,
      streakDays: parent.childStreak,
      totalFocusTimeSec: parent.childFocusTimeSec,
      lastSession: parent.childLastSession,
      avgScore: Math.round(
        MOCK_CHILD_SESSIONS.reduce((a, s) => a + s.score, 0) / MOCK_CHILD_SESSIONS.length
      ),
      avgBrainBreaks: (
        MOCK_CHILD_SESSIONS.reduce((a, s) => a + s.brainBreaks, 0) / MOCK_CHILD_SESSIONS.length
      ).toFixed(1),
      bestDay: "Thursday",
      weeklyGoalMet: true,
    };
  }),

  /** Get the child's recent session history. */
  getChildSessions: publicProcedure.query(() => {
    return MOCK_CHILD_SESSIONS;
  }),

  /** Get the child's positive behavioral milestones. */
  getMilestones: publicProcedure.query(() => {
    return MOCK_MILESTONES;
  }),

  /** Get weekly focus trend for the parent chart. */
  getWeeklyFocusTrend: publicProcedure.query(() => {
    return MOCK_CHILD_SESSIONS.slice().reverse().map(s => ({
      date: s.date,
      score: s.score,
      focusMinutes: Math.round(s.timeSec / 60),
      mood: s.mood,
    }));
  }),
});
