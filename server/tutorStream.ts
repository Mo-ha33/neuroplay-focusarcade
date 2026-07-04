/**
 * tutorStream.ts — NeuroPlay AI Streaming Tutor (SSE)
 *
 * Express route: POST /api/tutor/stream
 *
 * Streams Gemini-powered AI tutor responses via Server-Sent Events.
 * Integrates with the built-in LLM proxy (invokeLLM with stream: true).
 * Fully instrumented with the audit layer.
 */

import type { Request, Response } from "express";
import { ENV } from "./_core/env";
import { audit, auditTimer } from "./audit";
import { buildTutorSystemPrompt } from "./ai";
import type { CurriculumSummary } from "./ai";

interface TutorStreamBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  topic: string;
  learningStyle: string;
  difficulty: string;
  curriculumSummary?: CurriculumSummary;
  sessionId?: number;
}

export async function handleTutorStream(req: Request, res: Response): Promise<void> {
  const timer = auditTimer();
  const body = req.body as TutorStreamBody;

  const {
    messages = [],
    topic = "Solar System",
    learningStyle = "ADHD Socratic",
    difficulty = "Easy",
    curriculumSummary,
    sessionId,
  } = body;

  audit.info("ai_call", "Tutor stream request received", {
    topic,
    learningStyle,
    difficulty,
    messageCount: messages.length,
    sessionId,
  });

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let finished = false;

  // Cleanup on client disconnect
  res.on("close", () => {
    finished = true;
    audit.info("ai_call", "Client disconnected from tutor stream", { sessionId });
  });

  const systemPrompt = buildTutorSystemPrompt({
    topic,
    learningStyle,
    difficulty,
    curriculumSummary,
  });

  const apiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  try {
    const apiUrl = ENV.forgeApiUrl
      ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
      : "https://forge.manus.im/v1/chat/completions";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        messages: apiMessages,
        stream: true,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM stream failed: ${response.status} ${errorText}`);
    }

    if (!response.body) {
      throw new Error("No response body from LLM stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let tokenCount = 0;

    while (!finished) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (finished) break;
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") {
          if (trimmed === "data: [DONE]") {
            res.write("data: [DONE]\n\n");
          }
          continue;
        }
        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              tokenCount++;
              res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            }
          } catch {
            // Malformed SSE chunk — skip
          }
        }
      }
    }

    const ms = timer.stop();
    audit.success("ai_call", "Tutor stream completed", {
      topic,
      tokenCount,
      sessionId,
    }, ms);

    if (!finished) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } catch (err) {
    const ms = timer.stop();
    audit.error("ai_call", "Tutor stream error", {
      error: String(err),
      topic,
      sessionId,
    }, ms);

    if (!finished && !res.writableEnded) {
      res.write(
        `data: ${JSON.stringify({ error: "Tutor stream failed. Please try again!" })}\n\n`
      );
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
}
