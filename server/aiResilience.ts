/**
 * AI Multi-Model Resilience Layer
 * ────────────────────────────────
 * Primary:   Google Gemini 1.5 Flash (via @ai-sdk/google)
 * Fallback 1: OpenRouter (free tier, multiple models)
 * Fallback 2: Groq (llama-3 ultra-fast inference)
 * Fallback 3: Static local responses (always available)
 *
 * The waterfall is triggered automatically on:
 *   - HTTP 429 (rate limit)
 *   - HTTP 503 (service unavailable)
 *   - Network timeout (5 s)
 *   - Any unhandled exception
 *
 * Strict TypeScript — zero `any` types.
 */

import { ENV } from "./_core/env";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiResponse {
  content: string;
  model: string;
  provider: "gemini" | "openrouter" | "groq" | "local";
  latencyMs: number;
}

export interface AiRequestOptions {
  messages: AiMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Timeout in milliseconds before trying the next provider */
  timeoutMs?: number;
}

// ─── Provider implementations ─────────────────────────────────────────────────

type ProviderName = "gemini" | "openrouter" | "groq";

interface ProviderConfig {
  name: ProviderName;
  baseUrl: string;
  apiKeyEnvVar: string;
  model: string;
  authHeader: (key: string) => Record<string, string>;
}

const PROVIDERS: ProviderConfig[] = [
  {
    name: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKeyEnvVar: "GEMINI_API_KEY",
    model: "gemini-1.5-flash",
    authHeader: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
  {
    name: "openrouter",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKeyEnvVar: "OPENROUTER_API_KEY",
    model: "meta-llama/llama-3.1-8b-instruct:free",
    authHeader: (key: string) => ({
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://neuroplay-focusarcade.vercel.app",
      "X-Title": "NeuroPlay AI FocusArcade",
    }),
  },
  {
    name: "groq",
    baseUrl: "https://api.groq.com/openai/v1",
    apiKeyEnvVar: "GROQ_API_KEY",
    model: "llama3-8b-8192",
    authHeader: (key: string) => ({ Authorization: `Bearer ${key}` }),
  },
];

// ─── OpenAI-compatible chat completions request/response types ────────────────

interface ChatCompletionRequest {
  model: string;
  messages: AiMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface ChatCompletionChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface ChatCompletionResponse {
  id: string;
  choices: ChatCompletionChoice[];
  model: string;
}

// ─── Local static fallback responses ─────────────────────────────────────────

const STATIC_RESPONSES: Record<string, string> = {
  default:
    "Great job exploring the Solar System! Keep going — you're doing amazing! 🚀",
  hint: "Think about which planet is closest to the Sun. Start from position 1! ☀️",
  encouragement:
    "You're a real Space Explorer! Every planet you place brings you closer to the stars! 🌟",
};

function getStaticFallback(messages: AiMessage[]): AiResponse {
  const lastUserMsg = [...messages]
    .reverse()
    .find(m => m.role === "user")?.content.toLowerCase() ?? "";

  let content = STATIC_RESPONSES["default"] ?? "";
  if (lastUserMsg.includes("hint") || lastUserMsg.includes("help")) {
    content = STATIC_RESPONSES["hint"] ?? "";
  } else if (
    lastUserMsg.includes("good") ||
    lastUserMsg.includes("great") ||
    lastUserMsg.includes("done")
  ) {
    content = STATIC_RESPONSES["encouragement"] ?? "";
  }

  return {
    content,
    model: "static-fallback",
    provider: "local",
    latencyMs: 0,
  };
}

// ─── Single-provider attempt ──────────────────────────────────────────────────

async function tryProvider(
  provider: ProviderConfig,
  options: AiRequestOptions
): Promise<AiResponse> {
  const apiKey = process.env[provider.apiKeyEnvVar];
  if (!apiKey) {
    throw new Error(`Missing env var: ${provider.apiKeyEnvVar}`);
  }

  const timeoutMs = options.timeoutMs ?? 8000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const body: ChatCompletionRequest = {
    model: provider.model,
    messages: options.messages,
    ...(options.maxTokens !== undefined && { max_tokens: options.maxTokens }),
    ...(options.temperature !== undefined && { temperature: options.temperature }),
  };

  const startMs = Date.now();

  try {
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...provider.authHeader(apiKey),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.status === 429 || res.status === 503) {
      throw new Error(`Provider ${provider.name} rate-limited: HTTP ${res.status}`);
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        `Provider ${provider.name} error: HTTP ${res.status} — ${errText.slice(0, 200)}`
      );
    }

    const data = (await res.json()) as ChatCompletionResponse;
    const content = data.choices[0]?.message?.content ?? "";

    return {
      content,
      model: data.model || provider.model,
      provider: provider.name,
      latencyMs: Date.now() - startMs,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Main exported function ───────────────────────────────────────────────────

/**
 * Invoke the AI with automatic multi-provider fallback.
 *
 * Waterfall order:
 *   1. Manus built-in LLM (forge proxy — always available in Manus environment)
 *   2. Gemini 1.5 Flash
 *   3. OpenRouter (free llama-3)
 *   4. Groq (llama-3)
 *   5. Static local response (never fails)
 */
export async function invokeAiWithFallback(
  options: AiRequestOptions
): Promise<AiResponse> {
  const errors: string[] = [];

  // ── Tier 0: Manus built-in forge proxy (always available in Manus env) ──────
  if (ENV.forgeApiKey && ENV.forgeApiUrl) {
    try {
      const startMs = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);

      const forgeBody: ChatCompletionRequest = {
        model: "gemini-1.5-flash",
        messages: options.messages,
        ...(options.maxTokens !== undefined && { max_tokens: options.maxTokens }),
        ...(options.temperature !== undefined && { temperature: options.temperature }),
      };

      const res = await fetch(`${ENV.forgeApiUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ENV.forgeApiKey}`,
        },
        body: JSON.stringify(forgeBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = (await res.json()) as ChatCompletionResponse;
        const content = data.choices[0]?.message?.content ?? "";
        return {
          content,
          model: "gemini-1.5-flash",
          provider: "gemini",
          latencyMs: Date.now() - startMs,
        };
      }

      if (res.status !== 429 && res.status !== 503) {
        // Non-retriable error — skip to external providers
        errors.push(`forge: HTTP ${res.status}`);
      } else {
        errors.push(`forge: rate-limited HTTP ${res.status}`);
      }
    } catch (err) {
      errors.push(`forge: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ── Tiers 1–3: External providers waterfall ───────────────────────────────
  for (const provider of PROVIDERS) {
    try {
      const result = await tryProvider(provider, options);
      if (errors.length > 0) {
        console.warn(
          `[AI Resilience] Primary failed (${errors.join(", ")}), used ${provider.name}`
        );
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${provider.name}: ${msg}`);
      console.warn(`[AI Resilience] Provider ${provider.name} failed: ${msg}`);
    }
  }

  // ── Tier 4: Static local fallback (never fails) ───────────────────────────
  console.warn(
    `[AI Resilience] All providers failed (${errors.join(" | ")}). Using static fallback.`
  );
  return getStaticFallback(options.messages);
}
