import { Lesson, CEFRLevel, SkillType, LessonCategory } from '../types';
import { ALL_LESSONS } from '../data/mockData';
import {
  syncLessonToSupabase,
  deleteLessonFromSupabase,
  fetchLessonsFromSupabase,
} from '../lib/supabase';

const CUSTOM_LESSONS_STORAGE_KEY = 'fluent_immersion_custom_lessons';

// Event notification helper for real-time reactive UI updates
export const notifyLessonsUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fluent_lessons_updated'));
  }
};

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

// Pre-loaded Lesson Family Members A1 (Unit 09 Everyday Life)
export const PRELOADED_LESSON_FAMILY_A1: Lesson = {
  id: 'custom-les-artifact-family-members-a1',
  level: 'A1',
  title: 'Family Members | A1 Interactive English Lesson',
  description: 'Learn to use I, you, he, she, it, we, and they to describe yourself, other people, animals, and things.',
  skill: 'speaking',
  category: 'geral',
  targetAudience: 'curriculum_adults',
  orderIndex: 16,
  durationMinutes: 120,
  xpReward: 150,
  iconName: 'Users',
  content: {
    readingText: 'Unit 09 · A1 · English for Everyday Life. Family Members and Subject Pronouns: I, you, he, she, it, we, they.',
  },
  customHtml: '/lessons/lesson-family-members-a1.html',
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

  // Preloaded interactive lessons (Lesson 13 Dates, Lesson Fruits A0, and Lesson Family Members A1)
  const preloaded: Lesson[] = [];
  const hasLesson13 =
    customLessons.some((l) => l.id === PRELOADED_LESSON_13.id || l.title.includes('Dates & Birthdays')) ||
    ALL_LESSONS.some((l) => l.title.includes('Dates & Birthdays'));
  if (!hasLesson13) preloaded.push(PRELOADED_LESSON_13);

  const hasLessonFruits =
    customLessons.some((l) => l.id === PRELOADED_LESSON_FRUITS_A0.id || l.title.includes('Fruits')) ||
    ALL_LESSONS.some((l) => l.title.includes('Fruits'));
  if (!hasLessonFruits) preloaded.push(PRELOADED_LESSON_FRUITS_A0);

  const hasFamilyMembers =
    customLessons.some((l) => l.id === PRELOADED_LESSON_FAMILY_A1.id || l.title.includes('Family Members')) ||
    ALL_LESSONS.some((l) => l.title.includes('Family Members'));
  if (!hasFamilyMembers) preloaded.push(PRELOADED_LESSON_FAMILY_A1);

  const baseLessons = [...preloaded, ...ALL_LESSONS];

  // Merge custom lessons, prioritizing newer custom ones
  const customIds = new Set(customLessons.map((l) => l.id));
  const filteredBase = baseLessons.filter((l) => !customIds.has(l.id));

  return [...customLessons, ...filteredBase];
}

/**
 * Saves a new custom lesson to localStorage, memory, and Supabase cloud
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

  // Update in-memory ALL_LESSONS so all active components instantly reflect it
  const existingMockIdx = ALL_LESSONS.findIndex((l) => l.id === lesson.id);
  if (existingMockIdx >= 0) {
    ALL_LESSONS[existingMockIdx] = lesson;
  } else {
    ALL_LESSONS.unshift(lesson);
  }

  // Persist only the custom ones to localStorage with quota protection
  const onlyCustom = updated.filter((l) => l.id.startsWith('custom-les-'));
  try {
    localStorage.setItem(CUSTOM_LESSONS_STORAGE_KEY, JSON.stringify(onlyCustom));
  } catch (err) {
    console.warn('Quota exceeded on localStorage, storing trimmed customHtml:', err);
    try {
      const lightweight = onlyCustom.map((l) => ({
        ...l,
        customHtml: l.customHtml && l.customHtml.length > 50000 ? l.customHtml.slice(0, 50000) : l.customHtml,
      }));
      localStorage.setItem(CUSTOM_LESSONS_STORAGE_KEY, JSON.stringify(lightweight));
    } catch (e) {
      console.warn('Não foi possível persistir no localStorage:', e);
    }
  }

  // Sync to Supabase cloud in background
  syncLessonToSupabase(lesson).catch((err) =>
    console.warn('Erro ao sincronizar lição com Supabase:', err)
  );

  // Notify all views that lessons list changed
  notifyLessonsUpdated();

  return updated;
}

/**
 * Deletes a custom lesson from local storage and Supabase
 */
export function deleteCustomLesson(id: string): Lesson[] {
  if (typeof window === 'undefined') return [];

  const current = getAllAvailableLessons();
  const updated = current.filter((l) => l.id !== id);

  // Remove from in-memory ALL_LESSONS
  const mockIdx = ALL_LESSONS.findIndex((l) => l.id === id);
  if (mockIdx >= 0) {
    ALL_LESSONS.splice(mockIdx, 1);
  }

  const onlyCustom = updated.filter((l) => l.id.startsWith('custom-les-'));
  try {
    localStorage.setItem(CUSTOM_LESSONS_STORAGE_KEY, JSON.stringify(onlyCustom));
  } catch {}

  deleteLessonFromSupabase(id).catch((err) =>
    console.warn('Erro ao excluir lição do Supabase:', err)
  );

  notifyLessonsUpdated();

  return updated;
}

/**
 * Sincroniza lições salvas no Supabase para o cliente local (permite que qualquer aluno veja)
 */
export async function syncLessonsFromSupabase(): Promise<Lesson[]> {
  try {
    const remote = await fetchLessonsFromSupabase();
    if (remote && remote.length > 0) {
      const current = getAllAvailableLessons();
      const map = new Map<string, Lesson>();
      current.forEach((l) => map.set(l.id, l));
      remote.forEach((l) => map.set(l.id, l));
      const merged = Array.from(map.values());
      const onlyCustom = merged.filter((l) => l.id.startsWith('custom-les-'));
      try {
        localStorage.setItem(CUSTOM_LESSONS_STORAGE_KEY, JSON.stringify(onlyCustom));
      } catch {}
      notifyLessonsUpdated();
      return merged;
    }
  } catch (err) {
    console.warn('Erro ao sincronizar lições do Supabase:', err);
  }
  return getAllAvailableLessons();
}
