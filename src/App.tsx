import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SpeakingLabView } from './components/SpeakingLabView';
import { CurriculumView } from './components/CurriculumView';
import { KidsView } from './components/KidsView';
import { LiveClassView } from './components/LiveClassView';
import { LeaderboardView } from './components/LeaderboardView';
import { AdminView } from './components/AdminView';
import { WhatsAppModal } from './components/WhatsAppModal';
import { TeacherLoginModal } from './components/TeacherLoginModal';
import { INITIAL_USER, TEACHER_MARCELO, ALL_LESSONS } from './data/mockData';
import { CEFRLevel, UserProfile, NotificationItem, Lesson } from './types';
import { MessageSquare, Phone, ShieldCheck, Heart, Lock, Shield, UserCheck } from 'lucide-react';
import { sounds } from './utils/audioEffects';
import { getOrCreateStudentProfile, persistStudentProgress, TRACK_INFO, StudentTrack } from './utils/studentManager';
import { saveCustomLesson, syncLessonsFromSupabase } from './utils/lessonManager';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [whatsAppTopic, setWhatsAppTopic] = useState<string>('Gostaria de agendar uma aula ao vivo e tirar dúvidas pedagógicas.');

  // Teacher mode: By default true ONLY if teacher enters via ?teacher=true, ?admin=true or previously authenticated
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      // Aluno oficial entrando por link exclusivo NUNCA entra em modo teacher
      if (params.get('student')) {
        sessionStorage.removeItem('fluent_teacher_auth');
        return false;
      }
      if (params.get('teacher') === 'true' || params.get('admin') === 'true' || params.get('teacher') === '1') {
        return true;
      }
      if (sessionStorage.getItem('fluent_teacher_auth') === 'true') {
        return true;
      }
    }
    return false;
  });

  const [isTeacherLoginModalOpen, setIsTeacherLoginModalOpen] = useState<boolean>(false);

  // Load user: student or default
  const [user, setUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const studentParam = params.get('student');
      const levelParam = params.get('level') as CEFRLevel | null;
      const trackParam = params.get('track') as StudentTrack | null;

      if (studentParam) {
        return getOrCreateStudentProfile(
          decodeURIComponent(studentParam),
          levelParam || undefined,
          trackParam || undefined
        );
      }

      const saved = localStorage.getItem('fluent_immersion_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return INITIAL_USER;
  });

  // Welcome banner if entering via student invite link (?student=Nome&level=B1&track=business)
  const [invitedBanner, setInvitedBanner] = useState<{
    name: string;
    level?: string;
    track?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const studentParam = params.get('student');
      const levelParam = params.get('level') as CEFRLevel | null;
      const rawTrack = params.get('track');
      const trackParam = (rawTrack as StudentTrack) || null;
      const teacherParam = params.get('teacher') || params.get('admin');

      if (teacherParam === 'true' || teacherParam === '1') {
        setIsTeacherMode(true);
        sessionStorage.setItem('fluent_teacher_auth', 'true');
        setCurrentTab('admin');
      } else if (studentParam) {
        // Aluno Oficial entrando por link exclusivo
        setIsTeacherMode(false);
        sessionStorage.removeItem('fluent_teacher_auth');
        const studentProfile = getOrCreateStudentProfile(
          decodeURIComponent(studentParam),
          levelParam || undefined,
          trackParam || undefined
        );
        setUser(studentProfile);
        setInvitedBanner({
          name: studentProfile.name,
          level: studentProfile.level,
          track: (studentProfile as any).enrolledTrack ? TRACK_INFO[(studentProfile as any).enrolledTrack as StudentTrack]?.label : undefined,
        });

        if (rawTrack === 'kids') {
          setCurrentTab('kids');
        } else if (rawTrack === 'speaking') {
          setCurrentTab('speaking');
        } else if (rawTrack === 'curriculum' || rawTrack === 'business' || rawTrack === 'biblico' || rawTrack === 'proficiencia') {
          setCurrentTab('curriculum');
        } else {
          setCurrentTab('dashboard');
        }
      }
    }

    // Always fetch remote lessons from Supabase on startup so student links see published lessons
    syncLessonsFromSupabase().catch((err) => {
      console.warn('Initial lessons sync from Supabase:', err);
    });
  }, []);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: '🔥 Mantenha sua Chama Acesa!',
      message: 'Faltam 5 minutos de prática hoje para proteger sua sequência de 14 dias!',
      type: 'streak',
      date: 'Hoje',
      read: false,
    },
    {
      id: 'notif-2',
      title: '🇬🇧 Teacher Marcelo na Sala ao Vivo',
      message: 'A aula sobre fonemas britânicos /θ/ e /ð/ começou. Conecte-se!',
      type: 'teacher',
      date: 'Há 10 min',
      read: false,
    },
    {
      id: 'notif-3',
      title: '🏆 Novo Desafio Semanal',
      message: 'Treine 3 frases no Pronunciation Lab com nota >90% e ganhe o badge Royal Speaker.',
      type: 'challenge',
      date: 'Ontem',
      read: true,
    },
  ]);

  // Save user profile changes locally
  useEffect(() => {
    localStorage.setItem('fluent_immersion_user', JSON.stringify(user));
  }, [user]);

  // Toggle dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleUpdateLevel = (level: CEFRLevel) => {
    sounds.playPop();
    setUser((prev) => {
      const updated = { ...prev, level };
      persistStudentProgress(updated);
      return updated;
    });
  };

  const handleAwardXP = (amount: number) => {
    sounds.playPop();
    setUser((prev) => {
      const updated: UserProfile = {
        ...prev,
        xp: prev.xp + amount,
        gems: prev.gems + Math.floor(amount / 10),
        studiedMinutesToday: Math.min(prev.dailyGoalMinutes, prev.studiedMinutesToday + 5),
        accuracyRate: prev.accuracyRate === 0 ? 86 : prev.accuracyRate,
      };
      persistStudentProgress(updated);
      return updated;
    });
  };

  const handleSelectTab = (tab: string) => {
    if (tab === 'admin' && !isTeacherMode) {
      setIsTeacherLoginModalOpen(true);
      return;
    }
    setCurrentTab(tab);
  };

  const handleToggleTeacherMode = () => {
    if (isTeacherMode) {
      setIsTeacherMode(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('fluent_teacher_auth');
      }
      if (currentTab === 'admin') setCurrentTab('dashboard');
      sounds.playPop();
    } else {
      setIsTeacherLoginModalOpen(true);
    }
  };

  const handleAddCustomLesson = (newLesson: Lesson) => {
    saveCustomLesson(newLesson);
    ALL_LESSONS.unshift(newLesson);
    sounds.playSuccess();
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleOpenWhatsAppWithTopic = (topic?: string) => {
    if (topic) setWhatsAppTopic(topic);
    setIsWhatsAppModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        user={user}
        onUpdateLevel={handleUpdateLevel}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isOffline={isOffline}
        onToggleOffline={() => {
          sounds.playPop();
          setIsOffline(!isOffline);
        }}
        onOpenWhatsApp={() => handleOpenWhatsAppWithTopic()}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        isTeacherMode={isTeacherMode}
        onToggleTeacherMode={handleToggleTeacherMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {invitedBanner && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#0b1b3d] via-purple-900 to-[#c8102e] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-scale-up border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/20 shadow-inner">
                🇬🇧
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-black text-rose-300 block">
                  Acesso Liberado • FLUENT IMMERSION
                </span>
                <h2 className="text-base sm:text-lg font-black">
                  Bem-vindo(a) à sua aula, {invitedBanner.name}!
                </h2>
                <p className="text-xs text-slate-200">
                  Nível inicial: <strong className="text-amber-300">{invitedBanner.level || user.level}</strong> • Trilha: <strong className="text-emerald-300">{invitedBanner.track || 'Geral'}</strong>. Bom aprendizado com o Teacher Marcelo!
                </p>
              </div>
            </div>
            <button
              onClick={() => setInvitedBanner(null)}
              className="px-4 py-2 rounded-xl bg-white text-[#0b1b3d] font-bold text-xs hover:bg-slate-100 transition shadow-sm whitespace-nowrap"
            >
              Bons Estudos 🚀
            </button>
          </div>
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            user={user}
            onNavigateTab={handleSelectTab}
            onOpenWhatsApp={() => handleOpenWhatsAppWithTopic()}
            isOffline={isOffline}
          />
        )}

        {currentTab === 'speaking' && (
          <SpeakingLabView
            currentLevel={user.level}
            onLevelChange={handleUpdateLevel}
            onAwardXP={handleAwardXP}
            onOpenWhatsApp={() => handleOpenWhatsAppWithTopic('Tenho dúvidas específicas sobre fonética britânica')}
          />
        )}

        {currentTab === 'curriculum' && (
          <CurriculumView
            currentLevel={user.level}
            onSelectLevel={handleUpdateLevel}
            onAwardXP={handleAwardXP}
          />
        )}

        {currentTab === 'kids' && (
          <KidsView
            onAwardXP={handleAwardXP}
            onOpenWhatsApp={() => handleOpenWhatsAppWithTopic('Gostaria de falar sobre o desenvolvimento do meu filho no Kids')}
          />
        )}

        {currentTab === 'live' && (
          <LiveClassView
            onOpenWhatsApp={() => handleOpenWhatsAppWithTopic('Gostaria de agendar uma aula ao vivo 1-on-1')}
          />
        )}

        {currentTab === 'leaderboard' && (
          <LeaderboardView user={user} />
        )}

        {currentTab === 'admin' && (
          isTeacherMode ? (
            <AdminView onAddCustomLesson={handleAddCustomLesson} />
          ) : (
            <div className="glass-card rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6 my-12">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  Área Restrita ao Teacher Marcelo
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Esta seção é exclusiva para coordenação pedagógica, cadastro de turmas e emissão de certificados.
                </p>
              </div>
              <button
                onClick={() => setIsTeacherLoginModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition"
              >
                Digitar Senha do Professor
              </button>
            </div>
          )
        )}
      </main>

      {/* Floating Teacher Marcelo WhatsApp Quick Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => handleOpenWhatsAppWithTopic()}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-2xl transition-all transform hover:scale-105 active:scale-95"
          aria-label="Falar com Teacher Marcelo no WhatsApp"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          <MessageSquare className="w-5 h-5" />
          <span className="hidden sm:inline">Dúvidas? Teacher Marcelo ({TEACHER_MARCELO.formattedPhone})</span>
        </button>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        defaultTopic={whatsAppTopic}
      />

      {/* Teacher Authentication Modal */}
      <TeacherLoginModal
        isOpen={isTeacherLoginModalOpen}
        onClose={() => setIsTeacherLoginModalOpen(false)}
        onSuccess={() => {
          setIsTeacherMode(true);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('fluent_teacher_auth', 'true');
          }
          setIsTeacherLoginModalOpen(false);
          setCurrentTab('admin');
        }}
      />

      {/* Global Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 no-print mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* British miniature flag badge */}
            <div className="w-6 h-4 bg-[#0b1b3d] rounded-xs border border-slate-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-[#c8102e] w-full h-[3px] top-1/2 -translate-y-1/2"></div>
              <div className="absolute inset-0 bg-[#c8102e] w-[3px] h-full left-1/2 -translate-x-1/2"></div>
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              FLUENT IMMERSION • Plataforma Interativa de Língua Inglesa
            </span>
          </div>

          {/* Teacher Mode Control in Footer */}
          <div className="flex items-center gap-3">
            {isTeacherMode ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 font-bold text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>👑 Modo Teacher Marcelo Ativo</span>
                <button
                  onClick={handleToggleTeacherMode}
                  className="ml-2 px-2 py-0.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] transition"
                  title="Alternar para a visualização idêntica à do aluno"
                >
                  Ver como Aluno
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsTeacherLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-500 hover:text-purple-700 dark:hover:text-purple-300 font-semibold text-xs transition border border-dashed border-slate-300 dark:border-slate-700"
              >
                <Lock className="w-3.5 h-3.5 text-purple-600" />
                <span>Área do Professor (Teacher Marcelo)</span>
              </button>
            )}
          </div>

          <div className="text-center md:text-right space-y-1">
            <p>
              Coordenação Pedagógica: <strong>Teacher Marcelo</strong> • WhatsApp: <strong>{TEACHER_MARCELO.formattedPhone}</strong>
            </p>
            <p className="text-[11px] text-slate-400 flex items-center justify-center md:justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Conformidade LGPD & Proteção de Dados • Sincronização em Nuvem e Acesso Offline
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
