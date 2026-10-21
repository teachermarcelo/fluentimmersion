import { Lesson, CEFRLevel, SkillType, LessonCategory } from '../types';
import { ALL_LESSONS } from '../data/mockData';

const CUSTOM_LESSONS_STORAGE_KEY = 'fluent_immersion_custom_lessons';

// Pre-loaded Lesson 13 artifact reference
export const PRELOADED_LESSON_13: Lesson = {
  id: 'custom-les-artifact-dates-birthdays',
  level: 'A1',
  title: 'How to say the DATE in English (Dates & Birthdays)',
  description: 'Masterclass interativa com áudio TTS nativo, 30 vocabulários, reading 150w, grammar lab, flashcards e quiz de 30 questões.',
  skill: 'speaking',
  category: 'geral',
  targetAudience: 'curriculum_adults',
  orderIndex: 13,
  durationMinutes: 120,
  xpReward: 150,
  iconName: 'Calendar',
  content: {
    readingText: 'How to say the DATE in English. Learn ordinal numbers 1st-31st, American vs British order, months, and birthday questions.',
  },
  // Points to the public artifact or loaded HTML
  customHtml: '/lessons/lesson-13-dates-birthdays.html',
};

// Pre-loaded Lesson Fruits A0 artifact reference
export const PRELOADED_LESSON_FRUITS_A0: Lesson = {
  id: 'custom-les-artifact-fruits-a0',
  level: 'A0',
  title: 'Fruits — Colors, Taste & At the Market (A0 Immersion)',
  description: 'Masterclass interativa com 12 frutas, 30 vocabulários, reading 150w, grammar lab, flashcards, quiz de 30 questões e áudio TTS nativo.',
  skill: 'speaking',
  category: 'geral',
  targetAudience: 'curriculum_adults',
  orderIndex: 2,
  durationMinutes: 120,
  xpReward: 150,
  iconName: 'Apple',
  content: {
    readingText: 'At the market. Fresh fruits, colors and taste. Say 12 common fruits, describe colors and taste (sweet, sour), say I like / I don\'t like, and ask How much is it?',
  },
  customHtml: '/lessons/lesson-fruits-a0.html',
};

/**
 * Parses raw HTML or standalone React artifact code to extract metadata
 */
export function parseImportedLessonCode(rawCode: string): {
  detectedTitle: string;
  detectedLevel: CEFRLevel;
  detectedSkill: SkillType;
  detectedDuration: number;
  detectedXp: number;
  isArtifact: boolean;
} {
  const isArtifact =
    /<!doctype html>/i.test(rawCode) ||
    /<script[\s>]/i.test(rawCode) ||
    /React Artifact/i.test(rawCode) ||
    /createRoot/i.test(rawCode);

  // Title extraction
  let detectedTitle = 'Nova Lição Interativa';
  const titleMatch = rawCode.match(/<title>([^<]+)<\/title>/i);
  const h1Match = rawCode.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const h2Match = rawCode.match(/<h2[^>]*>([^<]+)<\/h2>/i);

  if (rawCode.includes('Fruits') && (rawCode.includes('colors') || rawCode.includes('A0 Level'))) {
    detectedTitle = 'Fruits — Colors, Taste & At the Market';
  } else if (rawCode.includes('Dates and Birthdays') || rawCode.includes('the DATE in English')) {
    detectedTitle = 'How to say the DATE in English (Dates & Birthdays)';
  } else if (titleMatch && titleMatch[1] && !titleMatch[1].includes('React Artifact')) {
    detectedTitle = titleMatch[1].trim();
  } else if (h1Match && h1Match[1]) {
    detectedTitle = h1Match[1].replace(/<[^>]+>/g, '').trim();
  } else if (h2Match && h2Match[1]) {
    detectedTitle = h2Match[1].replace(/<[^>]+>/g, '').trim();
  }

  // Level extraction
  let detectedLevel: CEFRLevel = 'A1';
  if (/\b(A0)\b/i.test(rawCode)) detectedLevel = 'A0';
  else if (/\b(A1)\b/i.test(rawCode)) detectedLevel = 'A1';
  else if (/\b(A2)\b/i.test(rawCode)) detectedLevel = 'A2';
  else if (/\b(B1)\b/i.test(rawCode)) detectedLevel = 'B1';
  else if (/\b(B2)\b/i.test(rawCode)) detectedLevel = 'B2';
  else if (/\b(C1)\b/i.test(rawCode)) detectedLevel = 'C1';
  else if (/\b(C2)\b/i.test(rawCode)) detectedLevel = 'C2';

  // Skill extraction
  let detectedSkill: SkillType = 'speaking';
  if (/speaking|pronunciation|fala/i.test(rawCode)) detectedSkill = 'speaking';
  else if (/listening|audio|ouvir|escuta/i.test(rawCode)) detectedSkill = 'listening';
  else if (/writing|redação|escrita/i.test(rawCode)) detectedSkill = 'writing';
  else if (/reading|leitura/i.test(rawCode)) detectedSkill = 'reading';

  // Duration & XP
  const durationMatch = rawCode.match(/(\d{1,3})\s*(?:min|MIN)/);
  const detectedDuration = durationMatch ? Math.min(180, Math.max(5, parseInt(durationMatch[1], 10))) : 20;
  const detectedXp = detectedDuration >= 60 ? 150 : detectedDuration >= 30 ? 100 : 75;

  return {
    detectedTitle,
    detectedLevel,
    detectedSkill,
    detectedDuration,
    detectedXp,
    isArtifact,
  };
}

