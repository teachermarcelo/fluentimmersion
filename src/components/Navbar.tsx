import React, { useState } from 'react';
import {
  Flame,
  Gem,
  Award,
  Bell,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Phone,
  Shield,
  Layers,
  Mic,
  GraduationCap,
  Sparkles,
  Video,
  Trophy,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { CEFRLevel, UserProfile, NotificationItem } from '../types';
import { TEACHER_MARCELO } from '../data/mockData';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: UserProfile;
  onUpdateLevel: (level: CEFRLevel) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onOpenWhatsApp: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  isTeacherMode?: boolean;
  onToggleTeacherMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onUpdateLevel,
  isDarkMode,
  onToggleDarkMode,
  isOffline,
  onToggleOffline,
  onOpenWhatsApp,
  notifications,
  onMarkNotificationRead,
  isTeacherMode = false,
  onToggleTeacherMode,
}) => {
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const levels: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Teacher Marcelo Quick Banner */}
      <div className="bg-gradient-to-r from-[#0b1b3d] via-[#102a5c] to-[#c8102e] text-white py-1.5 px-4 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Stylized Union Jack Mini badge */}
          <div className="flex items-center justify-center w-5 h-3.5 bg-[#0b1b3d] rounded-xs overflow-hidden border border-white/40 shadow-xs relative">
            <div className="absolute inset-0 bg-[#c8102e] w-full h-[3px] top-1/2 -translate-y-1/2"></div>
            <div className="absolute inset-0 bg-[#c8102e] w-[3px] h-full left-1/2 -translate-x-1/2"></div>
          </div>
          <span>
            <strong className="font-semibold text-amber-300">FLUENT IMMERSION</strong> • Metodologia Britânica com IA e Suporte Personalizado
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isTeacherMode && onToggleTeacherMode && (
            <button
              onClick={onToggleTeacherMode}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-xs text-[11px]"
              title="Clique para alternar para a visão de aluno"
            >
              <span>👁️ Ver como Aluno</span>
            </button>
          )}

          <button
            onClick={onOpenWhatsApp}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition shadow-xs text-xs"
          >
            <Phone className="w-3 h-3" />
            <span className="hidden sm:inline">Falar com Teacher Marcelo: <strong>{TEACHER_MARCELO.formattedPhone}</strong></span>
            <span className="sm:hidden font-bold">WhatsApp Teacher</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0b1b3d] via-[#1b365d] to-[#c8102e] p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0b1b3d] rounded-[10px] flex items-center justify-center text-white">
                  <span className="font-black text-lg tracking-wider text-rose-500">F</span>
                  <span className="font-black text-lg tracking-wider text-white">I</span>
                </div>
              </div>
              <div>
                <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-[#0b1b3d] dark:from-white via-[#1b365d] dark:via-blue-200 to-[#c8102e] bg-clip-text text-transparent">
                  FLUENT IMMERSION
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                  By Teacher Marcelo
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-800/80">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentTab === 'dashboard'
                  ? 'bg-[#0b1b3d] text-white shadow-sm dark:bg-rose-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              onClick={() => onSelectTab('speaking')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentTab === 'speaking'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Pronunciation Lab
            </button>

            <button
              onClick={() => onSelectTab('curriculum')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentTab === 'curriculum'
                  ? 'bg-[#0b1b3d] text-white shadow-sm dark:bg-rose-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              A0 a C2
            </button>

            <button
              onClick={() => onSelectTab('kids')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-kids transition ${
                currentTab === 'kids'
                  ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-md'
                  : 'text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Fluent Kids
            </button>

            <button
              onClick={() => onSelectTab('live')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentTab === 'live'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              Sala ao Vivo
            </button>

            <button
              onClick={() => onSelectTab('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentTab === 'leaderboard'
                  ? 'bg-[#0b1b3d] text-white shadow-sm dark:bg-rose-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Ranking
            </button>

            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                currentTab === 'admin'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-200/80 dark:border-purple-800/80'
              }`}
              title="Área Administrativa do Professor Teacher Marcelo"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Admin</span>
            </button>
          </nav>

          {/* User Metrics & Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isTeacherMode ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 text-xs font-bold shadow-xs">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="hidden sm:inline">Teacher Marcelo • Coordenador Pedagógico</span>
                  <span className="sm:hidden">Teacher</span>
                </div>
              </div>
            ) : (
              <>
                {/* Streak Counter */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
                  <span>{user.streak}d</span>
                </div>

                {/* XP Counter */}
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span>{user.xp} XP</span>
                </div>

                {/* Gems */}
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold">
                  <Gem className="w-4 h-4 text-rose-500" />
                  <span>{user.gems}</span>
                </div>

                {/* Level Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b1b3d] dark:bg-slate-800 text-white text-xs font-bold hover:bg-[#1b365d] transition shadow-xs"
                  >
                    <span>Nível: {user.level}</span>
                  </button>

                  {showLevelDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-scale-up">
                      <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Alterar Nível CEFR
                      </div>
                      {levels.map((lvl) => (
                        <button
                          key={lvl}
                      onClick={() => {
                        onUpdateLevel(lvl);
                        setShowLevelDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        user.level === lvl ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{lvl} {lvl === 'A0' ? '(Starter)' : lvl === 'C2' ? '(Proficiency)' : ''}</span>
                      {user.level === lvl && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

            {/* Offline Mode Toggle with Cloud Sync simulation */}
            <button
              onClick={onToggleOffline}
              title={isOffline ? 'Modo Offline Ativo - Conteúdo em cache local' : 'Modo Online com Sincronização em Nuvem'}
              className={`p-2 rounded-xl transition ${
                isOffline
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 ring-2 ring-amber-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Notificações Inteligentes
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Retenção e Metas
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto mt-1">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-2 text-xs cursor-pointer rounded-lg transition ${
                          n.read ? 'opacity-60' : 'bg-slate-50 dark:bg-slate-800/60 font-semibold'
                        }`}
                      >
                        <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Switcher */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              aria-label="Alternar tema escuro"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Tab bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 text-xs">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-2.5 py-1 rounded-lg ${currentTab === 'dashboard' ? 'bg-[#0b1b3d] text-white' : 'text-slate-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('speaking')}
            className={`px-2.5 py-1 rounded-lg ${currentTab === 'speaking' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600'}`}
          >
            Pronúncia
          </button>
          <button
            onClick={() => onSelectTab('curriculum')}
            className={`px-2.5 py-1 rounded-lg ${currentTab === 'curriculum' ? 'bg-[#0b1b3d] text-white' : 'text-slate-600'}`}
          >
            A0-C2
          </button>
          <button
            onClick={() => onSelectTab('kids')}
            className={`px-2.5 py-1 rounded-lg ${currentTab === 'kids' ? 'bg-pink-600 text-white font-bold' : 'text-slate-600'}`}
          >
            Kids
          </button>
          <button
            onClick={() => onSelectTab('live')}
            className={`px-2.5 py-1 rounded-lg ${currentTab === 'live' ? 'bg-red-600 text-white' : 'text-slate-600'}`}
          >
            Ao Vivo
          </button>
          <button
            onClick={() => onSelectTab('leaderboard')}
            className={`px-2.5 py-1 rounded-lg ${currentTab === 'leaderboard' ? 'bg-[#0b1b3d] text-white font-bold' : 'text-slate-600'}`}
          >
            Ranking
          </button>
          <button
            onClick={() => onSelectTab('admin')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
              currentTab === 'admin'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
