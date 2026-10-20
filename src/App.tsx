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
import { INITIAL_USER, TEACHER_MARCELO, ALL_LESSONS } from './data/mockData';
import { CEFRLevel, UserProfile, NotificationItem, Lesson } from './types';
import { MessageSquare, Phone, ShieldCheck, Heart } from 'lucide-react';
import { sounds } from './utils/audioEffects';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [whatsAppTopic, setWhatsAppTopic] = useState<string>('Gostaria de agendar uma aula ao vivo e tirar dúvidas pedagógicas.');

  // Load user from localStorage or fallback
  const [user, setUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
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
      const trackParam = params.get('track');

      if (studentParam) {
        setUser((prev) => ({
          ...prev,
          name: decodeURIComponent(studentParam),
          level: levelParam || prev.level,
        }));
        setInvitedBanner({
          name: decodeURIComponent(studentParam),
          level: levelParam || undefined,
          track: trackParam || undefined,
        });

        if (trackParam === 'kids') {
          setCurrentTab('kids');
        } else if (trackParam === 'speaking') {
          setCurrentTab('speaking');
        } else if (trackParam === 'curriculum' || trackParam === 'business' || trackParam === 'biblico' || trackParam === 'proficiencia') {
          setCurrentTab('curriculum');
        }
      }
    }
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
    setUser((prev) => ({ ...prev, level }));
  };

  const handleAwardXP = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      xp: prev.xp + amount,
      gems: prev.gems + Math.floor(amount / 10),
      studiedMinutesToday: Math.min(prev.dailyGoalMinutes, prev.studiedMinutesToday + 5),
    }));
  };

  const handleAddCustomLesson = (newLesson: Lesson) => {
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
        onSelectTab={setCurrentTab}
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
            onNavigateTab={setCurrentTab}
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
          <AdminView onAddCustomLesson={handleAddCustomLesson} />
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

      {/* Global Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 no-print">
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
