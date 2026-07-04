/**
 * NeuroPlay AI FocusArcade — Teacher Router
 * ==========================================
 * Provides classroom management and student analytics for the
 * Teacher Portal (Classroom Command Center).
 */

import { publicProcedure, router } from "../_core/trpc";
import { DEMO_USERS } from "./rbacRouter";

/** Mock classroom data for the hackathon demo. */
const MOCK_STUDENTS = [
  { id: "s001", name: "Aiden Carter",    score: 87, xp: 1850, stars: 14, sessions: 7,  streak: 5, brainBreaks: 3, lastActive: "Today",      status: "active",  attentionDrift: 1 },
  { id: "s002", name: "Emma Williams",   score: 94, xp: 2100, stars: 16, sessions: 9,  streak: 7, brainBreaks: 1, lastActive: "Today",      status: "active",  attentionDrift: 0 },
  { id: "s003", name: "Liam Johnson",    score: 61, xp: 980,  stars: 8,  sessions: 4,  streak: 2, brainBreaks: 6, lastActive: "Yesterday",  status: "needs-support", attentionDrift: 5 },
  { id: "s004", name: "Olivia Brown",    score: 78, xp: 1450, stars: 11, sessions: 6,  streak: 4, brainBreaks: 2, lastActive: "Today",      status: "active",  attentionDrift: 2 },
  { id: "s005", name: "Noah Davis",      score: 55, xp: 720,  stars: 6,  sessions: 3,  streak: 1, brainBreaks: 8, lastActive: "3 days ago", status: "needs-support", attentionDrift: 7 },
  { id: "s006", name: "Ava Anderson",    score: 82, xp: 1620, stars: 13, sessions: 7,  streak: 5, brainBreaks: 2, lastActive: "Today",      status: "active",  attentionDrift: 2 },
  { id: "s007", name: "Ethan Wilson",    score: 91, xp: 2050, stars: 15, sessions: 8,  streak: 6, brainBreaks: 1, lastActive: "Today",      status: "active",  attentionDrift: 0 },
  { id: "s008", name: "Isabella Thomas", score: 97, xp: 2300, stars: 18, sessions: 10, streak: 9, brainBreaks: 0, lastActive: "Today",      status: "star",    attentionDrift: 0 },
  { id: "s009", name: "Mason Taylor",    score: 68, xp: 1100, stars: 9,  sessions: 5,  streak: 3, brainBreaks: 4, lastActive: "Yesterday",  status: "active",  attentionDrift: 3 },
  { id: "s010", name: "Sofia Martinez",  score: 74, xp: 1280, stars: 10, sessions: 5,  streak: 3, brainBreaks: 3, lastActive: "Today",      status: "active",  attentionDrift: 2 },
];

export const teacherRouter = router({
  /** Get classroom overview statistics. */
  getClassroomStats: publicProcedure.query(() => {
    const teacher = DEMO_USERS.teacher;
    const scores = MOCK_STUDENTS.map(s => s.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const topPerformers = MOCK_STUDENTS.filter(s => s.score >= 85).length;
    const needsSupport = MOCK_STUDENTS.filter(s => s.status === "needs-support").length;
    const totalBrainBreaks = MOCK_STUDENTS.reduce((a, s) => a + s.brainBreaks, 0);
    const avgFocusTime = Math.round(
      MOCK_STUDENTS.reduce((a, s) => a + s.sessions * 420, 0) / MOCK_STUDENTS.length
    );

    return {
      classroomName: teacher.classroomName,
      joinCode: teacher.classroomJoinCode,
      teacherName: teacher.name,
      studentCount: MOCK_STUDENTS.length,
      avgScore,
      topPerformers,
      needsSupport,
      totalBrainBreaks,
      avgFocusTime,
      activeToday: MOCK_STUDENTS.filter(s => s.lastActive === "Today").length,
      totalXPAwarded: MOCK_STUDENTS.reduce((a, s) => a + s.xp, 0),
    };
  }),

  /** Get full student list with engagement metrics. */
  getStudentList: publicProcedure.query(() => {
    return MOCK_STUDENTS;
  }),

  /** Get brain break analytics — which students triggered the most. */
  getBrainBreakStats: publicProcedure.query(() => {
    return MOCK_STUDENTS
      .sort((a, b) => b.brainBreaks - a.brainBreaks)
      .map(s => ({
        name: s.name,
        brainBreaks: s.brainBreaks,
        attentionDrift: s.attentionDrift,
        status: s.status,
      }));
  }),

  /** Get weekly engagement trend (mock data for demo). */
  getWeeklyTrend: publicProcedure.query(() => {
    return [
      { day: "Mon", sessions: 6, avgScore: 68, brainBreaks: 4 },
      { day: "Tue", sessions: 8, avgScore: 74, brainBreaks: 6 },
      { day: "Wed", sessions: 7, avgScore: 71, brainBreaks: 5 },
      { day: "Thu", sessions: 9, avgScore: 79, brainBreaks: 3 },
      { day: "Fri", sessions: 10, avgScore: 82, brainBreaks: 7 },
      { day: "Sat", sessions: 4, avgScore: 88, brainBreaks: 2 },
      { day: "Sun", sessions: 3, avgScore: 91, brainBreaks: 1 },
    ];
  }),
});