/**
 * Returns all lessons combining built-in mock lessons with custom lessons saved in localStorage
 */
export function getAllAvailableLessons(): Lesson[] {
  let customLessons: Lesson[] = [];
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(CUSTOM_LESSONS_STORAGE_KEY);
    if (saved) {
      try {
        customLessons = JSON.parse(saved);
      } catch (e) {
        console.warn('Erro ao carregar custom lessons:', e);
      }
    }
  }

  // Preloaded interactive lessons (Lesson 13 Dates & Lesson Fruits A0)
  const preloaded: Lesson[] = [];
  const hasLesson13 =
    customLessons.some((l) => l.id === PRELOADED_LESSON_13.id || l.title.includes('Dates & Birthdays')) ||
    ALL_LESSONS.some((l) => l.title.includes('Dates & Birthdays'));
  if (!hasLesson13) preloaded.push(PRELOADED_LESSON_13);

  const hasLessonFruits =
    customLessons.some((l) => l.id === PRELOADED_LESSON_FRUITS_A0.id || l.title.includes('Fruits')) ||
    ALL_LESSONS.some((l) => l.title.includes('Fruits'));
  if (!hasLessonFruits) preloaded.push(PRELOADED_LESSON_FRUITS_A0);

  const baseLessons = [...preloaded, ...ALL_LESSONS];

  // Merge custom lessons, prioritizing newer custom ones
  const customIds = new Set(customLessons.map((l) => l.id));
  const filteredBase = baseLessons.filter((l) => !customIds.has(l.id));

  return [...customLessons, ...filteredBase];
}

/**
 * Saves a new custom lesson to localStorage
 */
export function saveCustomLesson(lesson: Lesson): Lesson[] {
  if (typeof window === 'undefined') return [lesson];

  const current = getAllAvailableLessons();
  const existingIdx = current.findIndex((l) => l.id === lesson.id);

  let updated: Lesson[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = lesson;
  } else {
    updated = [lesson, ...current];
  }

  // Persist only the custom ones to localStorage
  const onlyCustom = updated.filter((l) => l.id.startsWith('custom-les-'));
  localStorage.setItem(CUSTOM_LESSONS_STORAGE_KEY, JSON.stringify(onlyCustom));

  return updated;
}

/**
 * Deletes a custom lesson
 */
export function deleteCustomLesson(id: string): Lesson[] {
  if (typeof window === 'undefined') return [];

  const current = getAllAvailableLessons();
  const updated = current.filter((l) => l.id !== id);

  const onlyCustom = updated.filter((l) => l.id.startsWith('custom-les-'));
  localStorage.setItem(CUSTOM_LESSONS_STORAGE_KEY, JSON.stringify(onlyCustom));

  return updated;
}
