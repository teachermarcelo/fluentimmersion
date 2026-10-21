import { CEFRLevel, UserProfile, StudentAcademicRecord } from '../types';
import { STUDENT_ACADEMIC_RECORDS } from '../data/mockData';
import { syncStudentToSupabase, deleteStudentFromSupabase } from '../lib/supabase';

export type StudentTrack = 'curriculum_adults' | 'kids' | 'business' | 'biblico' | 'proficiencia' | 'all_access';

export const TRACK_INFO: Record<StudentTrack, { label: string; icon: string; description: string; badge: string }> = {
  curriculum_adults: {
    label: 'Inglês Geral (A0 ao C2)',
    icon: '🎓',
    description: 'Grade completa do iniciante ao pós-avançado com fonética britânica.',
    badge: 'Geral Adultos',
  },
  kids: {
    label: 'Fluent Kids (4 a 12 anos)',
    icon: '🧸',
    description: 'Imersão infantil com phonics lúdico, jogos interativos e contação de histórias.',
    badge: 'Fluent Kids',
  },
  business: {
    label: 'Business English & Entrevistas',
    icon: '💼',
    description: 'Inglês corporativo para reuniões, apresentações executivas e negociações.',
    badge: 'Business',
  },
  biblico: {
    label: 'Inglês Bíblico & Teológico',
    icon: '📖',
    description: 'Leitura, vocabulário ministerial e hermenêutica bíblica em inglês.',
    badge: 'Bíblico',
  },
  proficiencia: {
    label: 'Preparatório Proficiência (IELTS / TOEFL / Cambridge)',
    icon: '🎯',
    description: 'Preparação intensiva para exames internacionais de proficiência.',
    badge: 'Proficiência',
  },
  all_access: {
    label: 'Acesso Total VIP (Todas as Trilhas Liberadas)',
    icon: '🌟',
    description: 'Acesso irrestrito a todos os cursos, módulos especiais e ferramentas da escola.',
    badge: 'Acesso VIP Total',
  },
};

const DELETED_STUDENTS_KEY = 'fluent_immersion_deleted_students';

export const normalizeNameKey = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, '_');
};

/**
 * Retorna os IDs e nomes de alunos que foram excluídos pelo professor
 */
export const getDeletedStudents = (): { ids: string[]; names: string[] } => {
  if (typeof window === 'undefined') return { ids: [], names: [] };
  const saved = localStorage.getItem(DELETED_STUDENTS_KEY);
  if (!saved) return { ids: [], names: [] };
  try {
    return JSON.parse(saved);
  } catch {
    return { ids: [], names: [] };
  }
};

/**
 * Verifica se um aluno foi marcado como excluído
 */
export const isStudentDeleted = (name?: string, id?: string): boolean => {
  const { ids, names } = getDeletedStudents();
  if (id && ids.includes(id)) return true;
  if (name && names.includes(name.trim().toLowerCase())) return true;
  return false;
};

/**
 * Exclui permanentemente um aluno do sistema, localmente e no Supabase
 */
export const deleteStudentPermanently = async (id: string, name: string): Promise<void> => {
  if (typeof window === 'undefined') return;

  // 1. Adicionar à lista permanente de excluídos
  const { ids, names } = getDeletedStudents();
  const cleanName = name.trim().toLowerCase();
  if (!ids.includes(id)) ids.push(id);
  if (!names.includes(cleanName)) names.push(cleanName);
  localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify({ ids, names }));

  // 2. Remover do roster do localStorage
  const savedRoster = localStorage.getItem('fluent_immersion_students');
  if (savedRoster) {
    try {
      const roster: StudentAcademicRecord[] = JSON.parse(savedRoster);
      const filtered = roster.filter(
        (s) => s.id !== id && s.name.trim().toLowerCase() !== cleanName
      );
      localStorage.setItem('fluent_immersion_students', JSON.stringify(filtered));
    } catch {}
  }

  // 3. Remover chave individual do aluno
  const studentStorageKey = `fluent_student_${normalizeNameKey(name)}`;
  localStorage.removeItem(studentStorageKey);

  // 4. Remover do Supabase
  try {
    await deleteStudentFromSupabase(id);
  } catch (e) {
    console.warn('Erro ao remover do Supabase:', e);
  }
};

