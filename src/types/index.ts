export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type SkillType = 'reading' | 'writing' | 'listening' | 'speaking';

export type LessonCategory = 'geral' | 'business' | 'biblico' | 'proficiencia';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: CEFRLevel;
  xp: number;
  gems: number;
  streak: number;
  lastActiveDate: string;
  dailyGoalMinutes: number;
  studiedMinutesToday: number;
  accuracyRate: number;
  completedLessons: string[];
  badges: Badge[];
  role: 'student' | 'teacher' | 'admin' | 'parent';
  avatar: string;
  enrolledTrack?: 'curriculum_adults' | 'kids' | 'business' | 'biblico' | 'proficiencia' | 'all_access';
  isEnrolledStudent?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'royal';
}

export interface WordAnalysis {
  word: string;
  status: 'correct' | 'acceptable' | 'needs_work';
  ipa?: string;
  tip?: string;
}

export interface PronunciationFeedback {
  score: number;
  phoneticsIpa: string;
  words: WordAnalysis[];
  mispronouncedWords: string[];
  tonguePositionTip: string;
  pedagogicalFeedback: string;
  accentDetected?: string;
  encouragement?: string;
}

export interface Lesson {
  id: string;
  level: CEFRLevel;
  title: string;
  description: string;
  skill: SkillType;
  category: LessonCategory;
  targetAudience: 'curriculum_adults' | 'kids' | 'pronunciation_lab';
  orderIndex: number;
  durationMinutes: number;
  xpReward: number;
  iconName: string;
  content: {
    targetPhrase?: string;
    ipa?: string;
    translationPt?: string;
    readingText?: string;
    audioPrompt?: string;
    writingPrompt?: string;
    sampleAnswer?: string;
    multipleChoice?: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }[];
  };
  customHtml?: string;
}

export interface KidsGame {
  id: string;
  title: string;
  type: 'phonics' | 'memory' | 'quiz' | 'story';
  category: string;
  stars: number;
  maxStars: number;
  icon: string;
  unlocked: boolean;
  ageGroup: '4-7' | '8-12';
}

export interface StudentAcademicRecord {
  id: string;
  name: string;
  email: string;
  level: CEFRLevel;
  totalXp: number;
  speakingScore: number;
  listeningScore: number;
  readingScore: number;
  writingScore: number;
  attendanceRate: number;
  lastActive: string;
  notes: string;
  parentEmail?: string;
  phone?: string;
  track?: 'curriculum_adults' | 'kids' | 'business' | 'biblico' | 'proficiencia' | 'all_access';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'streak' | 'teacher' | 'challenge' | 'reward';
  date: string;
  read: boolean;
}
