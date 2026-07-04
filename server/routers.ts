import { COOKIE_NAME } from "@shared/const";
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

export const appRouter = router({
  system: systemRouter,
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

    // Complete a session and save final stats
    completeSession: publicProcedure
      .input(z.object({
        sessionId: z.number(),
        score: z.number(),
        xp: z.number(),
        starsEarned: z.number(),
        correctCount: z.number(),
        timeSpentSec: z.number(),
        attentionDriftCount: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
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
        return { success: true };
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
  }),
});

export type AppRouter = typeof appRouter;
