import { COOKIE_NAME } from "@shared/const";
import { invokeAiWithFallback } from "./aiResilience";
import { rbacRouter } from "./routers/rbacRouter";
import { teacherRouter } from "./routers/teacherRouter";
import { parentRouter } from "./routers/parentRouter";
import { adminRouter } from "./routers/adminRouter";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createGameSession,
  updateGameSession,
  getGameSession,
  getTopSessions,
  recordPlanetAttempt,
  getSessionAttempts,
} from "./db";
import { logFocusMetrics } from "./integrations/sheetsLogger";
import { fireDopamineReport } from "./integrations/dopamineReport";
import { parseCurriculumToQuests, parseGoogleDriveDocument } from "./integrations/curriculumParser";

export const appRouter = router({
  system: systemRouter,
  rbac: rbacRouter,
  teacher: teacherRouter,
  parent: parentRouter,
  admin: adminRouter,

  // ── AI Resilience: multi-model chat with Gemini → OpenRouter → Groq → static fallback
  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["system", "user", "assistant"]),
              content: z.string(),
            })
          ),
          maxTokens: z.number().optional().default(512),
          temperature: z.number().min(0).max(2).optional().default(0.7),
        })
      )
      .mutation(async ({ input }) => {
        const result = await invokeAiWithFallback({
          messages: input.messages,
          maxTokens: input.maxTokens,
          temperature: input.temperature,
          timeoutMs: 8000,
        });
        return result;
      }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  game: router({
    // Create a new game session
    createSession: publicProcedure
      .input(z.object({
        studentId: z.string().default("anonymous"),
        studentName: z.string().default("Space Explorer"),
      }))
      .mutation(async ({ input }) => {
        const id = await createGameSession({
          studentId: input.studentId,
          studentName: input.studentName,
          score: 0,
          xp: 0,
          starsEarned: 0,
          correctCount: 0,
          totalPlanets: 8,
          timeSpentSec: 0,
          attentionDriftCount: 0,
          completed: 0,
        });
        return { sessionId: id };
      }),

    // Record a planet placement attempt
    recordAttempt: publicProcedure
      .input(z.object({
        sessionId: z.number(),
        planetName: z.string(),
        correct: z.boolean(),
        attemptNumber: z.number().default(1),
      }))
      .mutation(async ({ input }) => {
        const xpAwarded = input.correct ? 100 : 0;
        await recordPlanetAttempt({
          sessionId: input.sessionId,
          planetName: input.planetName,
          correct: input.correct ? 1 : 0,
          attemptNumber: input.attemptNumber,
          xpAwarded,
        });
        return { xpAwarded };
      }),

    // Complete a session, save final stats, log to Google Sheets, and fire Dopamine Report
    completeSession: publicProcedure
      .input(z.object({
        sessionId: z.number(),
        studentId: z.string().default("anonymous"),
        studentName: z.string().default("Space Explorer"),
        score: z.number(),
        xp: z.number(),
        starsEarned: z.number(),
        correctCount: z.number(),
        timeSpentSec: z.number(),
        attentionDriftCount: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        // 1. Update the game session in the database
        await updateGameSession(input.sessionId, {
          score: input.score,
          xp: input.xp,
          starsEarned: input.starsEarned,
          correctCount: input.correctCount,
          timeSpentSec: input.timeSpentSec,
          attentionDriftCount: input.attentionDriftCount,
          completed: 1,
          completedAt: new Date(),
        });

        // Calculate score percentage (max score = 8 planets × 200 pts = 1600)
        const scorePercent = Math.min(100, (input.score / 1600) * 100);

        // 2. Log metrics to Google Sheets Focus Tracker (non-blocking)
        logFocusMetrics({
          studentId: input.studentId,
          studentName: input.studentName,
          scorePercent,
          timeSpentSec: input.timeSpentSec,
          attentionDriftCount: input.attentionDriftCount,
          correctCount: input.correctCount,
          totalXP: input.xp,
          starsEarned: input.starsEarned,
          module: "Solar System Lab",
        }).catch(err => console.error("[Router] Sheets log error:", err));

        // 3. Fire Dopamine Report notification (non-blocking)
        fireDopamineReport({
          studentName: input.studentName,
          studentId: input.studentId,
          score: input.score,
          scorePercent,
          totalXP: input.xp,
          starsEarned: input.starsEarned,
          correctCount: input.correctCount,
          timeSpentSec: input.timeSpentSec,
          module: "Solar System Lab",
        }).catch(err => console.error("[Router] Dopamine report error:", err));

        return { success: true, scorePercent: Math.round(scorePercent) };
      }),

    // Get session details
    getSession: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return getGameSession(input.sessionId);
      }),

    // Get top completed sessions (leaderboard)
    getLeaderboard: publicProcedure
      .query(async () => {
        return getTopSessions(10);
      }),

    // Get session attempts for a specific session
    getAttempts: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return getSessionAttempts(input.sessionId);
      }),
  }),

  // Curriculum parsing — AI-powered quest generation from uploaded content
  curriculum: router({
    // Parse raw text into structured quest JSON
    parseText: publicProcedure
      .input(z.object({
        text: z.string().min(10),
        moduleHint: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return parseCurriculumToQuests(input.text, input.moduleHint);
      }),

    // Parse a Google Drive document by file ID
    parseGoogleDoc: publicProcedure
      .input(z.object({
        fileId: z.string(),
        moduleHint: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return parseGoogleDriveDocument(input.fileId, input.moduleHint);
      }),
  }),
});

export type AppRouter = typeof appRouter;
