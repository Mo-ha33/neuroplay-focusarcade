import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module so tests run without a real database
vi.mock("./db", () => ({
  createGameSession: vi.fn().mockResolvedValue(42),
  updateGameSession: vi.fn().mockResolvedValue(undefined),
  getGameSession: vi.fn().mockResolvedValue({
    id: 42,
    studentId: "test_student",
    studentName: "Test Explorer",
    score: 800,
    xp: 800,
    starsEarned: 8,
    correctCount: 8,
    totalPlanets: 8,
    timeSpentSec: 120,
    attentionDriftCount: 0,
    completed: 1,
    completedAt: new Date(),
    createdAt: new Date(),
  }),
  getTopSessions: vi.fn().mockResolvedValue([]),
  recordPlanetAttempt: vi.fn().mockResolvedValue(1),
  getSessionAttempts: vi.fn().mockResolvedValue([]),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("game.createSession", () => {
  it("creates a session and returns a sessionId", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.game.createSession({
      studentId: "student_001",
      studentName: "Alex",
    });
    expect(result).toHaveProperty("sessionId");
    expect(typeof result.sessionId).toBe("number");
  });

  it("uses default studentName when not provided", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.game.createSession({});
    expect(result.sessionId).toBe(42);
  });
});

describe("game.recordAttempt", () => {
  it("awards 100 XP for a correct answer", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.game.recordAttempt({
      sessionId: 42,
      planetName: "Mercury",
      correct: true,
      attemptNumber: 1,
    });
    expect(result.xpAwarded).toBe(100);
  });

  it("awards 0 XP for an incorrect answer", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.game.recordAttempt({
      sessionId: 42,
      planetName: "Venus",
      correct: false,
      attemptNumber: 1,
    });
    expect(result.xpAwarded).toBe(0);
  });
});

describe("game.completeSession", () => {
  it("completes a session successfully", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.game.completeSession({
      sessionId: 42,
      score: 800,
      xp: 800,
      starsEarned: 8,
      correctCount: 8,
      timeSpentSec: 120,
      attentionDriftCount: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("game.getSession", () => {
  it("retrieves a session by id", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const session = await caller.game.getSession({ sessionId: 42 });
    expect(session).toBeDefined();
    expect(session?.studentName).toBe("Test Explorer");
    expect(session?.correctCount).toBe(8);
  });
});

describe("game.getLeaderboard", () => {
  it("returns an array of completed sessions", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const board = await caller.game.getLeaderboard();
    expect(Array.isArray(board)).toBe(true);
  });
});
