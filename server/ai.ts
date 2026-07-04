/**
 * ai.ts — NeuroPlay AI: Content Processing & Quiz Generation
 *
 * Implements:
 *  1. processContent  — Summarises raw curriculum text/PDF into structured JSON
 *  2. generateQuiz    — Produces Zod-validated quiz questions from curriculum
 *  3. streamTutor     — Express SSE endpoint for Gemini streaming chat
 *
 * All calls are routed through the built-in invokeLLM proxy so credentials
 * stay server-side. Every operation is instrumented via audit.ts.
 */

import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { audit, auditTimer } from "./audit";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const CurriculumSummarySchema = z.object({
  title: z.string().describe("Module title"),
  gradeLevel: z.string().describe("Target grade level"),
  keyTopics: z.array(z.string()).describe("Main topics covered (max 8)"),
  learningObjectives: z.array(z.string()).describe("What students will learn"),
  funFacts: z.array(z.string()).describe("Engaging fun facts for ADHD engagement (max 5)"),
  vocabularyWords: z.array(
    z.object({
      word: z.string(),
      definition: z.string(),
      emoji: z.string(),
    })
  ).describe("Key vocabulary with kid-friendly definitions"),
});

export type CurriculumSummary = z.infer<typeof CurriculumSummarySchema>;

export const QuizQuestionSchema = z.object({
  id: z.string(),
  question: z.string().describe("Short, clear question (max 15 words)"),
  options: z.array(z.string()).length(4).describe("Exactly 4 answer options"),
  correctIndex: z.number().min(0).max(3).describe("Index of the correct answer (0-3)"),
  explanation: z.string().describe("Brief, encouraging explanation for the correct answer"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  emoji: z.string().describe("Relevant emoji for visual engagement"),
  xpReward: z.number().describe("XP points for correct answer"),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizBatchSchema = z.object({
  moduleTitle: z.string(),
  totalXP: z.number(),
  questions: z.array(QuizQuestionSchema).min(3).max(10),
});

export type QuizBatch = z.infer<typeof QuizBatchSchema>;

// ─── Content Processing ───────────────────────────────────────────────────────

export async function processContent(params: {
  topic: string;
  rawText?: string;
  learningStyle: string;
  difficulty: string;
}): Promise<CurriculumSummary> {
  const timer = auditTimer();
  audit.info("content_process", "Starting curriculum content processing", {
    topic: params.topic,
    learningStyle: params.learningStyle,
    difficulty: params.difficulty,
    hasRawText: !!params.rawText,
  });

  const systemPrompt = `You are NeuroPlay AI, an expert educational content processor specializing in ADHD-friendly learning for children aged 7-10.
Your task is to analyze curriculum content and extract structured learning data.
Keep all language simple, engaging, and age-appropriate.
Use short sentences. Avoid jargon. Make it fun and exciting!`;

  const userPrompt = `Process this curriculum content for a ${params.difficulty} difficulty ${params.learningStyle} learning module about: "${params.topic}"

${params.rawText ? `Raw curriculum content:\n${params.rawText.slice(0, 8000)}` : `Generate content based on the topic: ${params.topic}`}

Return a structured JSON with:
- title: engaging module title
- gradeLevel: appropriate grade level
- keyTopics: up to 8 main topics (short phrases)
- learningObjectives: 3-5 clear learning goals
- funFacts: 5 amazing, surprising facts kids will love
- vocabularyWords: 5-8 key words with kid-friendly definitions and relevant emojis`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "curriculum_summary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              gradeLevel: { type: "string" },
              keyTopics: { type: "array", items: { type: "string" } },
              learningObjectives: { type: "array", items: { type: "string" } },
              funFacts: { type: "array", items: { type: "string" } },
              vocabularyWords: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    word: { type: "string" },
                    definition: { type: "string" },
                    emoji: { type: "string" },
                  },
                  required: ["word", "definition", "emoji"],
                  additionalProperties: false,
                },
              },
            },
            required: ["title", "gradeLevel", "keyTopics", "learningObjectives", "funFacts", "vocabularyWords"],
            additionalProperties: false,
          },
        },
      },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from LLM");

    const parsed = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
    const validated = CurriculumSummarySchema.parse(parsed);

    const ms = timer.stop();
    audit.success("content_process", "Curriculum processed successfully", {
      title: validated.title,
      topicCount: validated.keyTopics.length,
    }, ms);

    return validated;
  } catch (err) {
    const ms = timer.stop();
    audit.error("content_process", "Content processing failed", {
      error: String(err),
      topic: params.topic,
    }, ms);
    throw err;
  }
}

// ─── Quiz Generation ──────────────────────────────────────────────────────────

