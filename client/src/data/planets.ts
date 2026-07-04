/**
 * planets.ts — Solar System Planet Data (Bilingual EN/AR)
 * ========================================================
 * Each planet carries LocalizedString fields for name, clues, and funFact.
 * Use localStr(planet.name, lang) to resolve the active language string.
 */

// ── Bilingual string type ─────────────────────────────────────
export interface LocalizedString {
  en: string;
  ar: string;
}

/** Helper: resolve a LocalizedString to the active language string */
export function localStr(s: LocalizedString, lang: "en" | "ar"): string {
  return s[lang] ?? s.en;
}

// ── Planet interface ──────────────────────────────────────────
export interface Planet {
  id: string;
  name: LocalizedString;
  orbitOrder: number; // 1 = closest to Sun, 8 = farthest
  emoji: string;
  color: string;
  glowColor: string;
  size: number; // relative size in px for the planet token
  clues: LocalizedString[];
  funFact: LocalizedString;
  bgGradient: string;
}

// ── Planet Data ───────────────────────────────────────────────
export const PLANETS: Planet[] = [
  {
    id: "mercury",
    name: { en: "Mercury", ar: "عطارد" },
    orbitOrder: 1,
    emoji: "⚫",
    color: "#B5B5B5",
    glowColor: "rgba(181,181,181,0.6)",
    size: 40,
    clues: [
      { en: "I am the closest planet to the Sun! ☀️", ar: "أنا أقرب كوكب إلى الشمس! ☀️" },
      { en: "I am the smallest planet in our Solar System! 🔭", ar: "أنا أصغر كوكب في نظامنا الشمسي! 🔭" },
      { en: "A year on me is only 88 Earth days! ⚡", ar: "السنة عندي تساوي 88 يوماً أرضياً فقط! ⚡" },
    ],
    funFact: {
      en: "Mercury has no atmosphere, so it gets super hot AND super cold!",
      ar: "عطارد ليس له غلاف جوي، لذا يصبح ساخناً جداً وبارداً جداً!",
    },
    bgGradient: "linear-gradient(135deg, #B5B5B5, #888888)",
  },
  {
    id: "venus",
    name: { en: "Venus", ar: "الزهرة" },
    orbitOrder: 2,
    emoji: "🟡",
    color: "#E8C84A",
    glowColor: "rgba(232,200,74,0.6)",
    size: 52,
    clues: [
      { en: "I am the second planet from the Sun! 🌟", ar: "أنا الكوكب الثاني من الشمس! 🌟" },
      { en: "I am the hottest planet — even hotter than Mercury! 🔥", ar: "أنا أشد الكواكب حرارة — حتى أشد من عطارد! 🔥" },
      { en: "I spin backwards compared to most planets! 🔄", ar: "أدور في الاتجاه المعاكس لمعظم الكواكب! 🔄" },
    ],
    funFact: {
      en: "Venus is so hot it could melt lead! It's covered in thick clouds.",
      ar: "الزهرة ساخنة لدرجة تذوب فيها الرصاص! وهي مغطاة بسحب كثيفة.",
    },
    bgGradient: "linear-gradient(135deg, #E8C84A, #C4952A)",
  },
  {
    id: "earth",
    name: { en: "Earth", ar: "الأرض" },
    orbitOrder: 3,
    emoji: "🌍",
    color: "#4A9EE8",
    glowColor: "rgba(74,158,232,0.6)",
    size: 54,
    clues: [
      { en: "I am the third planet from the Sun! 🌍", ar: "أنا الكوكب الثالث من الشمس! 🌍" },
      { en: "I am the only planet known to have life! 🌱", ar: "أنا الكوكب الوحيد المعروف بوجود الحياة عليه! 🌱" },
      { en: "I have one moon and lots of liquid water! 💧", ar: "لدي قمر واحد وكميات كبيرة من الماء السائل! 💧" },
    ],
    funFact: {
      en: "Earth is the only planet not named after a god or goddess!",
      ar: "الأرض هي الكوكب الوحيد الذي لم يُسمَّ على اسم إله أو إلهة!",
    },
    bgGradient: "linear-gradient(135deg, #4A9EE8, #2E7D32)",
  },
  {
    id: "mars",
    name: { en: "Mars", ar: "المريخ" },
    orbitOrder: 4,
    emoji: "🔴",
    color: "#E84A4A",
    glowColor: "rgba(232,74,74,0.6)",
    size: 46,
    clues: [
      { en: "I am the fourth planet from the Sun! 🚀", ar: "أنا الكوكب الرابع من الشمس! 🚀" },
      { en: "I am called the Red Planet because of my rusty color! 🔴", ar: "يُطلق عليّ الكوكب الأحمر بسبب لوني الصدئ! 🔴" },
      { en: "I have the tallest volcano in the Solar System! 🌋", ar: "أمتلك أطول بركان في النظام الشمسي! 🌋" },
    ],
    funFact: {
      en: "Mars has dust storms that can cover the whole planet for months!",
      ar: "للمريخ عواصف غبار يمكنها تغطية الكوكب بأكمله لأشهر!",
    },
    bgGradient: "linear-gradient(135deg, #E84A4A, #B71C1C)",
  },
  {
    id: "jupiter",
    name: { en: "Jupiter", ar: "المشتري" },
    orbitOrder: 5,
    emoji: "🟠",
    color: "#E8A44A",
    glowColor: "rgba(232,164,74,0.6)",
    size: 80,
    clues: [
      { en: "I am the fifth planet from the Sun! 🌟", ar: "أنا الكوكب الخامس من الشمس! 🌟" },
      { en: "I am the BIGGEST planet in the Solar System! 🏆", ar: "أنا أكبر كوكب في النظام الشمسي! 🏆" },
      { en: "I have a giant storm called the Great Red Spot! 🌀", ar: "لديّ عاصفة عملاقة تُسمى البقعة الحمراء الكبرى! 🌀" },
    ],
    funFact: {
      en: "Jupiter is so big that 1,300 Earths could fit inside it!",
      ar: "المشتري كبير جداً لدرجة أن 1300 كوكب أرض يمكن أن تتسع داخله!",
    },
    bgGradient: "linear-gradient(135deg, #E8A44A, #8D4E00)",
  },
  {
    id: "saturn",
    name: { en: "Saturn", ar: "زحل" },
    orbitOrder: 6,
    emoji: "🪐",
    color: "#E8D44A",
    glowColor: "rgba(232,212,74,0.6)",
    size: 72,
    clues: [
      { en: "I am the sixth planet from the Sun! 💫", ar: "أنا الكوكب السادس من الشمس! 💫" },
      { en: "I have beautiful rings made of ice and rock! 💍", ar: "لديّ حلقات جميلة مصنوعة من الجليد والصخور! 💍" },
      { en: "I am so light I could float on water! 🌊", ar: "أنا خفيف جداً لدرجة يمكنني الطفو على الماء! 🌊" },
    ],
    funFact: {
      en: "Saturn's rings are made of billions of pieces of ice and rock!",
      ar: "حلقات زحل مصنوعة من مليارات القطع من الجليد والصخور!",
    },
    bgGradient: "linear-gradient(135deg, #E8D44A, #A0860A)",
  },
  {
    id: "uranus",
    name: { en: "Uranus", ar: "أورانوس" },
    orbitOrder: 7,
    emoji: "🔵",
    color: "#4AE8D4",
    glowColor: "rgba(74,232,212,0.6)",
    size: 62,
    clues: [
      { en: "I am the seventh planet from the Sun! 🌀", ar: "أنا الكوكب السابع من الشمس! 🌀" },
      { en: "I am an ice giant and I spin on my side! 🔄", ar: "أنا عملاق جليدي وأدور على جانبي! 🔄" },
      { en: "I appear blue-green because of methane gas! 💨", ar: "أبدو بلون أزرق-أخضر بسبب غاز الميثان! 💨" },
    ],
    funFact: {
      en: "Uranus rolls around the Sun like a bowling ball — it's tilted 98 degrees!",
      ar: "أورانوس يتدحرج حول الشمس كالكرة — مائل بزاوية 98 درجة!",
    },
    bgGradient: "linear-gradient(135deg, #4AE8D4, #006064)",
  },
  {
    id: "neptune",
    name: { en: "Neptune", ar: "نبتون" },
    orbitOrder: 8,
    emoji: "💙",
    color: "#4A6AE8",
    glowColor: "rgba(74,106,232,0.6)",
    size: 60,
    clues: [
      { en: "I am the eighth and farthest planet from the Sun! 🌌", ar: "أنا الكوكب الثامن والأبعد عن الشمس! 🌌" },
      { en: "I have the strongest winds in the Solar System! 💨", ar: "لديّ أقوى رياح في النظام الشمسي! 💨" },
      { en: "One year on me takes 165 Earth years! ⏳", ar: "السنة عندي تساوي 165 سنة أرضية! ⏳" },
    ],
    funFact: {
      en: "Neptune's winds are so fast they could blow a car off a highway!",
      ar: "رياح نبتون سريعة جداً لدرجة يمكنها إطاحة سيارة عن الطريق!",
    },
    bgGradient: "linear-gradient(135deg, #4A6AE8, #1A237E)",
  },
];