/**
 * Retorna a lista oficial de estudantes do Teacher Marcelo,
 * filtrando alunos excluídos e mesclando dados atualizados do banco local.
 */
export const getTeacherStudentsRoster = (): StudentAcademicRecord[] => {
  if (typeof window === 'undefined') return STUDENT_ACADEMIC_RECORDS;

  const { ids: deletedIds, names: deletedNames } = getDeletedStudents();
  const isDeleted = (s: StudentAcademicRecord) =>
    deletedIds.includes(s.id) || deletedNames.includes(s.name.trim().toLowerCase());

  const saved = localStorage.getItem('fluent_immersion_students');
  let roster: StudentAcademicRecord[] = [];

  if (saved) {
    try {
      roster = JSON.parse(saved);
    } catch {
      roster = [];
    }
  }

  // Se o roster estiver vazio e não houver alunos excluídos expressamente da lista inicial, usa padrão
  if (roster.length === 0) {
    roster = STUDENT_ACADEMIC_RECORDS.filter((s) => !isDeleted(s));
  } else {
    // Filtrar removidos
    roster = roster.filter((s) => !isDeleted(s));
  }

  // Sincronizar com os perfis individuais mais recentes em localStorage
  const updatedRoster = roster.map((st) => {
    const key = `fluent_student_${normalizeNameKey(st.name)}`;
    const studentData = localStorage.getItem(key);
    if (studentData) {
      try {
        const parsed: UserProfile = JSON.parse(studentData);
        return {
          ...st,
          totalXp: parsed.xp !== undefined ? parsed.xp : st.totalXp,
          level: parsed.level || st.level,
          speakingScore: parsed.accuracyRate > 0 ? parsed.accuracyRate : st.speakingScore,
          lastActive: 'Ativo recentemente',
        };
      } catch {}
    }
    return st;
  });

  return updatedRoster;
};

/**
 * Recupera ou inicializa o perfil individual do aluno.
 * Se for a primeira vez que o aluno entra pelo link, inicia 100% zerado e limpo.
 */
export const getOrCreateStudentProfile = (
  name: string,
  level?: CEFRLevel,
  track?: StudentTrack
): UserProfile => {
  const cleanName = name.trim();
  const storageKey = `fluent_student_${normalizeNameKey(cleanName)}`;

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProfile;
        // Garantir que caso o link venha com novo nível ou trilha, atualiza respeitosamente
        if (level && parsed.level !== level) parsed.level = level;
        if (track && (parsed as any).enrolledTrack !== track) (parsed as any).enrolledTrack = track;
        return parsed;
      } catch (e) {
        console.warn('Erro ao restaurar progresso do aluno:', e);
      }
    }
  }

  // Novo Aluno: Inicia 100% LIMPO e ZERADO
  const newProfile: UserProfile = {
    id: `std-${Date.now()}`,
    name: cleanName,
    email: `${cleanName.toLowerCase().replace(/\s+/g, '.')}@aluno.fluentimmersion.com`,
    level: level || 'A1',
    xp: 0, // 100% ZERADO
    gems: 0, // 100% ZERADO
    streak: 0, // 100% ZERADO
    lastActiveDate: new Date().toISOString().split('T')[0],
    dailyGoalMinutes: 20,
    studiedMinutesToday: 0, // 0 minutos
    accuracyRate: 0, // Sem dados de áudio ainda
    completedLessons: [],
    badges: [],
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  };

  (newProfile as any).enrolledTrack = track || 'curriculum_adults';
  (newProfile as any).isEnrolledStudent = true;

  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, JSON.stringify(newProfile));

    // Se não foi deletado pelo professor, insere ou atualiza na lista de alunos do Teacher Marcelo
    if (!isStudentDeleted(cleanName, newProfile.id)) {
      updateTeacherStudentsRoster({
        id: newProfile.id,
        name: newProfile.name,
        email: newProfile.email,
        level: newProfile.level,
        totalXp: 0,
        speakingScore: 0,
        listeningScore: 0,
        readingScore: 0,
        writingScore: 0,
        attendanceRate: 100,
        lastActive: 'Primeiro acesso agora',
        notes: `Matriculado na trilha ${track ? TRACK_INFO[track]?.label || track : 'Inglês Geral'}.`,
        track: track as any,
      });
    }
  }

  return newProfile;
};

