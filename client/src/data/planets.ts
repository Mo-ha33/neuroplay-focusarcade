// Solar System Planet Data — 8 planets with clues, colors, and orbital info

export interface Planet {
  id: string;
  name: string;
  orbitOrder: number; // 1 = closest to Sun, 8 = farthest
  emoji: string;
  color: string;
  glowColor: string;
  size: number; // relative size in px for the planet token
  clues: string[];
  funFact: string;
  bgGradient: string;
}

export const PLANETS: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    orbitOrder: 1,
    emoji: "⚫",
    color: "#B5B5B5",
    glowColor: "rgba(181,181,181,0.6)",
    size: 40,
    clues: [
      "I am the closest planet to the Sun! ☀️",
      "I am the smallest planet in our Solar System! 🔭",
      "A year on me is only 88 Earth days! ⚡",
    ],
    funFact: "Mercury has no atmosphere, so it gets super hot AND super cold!",
    bgGradient: "linear-gradient(135deg, #B5B5B5, #888888)",
  },
  {
    id: "venus",
    name: "Venus",
    orbitOrder: 2,
    emoji: "🟡",
    color: "#E8C84A",
    glowColor: "rgba(232,200,74,0.6)",
    size: 52,
    clues: [
      "I am the second planet from the Sun! 🌟",
      "I am the hottest planet — even hotter than Mercury! 🔥",
      "I spin backwards compared to most planets! 🔄",
    ],
    funFact: "Venus is so hot it could melt lead! It's covered in thick clouds.",
    bgGradient: "linear-gradient(135deg, #E8C84A, #C4952A)",
  },
  {
    id: "earth",
    name: "Earth",
    orbitOrder: 3,
    emoji: "🌍",
    color: "#4A9EE8",
    glowColor: "rgba(74,158,232,0.6)",
    size: 54,
    clues: [
      "I am the third planet from the Sun! 🌍",
      "I am the only planet known to have life! 🌱",
      "I have one moon and lots of liquid water! 💧",
    ],
    funFact: "Earth is the only planet not named after a god or goddess!",
    bgGradient: "linear-gradient(135deg, #4A9EE8, #2E7D32)",
  },
  {
    id: "mars",
    name: "Mars",
    orbitOrder: 4,
    emoji: "🔴",
    color: "#E84A4A",
    glowColor: "rgba(232,74,74,0.6)",
    size: 46,
    clues: [
      "I am the fourth planet from the Sun! 🚀",
      "I am called the Red Planet because of my rusty color! 🔴",
      "I have the tallest volcano in the Solar System! 🌋",
    ],
    funFact: "Mars has dust storms that can cover the whole planet for months!",
    bgGradient: "linear-gradient(135deg, #E84A4A, #B71C1C)",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    orbitOrder: 5,
    emoji: "🟠",
    color: "#E8A44A",
    glowColor: "rgba(232,164,74,0.6)",
    size: 80,
    clues: [
      "I am the fifth planet from the Sun! 🌟",
      "I am the BIGGEST planet in the Solar System! 🏆",
      "I have a giant storm called the Great Red Spot! 🌀",
    ],
    funFact: "Jupiter is so big that 1,300 Earths could fit inside it!",
    bgGradient: "linear-gradient(135deg, #E8A44A, #8D4E00)",
  },
  {
    id: "saturn",
    name: "Saturn",
    orbitOrder: 6,
    emoji: "🪐",
    color: "#E8D44A",
    glowColor: "rgba(232,212,74,0.6)",
    size: 72,
    clues: [
      "I am the sixth planet from the Sun! 💫",
      "I have beautiful rings made of ice and rock! 💍",
      "I am so light I could float on water! 🌊",
    ],
    funFact: "Saturn's rings are made of billions of pieces of ice and rock!",
    bgGradient: "linear-gradient(135deg, #E8D44A, #A0860A)",
  },
  {
    id: "uranus",
    name: "Uranus",
    orbitOrder: 7,
    emoji: "🔵",
    color: "#4AE8D4",
    glowColor: "rgba(74,232,212,0.6)",
    size: 62,
    clues: [
      "I am the seventh planet from the Sun! 🌀",
      "I am an ice giant and I spin on my side! 🔄",
      "I appear blue-green because of methane gas! 💨",
    ],
    funFact: "Uranus rolls around the Sun like a bowling ball — it's tilted 98 degrees!",
    bgGradient: "linear-gradient(135deg, #4AE8D4, #006064)",
  },
  {
    id: "neptune",
    name: "Neptune",
    orbitOrder: 8,
    emoji: "🔵",
    color: "#4A6AE8",
    glowColor: "rgba(74,106,232,0.6)",
    size: 60,
    clues: [
      "I am the eighth and farthest planet from the Sun! 🌌",
      "I have the strongest winds in the Solar System! 💨",
      "One year on me takes 165 Earth years! ⏳",
    ],
    funFact: "Neptune's winds are so fast they could blow a car off a highway!",
    bgGradient: "linear-gradient(135deg, #4A6AE8, #1A237E)",
  },
];

export const TOTAL_PLANETS = PLANETS.length;
export const XP_PER_CORRECT = 100;
export const STARS_PER_CORRECT = 1;
export const BRAIN_BREAK_INTERVAL = 3; // every 3 correct answers
export const BRAIN_BREAK_DURATION = 30; // seconds
