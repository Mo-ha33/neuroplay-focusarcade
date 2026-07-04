/**
 * NeuroPlay AI — Curriculum Parser
 *
 * Ingests raw curriculum text (from Google Drive PDFs or plain text) and uses
 * the built-in LLM to produce a structured JSON quest schema:
 *   { question, correctAnswer, wrongAnswers[], visualAsset, funFact, ageGroup }
 *
 * This enables autonomous generation of new micro-quest modules from any
 * uploaded curriculum document without manual intervention.
 */

import { invokeLLM } from "../_core/llm";

export interface QuestItem {
  id: string;
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
  visualAsset: string; // emoji or icon key
  funFact: string;
  ageGroup: "7-10";
  difficulty: "easy" | "medium" | "hard";
}

export interface ParsedCurriculum {
  moduleTitle: string;
  subject: string;
  gradeLevel: string;
  questItems: QuestItem[];
  generatedAt: string;
}

const SYSTEM_PROMPT = `You are an expert elementary school curriculum designer specialising in ADHD-friendly, gamified learning for children aged 7-10.

Your task is to parse curriculum text and extract quiz/quest items in a structured JSON format.

Rules:
- Each question must be answerable by a child aged 7-10
- Use simple, encouraging language with emoji
- Provide exactly 3 wrong answers per question (plausible but clearly incorrect)
- Choose a relevant emoji as the visual asset
- Keep fun facts under 20 words
- Difficulty: easy (factual recall), medium (simple reasoning), hard (application)

Return ONLY valid JSON matching this schema exactly:
{
  "moduleTitle": "string",
  "subject": "string",
  "gradeLevel": "string",
  "questItems": [
    {
      "id": "q1",
      "question": "string with emoji",
      "correctAnswer": "string",
      "wrongAnswers": ["string", "string", "string"],
      "visualAsset": "single emoji",
      "funFact": "string under 20 words",
      "ageGroup": "7-10",
      "difficulty": "easy|medium|hard"
    }
  ],
  "generatedAt": "ISO timestamp"
}`;

/**
 * Parses raw curriculum text into a structured quest JSON using the LLM.
 * @param rawText - The curriculum content (from PDF extraction or plain text)
 * @param moduleHint - Optional hint for the module title
 */
export async function parseCurriculumToQuests(
  rawText: string,
  moduleHint?: string
): Promise<ParsedCurriculum> {
  const userPrompt = `Parse the following curriculum text into quiz quest items for elementary school children (ages 7-10) with ADHD.
${moduleHint ? `Module hint: ${moduleHint}` : ""}

Curriculum text:
---
${rawText.slice(0, 4000)}
---

Generate 8-12 quest items. Return only valid JSON.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      model: "gpt-4o-mini",
      max_tokens: 3000,
    });

    const rawContent = response?.choices?.[0]?.message?.content;
    const content: string =
      typeof rawContent === "string"
        ? rawContent
        : Array.isArray(rawContent)
        ? rawContent
            .filter((p): p is import("../_core/llm").TextContent => p.type === "text")
            .map(p => p.text)
            .join("")
        : "";

    // Strip markdown code fences if present
    const jsonStr = content
      .replace(/^```(?:json)?\n?/m, "")
      .replace(/\n?```$/m, "")
      .trim();

    const parsed = JSON.parse(jsonStr) as ParsedCurriculum;
    parsed.generatedAt = new Date().toISOString();
    return parsed;
  } catch (err) {
    console.error("[CurriculumParser] Failed to parse curriculum:", err);
    // Return a fallback structure so the game can still run
    return {
      moduleTitle: moduleHint || "Science Module",
      subject: "Science",
      gradeLevel: "Elementary (Grades 2-4)",
      questItems: [],
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Fetches a Google Drive file's text content via gws export and parses it.
 * Supports Google Docs (text/plain export) and plain text files.
 */
export async function parseGoogleDriveDocument(
  fileId: string,
  moduleHint?: string
): Promise<ParsedCurriculum> {
  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);
  const { writeFileSync, readFileSync, unlinkSync } = await import("fs");
  const tmpPath = `/tmp/curriculum_${fileId}.txt`;

  try {
    // Export Google Doc as plain text
    await execFileAsync("gws", [
      "drive",
      "files",
      "export",
      "--params",
      JSON.stringify({ fileId, mimeType: "text/plain" }),
      "--output",
      tmpPath,
    ]);

    const rawText = readFileSync(tmpPath, "utf-8");
    unlinkSync(tmpPath);
    return parseCurriculumToQuests(rawText, moduleHint);
  } catch (err) {
    console.error("[CurriculumParser] Failed to fetch Drive document:", err);
    return parseCurriculumToQuests("", moduleHint);
  }
}
