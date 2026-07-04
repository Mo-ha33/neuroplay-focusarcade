/**
 * DiceBear Avatars API integration
 * ─────────────────────────────────
 * Endpoint: https://api.dicebear.com/9.x/{style}/svg?seed={seed}&...
 *
 * We use the "bottts-neutral" style (sci-fi robot/astronaut aesthetic)
 * which is perfect for our space-themed ADHD game.
 *
 * Fallback: if the URL fails to load, we render a local emoji avatar.
 *
 * Strict TypeScript — zero `any` types.
 */

export type DiceBearStyle =
  | "bottts-neutral"   // sci-fi robots — primary choice
  | "adventurer"       // cartoon characters
  | "pixel-art"        // retro pixel art
  | "lorelei";         // illustrated

export interface AvatarConfig {
  /** Seed string — typically the student name or ID */
  seed: string;
  /** DiceBear style to use */
  style?: DiceBearStyle;
  /** Size in px (used as width/height query param) */
  size?: number;
  /** Background colour (hex without #) */
  backgroundColor?: string;
  /** Radius 0–50 for rounded corners */
  radius?: number;
}

export interface AvatarResult {
  /** Fully-qualified SVG URL */
  url: string;
  /** Fallback emoji if the URL fails */
  fallbackEmoji: string;
  /** The seed used */
  seed: string;
}

// Deterministic emoji fallback based on seed hash
const FALLBACK_EMOJIS = ["👨‍🚀", "👩‍🚀", "🤖", "👾", "🛸", "🌟", "🚀", "🪐"];

function seedToIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % FALLBACK_EMOJIS.length;
}

/**
 * Build a DiceBear avatar URL (no network call — just URL construction).
 * The browser fetches the SVG lazily when the <img> renders.
 */
export function buildAvatarUrl(config: AvatarConfig): AvatarResult {
  const {
    seed,
    style = "bottts-neutral",
    size = 80,
    backgroundColor = "0F172A",
    radius = 50,
  } = config;

  // Sanitise seed: strip special chars, lowercase
  const safeSeed = encodeURIComponent(seed.trim().toLowerCase() || "explorer");

  const params = new URLSearchParams({
    seed: safeSeed,
    size: String(size),
    backgroundColor: backgroundColor,
    radius: String(radius),
  });

  const url = `https://api.dicebear.com/9.x/${style}/svg?${params.toString()}`;

  return {
    url,
    fallbackEmoji: FALLBACK_EMOJIS[seedToIndex(seed)] ?? "👨‍🚀",
    seed,
  };
}

/**
 * Pre-build avatar URLs for multiple styles (used in avatar picker).
 */
export function buildAvatarVariants(seed: string): AvatarResult[] {
  const styles: DiceBearStyle[] = [
    "bottts-neutral",
    "adventurer",
    "pixel-art",
  ];
  return styles.map(style => buildAvatarUrl({ seed, style }));
}
