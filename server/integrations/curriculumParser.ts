/**
 * Curriculum Parser Stub
 * Provides mock implementations for the filesRouter demo.
 */
export interface ParsedCurriculum {
  title: string;
  quests: Array<{
    question: string;
    correctAnswer: string;
    visualAsset: string;
    difficulty: string;
  }>;
}

export async function parseCurriculumToQuests(
  text: string,
  moduleHint?: string
): Promise<ParsedCurriculum> {
  return {
    title: moduleHint || "Solar System Lab",
    quests: [
      {
        question: "Which planet is closest to the Sun?",
        correctAnswer: "Mercury",
        visualAsset: "🪐",
        difficulty: "Easy",
      },
      {
        question: "Which planet is known as the Red Planet?",
        correctAnswer: "Mars",
        visualAsset: "🔴",
        difficulty: "Easy",
      },
      {
        question: "Which is the largest planet in our Solar System?",
        correctAnswer: "Jupiter",
        visualAsset: "🟠",
        difficulty: "Medium",
      },
    ],
  };
}