// ── Game Constants ────────────────────────────────────────────
export const TOTAL_PLANETS = PLANETS.length;
export const XP_PER_CORRECT = 100;
export const STARS_PER_CORRECT = 1;
export const BRAIN_BREAK_INTERVAL = 3; // every 3 correct answers
export const BRAIN_BREAK_DURATION = 30; // seconds

// ── Bilingual Micro-Quest Schema ──────────────────────────────
export interface MicroQuest {
  id: string;
  title: LocalizedString;
  instruction: LocalizedString;
  dopamine_affirmation: LocalizedString;
  planet_id: string;
}

/** Generate micro-quests from planet data — matches the project spec JSON schema */
export function generateMicroQuests(): MicroQuest[] {
  return PLANETS.map((planet, index) => ({
    id: `quest_${100 + index + 1}`,
    title: {
      en: `Explore ${planet.name.en}`,
      ar: `استكشف كوكب ${planet.name.ar}`,
    },
    instruction: {
      en: `Drag ${planet.name.en} into orbit position ${planet.orbitOrder} around the Sun.`,
      ar: `اسحب كوكب ${planet.name.ar} إلى المدار رقم ${planet.orbitOrder} حول الشمس.`,
    },
    dopamine_affirmation: {
      en: `Awesome job, Space Explorer! ${planet.name.en} is in orbit! 🚀`,
      ar: `عمل رائع يا بطل الفضاء! ${planet.name.ar} في مداره الآن! 🚀`,
    },
    planet_id: planet.id,
  }));
}
