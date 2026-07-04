/**
 * useIngestionConfig.ts
 *
 * Manages the Phase A "Ingestion Hub" state:
 *   - Tracks whether the user has completed the ContentStudio form
 *   - Stores the submitted ContentStudioConfig for downstream use by the AI Tutor
 *
 * Deliberately isolated from useGameState so the existing game logic is
 * never modified.
 */

import { useState, useCallback } from "react";
import type { ContentStudioConfig } from "../components/ContentStudio";

export type IngestionPhase = "ingestion" | "welcome";

export interface IngestionState {
  /** Current phase of the ingestion flow */
  phase: IngestionPhase;
  /** The config submitted by the user in ContentStudio, or null if not yet set */
  config: ContentStudioConfig | null;
}

export function useIngestionConfig() {
  const [ingestionState, setIngestionState] = useState<IngestionState>({
    phase: "ingestion",
    config: null,
  });

  /**
   * Called when the user clicks "Launch Space Tutor 🚀" in ContentStudio.
   * Stores the config and advances the phase to "welcome" so SpaceLabGame
   * can render the WelcomeScreen → game flow as normal.
   */
  const submitConfig = useCallback((config: ContentStudioConfig) => {
    setIngestionState({ phase: "welcome", config });
  }, []);

  /**
   * Resets back to the ingestion screen (e.g. after game completion,
   * if the user wants to load a different curriculum).
   */
  const resetIngestion = useCallback(() => {
    setIngestionState({ phase: "ingestion", config: null });
  }, []);

  return {
    ingestionState,
    submitConfig,
    resetIngestion,
  };
}