export async function generateQuiz(params: {
  topic: string;
  curriculumSummary?: CurriculumSummary;
  difficulty: string;
  questionCount?: number;
}): Promise<QuizBatch> {
  const timer = auditTimer();
  const count = params.questionCount ?? 5;

  audit.info("quiz_gen", "Generating quiz questions", {
    topic: params.topic,
    difficulty: params.difficulty,
    questionCount: count,
  });

  const difficultyMap: Record<string, { xp: number; desc: string }> = {
    Easy: { xp: 50, desc: "simple, straightforward questions for beginners" },
    Medium: { xp: 100, desc: "moderately challenging questions" },
    "Boss Level": { xp: 200, desc: "challenging, deep-thinking questions" },
  };
  const diffConfig = difficultyMap[params.difficulty] ?? difficultyMap["Medium"];

  const contextBlock = params.curriculumSummary
    ? `Module: ${params.curriculumSummary.title}
Key Topics: ${params.curriculumSummary.keyTopics.join(", ")}
Learning Objectives: ${params.curriculumSummary.learningObjectives.join("; ")}`
    : `Topic: ${params.topic}`;

  const systemPrompt = `You are NeuroPlay AI Quiz Master, creating ADHD-friendly quiz questions for children aged 7-10.
Rules:
- Questions must be SHORT (max 15 words)
- Use simple, fun language
- Include one clearly correct answer
- Make wrong answers plausible but obviously wrong to someone who studied
- Add encouraging explanations
- Each question gets a relevant emoji`;

  const userPrompt = `Create exactly ${count} ${diffConfig.desc} quiz questions about:
${contextBlock}

Each question must have:
- A unique id (q1, q2, q3...)
- Exactly 4 answer options
- The correct answer index (0-3)
- A brief encouraging explanation
- difficulty: "${params.difficulty.toLowerCase() === "boss level" ? "hard" : params.difficulty.toLowerCase()}"
- An emoji
- xpReward: ${diffConfig.xp}

Return as JSON with fields: moduleTitle, totalXP, questions[]`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "quiz_batch",
          strict: true,
          schema: {
            type: "object",
            properties: {
              moduleTitle: { type: "string" },
              totalXP: { type: "number" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correctIndex: { type: "number" },
                    explanation: { type: "string" },
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                    emoji: { type: "string" },
                    xpReward: { type: "number" },
                  },
                  required: ["id", "question", "options", "correctIndex", "explanation", "difficulty", "emoji", "xpReward"],
                  additionalProperties: false,
                },
              },
            },
            required: ["moduleTitle", "totalXP", "questions"],
            additionalProperties: false,
          },
        },
      },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from LLM");

    const parsed = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
    const validated = QuizBatchSchema.parse(parsed);

    const ms = timer.stop();
    audit.success("quiz_gen", "Quiz generated successfully", {
      moduleTitle: validated.moduleTitle,
      questionCount: validated.questions.length,
      totalXP: validated.totalXP,
    }, ms);

    return validated;
  } catch (err) {
    const ms = timer.stop();
    audit.error("quiz_gen", "Quiz generation failed", {
      error: String(err),
      topic: params.topic,
    }, ms);
    throw err;
  }
}

// ─── Streaming Tutor System Prompt Builder ────────────────────────────────────

export function buildTutorSystemPrompt(config: {
  topic: string;
  learningStyle: string;
  difficulty: string;
  curriculumSummary?: CurriculumSummary;
}): string {
  const styleGuides: Record<string, string> = {
    "ADHD Socratic": "Ask one short question at a time. Wait for the child to answer. Give instant praise. Never lecture for more than 2 sentences.",
    "Storytelling": "Tell everything as an exciting space adventure story. Use vivid descriptions. Make the child the hero.",
    "Bullet Points Only": "Always use bullet points. Max 3 bullets per response. Use emojis before each bullet.",
    "Gamified": "Frame everything as a game. Award XP points for correct answers. Use game terminology (quest, level up, boss battle).",
  };

  const style = styleGuides[config.learningStyle] ?? styleGuides["ADHD Socratic"];

  const contextBlock = config.curriculumSummary
    ? `You are teaching: ${config.curriculumSummary.title}
Key topics: ${config.curriculumSummary.keyTopics.slice(0, 5).join(", ")}
Fun facts to share: ${config.curriculumSummary.funFacts.slice(0, 3).join(" | ")}`
    : `You are teaching about: ${config.topic}`;

  return `You are Nova, the NeuroPlay AI Space Tutor — a friendly, energetic AI guide for children aged 7-10 with ADHD.

${contextBlock}

Difficulty level: ${config.difficulty}
Teaching style: ${style}

STRICT RULES:
1. NEVER write more than 3 sentences in a single response
2. ALWAYS use simple words (grade 2-3 reading level)
3. ALWAYS add 1-2 relevant emojis in every response
4. ALWAYS give instant positive reinforcement ("Amazing! 🌟", "You're a star! ⭐")
5. If a child seems confused, simplify further and use an analogy
6. Keep responses SHORT and PUNCHY — ADHD brains need quick wins
7. End each response with either a question OR an encouraging call-to-action`;
}
