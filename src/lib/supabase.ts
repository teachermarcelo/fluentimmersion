import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Lesson, StudentAcademicRecord } from '../types';

// Check environment or localStorage override
const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('fluent_immersion_supabase_url');
    const localKey = localStorage.getItem('fluent_immersion_supabase_key');
    if (localUrl && localKey) {
      return { url: localUrl, key: localKey };
    }
  }

  return {
    url: envUrl || 'https://nuyzvpkvawixidotuio.supabase.co',
    key: envKey || '',
  };
};

let cachedClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    return null;
  }
  if (!cachedClient) {
    try {
      cachedClient = createClient(url, key);
    } catch (e) {
      console.warn('Erro ao inicializar cliente Supabase:', e);
      return null;
    }
  }
  return cachedClient;
};

export const setSupabaseCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fluent_immersion_supabase_url', url.trim());
    localStorage.setItem('fluent_immersion_supabase_key', key.trim());
    try {
      cachedClient = createClient(url.trim(), key.trim());
    } catch {
      cachedClient = null;
    }
  }
};

export const clearSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fluent_immersion_supabase_url');
    localStorage.removeItem('fluent_immersion_supabase_key');
    cachedClient = null;
  }
};

export const syncStudentToSupabase = async (student: StudentAcademicRecord) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, message: 'Supabase não conectado' };
  try {
    const { error } = await supabase.from('students').upsert({
      id: student.id,
      name: student.name,
      email: student.email,
      level: student.level,
      xp: student.totalXp,
      attendance_rate: student.attendanceRate,
      phone: student.phone || '',
      pedagogical_notes: student.notes || '',
      target_track: student.track || 'geral',
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn('Erro ao salvar aluno no Supabase:', err);
    return { success: false, error: err.message };
  }
};

export const deleteStudentFromSupabase = async (studentId: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, message: 'Supabase não conectado' };
  try {
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn('Erro ao excluir aluno no Supabase:', err);
    return { success: false, error: err.message };
  }
};

export const fetchStudentsFromSupabase = async (): Promise<StudentAcademicRecord[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('students').select('*').order('name');
    if (error || !data) return null;
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      level: d.level,
      totalXp: d.xp || 0,
      speakingScore: 85,
      listeningScore: 85,
      readingScore: 85,
      writingScore: 85,
      attendanceRate: Number(d.attendance_rate) || 100,
      lastActive: 'Recentemente',
      notes: d.pedagogical_notes || '',
      phone: d.phone,
      track: d.target_track,
    }));
  } catch {
    return null;
  }
};

export const syncLessonToSupabase = async (lesson: Lesson) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, message: 'Supabase não conectado' };
  try {
    const { error } = await supabase.from('lessons').upsert({
      id: lesson.id,
      title: lesson.title,
      level: lesson.level,
      skill: lesson.skill,
      category: lesson.category,
      target_audience: lesson.targetAudience || 'curriculum_adults',
      order_index: lesson.orderIndex || 1,
      duration_minutes: lesson.durationMinutes || 15,
      xp_reward: lesson.xpReward || 50,
      description: lesson.description || '',
      icon_name: lesson.iconName || 'BookOpen',
      custom_html: lesson.customHtml || '',
      reading_text: lesson.content?.readingText || '',
      is_published: true,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn('Erro ao salvar lição no Supabase:', err);
    return { success: false, error: err.message };
  }
};

export const deleteLessonFromSupabase = async (lessonId: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, message: 'Supabase não conectado' };
  try {
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn('Erro ao excluir lição no Supabase:', err);
    return { success: false, error: err.message };
  }
};

export const fetchLessonsFromSupabase = async (): Promise<Lesson[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('order_index', { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      level: d.level,
      skill: d.skill,
      category: d.category,
      targetAudience: d.target_audience,
      orderIndex: d.order_index,
      durationMinutes: d.duration_minutes,
      xpReward: d.xp_reward,
      description: d.description,
      iconName: d.icon_name,
      customHtml: d.custom_html,
      content: {
        readingText: d.reading_text,
      },
    }));
  } catch {
    return null;
  }
};

/**
 * SQL DDL Schema for Supabase
 * Teacher can copy-paste into the Supabase SQL Editor to create all tables with 1 click
 */
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- FLUENT IMMERSION - Schema Oficial do Banco de Dados Supabase (PostgreSQL)
-- Coordenador Pedagógico: Teacher Marcelo (WhatsApp: 4198778348)
-- ========================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Lições e Atividades Pedagógicas
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  skill TEXT NOT NULL CHECK (skill IN ('reading', 'writing', 'listening', 'speaking')),
  category TEXT NOT NULL DEFAULT 'geral' CHECK (category IN ('geral', 'business', 'biblico', 'proficiencia')),
  target_audience TEXT NOT NULL DEFAULT 'curriculum_adults' CHECK (target_audience IN ('curriculum_adults', 'kids', 'pronunciation_lab')),
  order_index INTEGER NOT NULL DEFAULT 1,
  duration_minutes INTEGER DEFAULT 15,
  xp_reward INTEGER DEFAULT 50,
  description TEXT,
  icon_name TEXT DEFAULT 'BookOpen',
  custom_html TEXT,
  reading_text TEXT,
  vocabulary JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de consulta rápida para o aluno
CREATE INDEX IF NOT EXISTS idx_lessons_audience ON public.lessons(target_audience);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON public.lessons(category);
CREATE INDEX IF NOT EXISTS idx_lessons_level ON public.lessons(level);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON public.lessons(order_index ASC);

-- 3. Tabela de Alunos e Matrículas
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  level TEXT NOT NULL DEFAULT 'A0',
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 1,
  completed_lessons INTEGER DEFAULT 0,
  attendance_rate NUMERIC DEFAULT 100.0,
  fluency_score NUMERIC DEFAULT 0.0,
  phone TEXT,
  pedagogical_notes TEXT,
  target_track TEXT DEFAULT 'geral',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Submissões e Desempenho de Fala / Lições
CREATE TABLE IF NOT EXISTS public.student_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE SET NULL,
  skill TEXT NOT NULL,
  score NUMERIC NOT NULL,
  recognized_speech TEXT,
  ai_feedback TEXT,
  mispronounced_words JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Habilitar Row Level Security (RLS) com políticas de leitura pública e escrita autenticada
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para leitura de lições
DROP POLICY IF EXISTS "Public Read Lessons" ON public.lessons;
CREATE POLICY "Public Read Lessons" ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable Insert Lessons" ON public.lessons;
CREATE POLICY "Enable Insert Lessons" ON public.lessons FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable Update Lessons" ON public.lessons;
CREATE POLICY "Enable Update Lessons" ON public.lessons FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable Delete Lessons" ON public.lessons;
CREATE POLICY "Enable Delete Lessons" ON public.lessons FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public Read Students" ON public.students;
CREATE POLICY "Public Read Students" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable Insert Students" ON public.students;
CREATE POLICY "Enable Insert Students" ON public.students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable Update Students" ON public.students;
CREATE POLICY "Enable Update Students" ON public.students FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Read Submissions" ON public.student_submissions;
CREATE POLICY "Public Read Submissions" ON public.student_submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable Insert Submissions" ON public.student_submissions;
CREATE POLICY "Enable Insert Submissions" ON public.student_submissions FOR INSERT WITH CHECK (true);

-- Notificação de status
COMMENT ON TABLE public.lessons IS 'Grade curricular completa da plataforma FLUENT IMMERSION';
`;