/**
 * Salva o progresso individual do aluno e atualiza o painel do professor em tempo real.
 */
export const persistStudentProgress = (profile: UserProfile): void => {
  if (typeof window === 'undefined') return;

  const storageKey = `fluent_student_${normalizeNameKey(profile.name)}`;
  localStorage.setItem(storageKey, JSON.stringify(profile));

  // Apenas salva como usuário ativo se não estiver excluído
  if (isStudentDeleted(profile.name, profile.id)) {
    return;
  }

  // Atualizar o painel do Teacher Marcelo com o XP e precisão reais
  updateTeacherStudentsRoster({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    level: profile.level,
    totalXp: profile.xp,
    speakingScore: profile.accuracyRate,
    listeningScore: profile.accuracyRate > 0 ? Math.min(100, profile.accuracyRate + 2) : 0,
    readingScore: profile.completedLessons.length > 0 ? 85 : 0,
    writingScore: profile.completedLessons.length > 0 ? 80 : 0,
    attendanceRate: 100,
    lastActive: 'Ativo hoje',
    track: (profile as any).enrolledTrack || 'curriculum_adults',
  });
};

/**
 * Atualiza ou insere o registro na lista de monitoramento acadêmico do Teacher Marcelo
 */
export const updateTeacherStudentsRoster = (record: Partial<StudentAcademicRecord> & { name: string }): void => {
  if (typeof window === 'undefined') return;

  if (isStudentDeleted(record.name, record.id)) {
    return;
  }

  const saved = localStorage.getItem('fluent_immersion_students');
  let roster: StudentAcademicRecord[] = [];
  if (saved) {
    try {
      roster = JSON.parse(saved);
    } catch {
      roster = [];
    }
  } else {
    roster = [...STUDENT_ACADEMIC_RECORDS];
  }

  const existingIndex = roster.findIndex(
    (s) => s.name.trim().toLowerCase() === record.name.trim().toLowerCase()
  );

  if (existingIndex >= 0) {
    roster[existingIndex] = {
      ...roster[existingIndex],
      ...record,
      totalXp: record.totalXp !== undefined ? record.totalXp : roster[existingIndex].totalXp,
      speakingScore: record.speakingScore !== undefined ? record.speakingScore : roster[existingIndex].speakingScore,
      lastActive: record.lastActive || 'Ativo hoje',
    };
  } else {
    const newEntry: StudentAcademicRecord = {
      id: record.id || `st-${Date.now()}`,
      name: record.name,
      email: record.email || `${record.name.toLowerCase().replace(/\s+/g, '.')}@aluno.com`,
      level: record.level || 'A1',
      totalXp: record.totalXp || 0,
      speakingScore: record.speakingScore || 0,
      listeningScore: record.listeningScore || 0,
      readingScore: record.readingScore || 0,
      writingScore: record.writingScore || 0,
      attendanceRate: 100,
      lastActive: record.lastActive || 'Primeiro acesso hoje',
      notes: record.notes || 'Matriculado via link de acesso.',
      track: record.track || 'curriculum_adults',
    };
    roster.unshift(newEntry);
  }

  localStorage.setItem('fluent_immersion_students', JSON.stringify(roster));

  // Se Supabase estiver conectado, sincroniza em segundo plano
  const target = existingIndex >= 0 ? roster[existingIndex] : roster[0];
  syncStudentToSupabase(target).catch(() => {});
};
