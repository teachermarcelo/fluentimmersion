import React from 'react';
import {
  Flame,
  Award,
  Mic,
  BookOpen,
  Headphones,
  PenTool,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Compass,
  Star,
  Zap,
  TrendingUp,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, CEFRLevel } from '../types';
import { TEACHER_MARCELO } from '../data/mockData';
import { TeacherEmblem } from './TeacherEmblem';

interface DashboardViewProps {
  user: UserProfile;
  onNavigateTab: (tab: string) => void;
  onOpenWhatsApp: () => void;
  isOffline: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNavigateTab,
  onOpenWhatsApp,
  isOffline,
}) => {
  const dailyProgressPercent = Math.min(100, Math.round((user.studiedMinutesToday / user.dailyGoalMinutes) * 100));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* British Flag Hero Banner with London Landmarks */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Background gradient with British Flag inspired colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1b3d] via-[#102a5c] to-[#8b1122]"></div>
        
        {/* Subtle Union Jack geometric cross overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#c8102e" strokeWidth="24" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="#c8102e" strokeWidth="24" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#ffffff" strokeWidth="48" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#c8102e" strokeWidth="28" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#ffffff" strokeWidth="48" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#c8102e" strokeWidth="28" />
          </svg>
        </div>

        {/* Content & Imagery */}
        <div className="relative z-10 p-6 sm:p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Plataforma Oficial FLUENT IMMERSION • Nível {user.level}
              </div>

              {((user as any).enrolledTrack || user.role === 'student') && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-xs font-bold text-emerald-300">
                  <span>Trilha: {(user as any).enrolledTrack === 'kids' ? '🧸 Fluent Kids' : (user as any).enrolledTrack === 'business' ? '💼 Business' : (user as any).enrolledTrack === 'biblico' ? '📖 Bíblico' : (user as any).enrolledTrack === 'proficiencia' ? '🎯 Proficiência' : (user as any).enrolledTrack === 'all_access' ? '🌟 VIP Acesso Total' : '🎓 Geral (A0-C2)'}</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Welcome{user.xp > 0 ? ' back' : ''}, <span className="text-rose-400">{user.name.split(' ')[0]}</span>!
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              {user.xp === 0
                ? `Olá, ${user.name}! Seu acesso exclusivo foi liberado pelo Teacher Marcelo. Inicie agora sua primeira prática fonética para começar a registrar seu progresso!`
                : 'Imersão ativa na língua e cultura britânica. Pratique hoje sua pronúncia em tempo real com avaliação de IA e feedback pedagógico do Teacher Marcelo.'}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('speaking')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-600/40 flex items-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <Mic className="w-4 h-4 text-amber-300" />
                Treinar Pronúncia em Tempo Real
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('live')}
                className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-sm border border-white/30 flex items-center gap-2 transition"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Sala ao Vivo com Teacher Marcelo
              </button>
            </div>
          </div>

          {/* British Iconic Visual Showcase */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-80">
            {/* Big Ben Card */}
            <div className="relative rounded-2xl overflow-hidden h-32 group border border-white/20 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80"
                alt="Big Ben London"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white tracking-wide">Big Ben & Westminster</span>
              </div>
            </div>

            {/* Red Double Decker Bus */}
            <div className="relative rounded-2xl overflow-hidden h-32 group border border-white/20 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=400&q=80"
                alt="London Red Double Decker Bus"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white tracking-wide">Red Double Decker</span>
              </div>
            </div>

            {/* Tower Bridge */}
            <div className="relative rounded-2xl overflow-hidden h-32 group border border-white/20 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=400&q=80"
                alt="Tower Bridge London"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white tracking-wide">Tower Bridge</span>
              </div>
            </div>

            {/* Red Telephone Box */}
            <div className="relative rounded-2xl overflow-hidden h-32 group border border-white/20 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=400&q=80"
                alt="British Red Phone Box"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white tracking-wide">British Phone Box</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats ticker */}
        <div className="bg-[#0b1b3d]/90 backdrop-blur-sm border-t border-white/10 px-6 py-3 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Flame className="w-4 h-4 text-amber-400" />
              Sequência: <strong className="text-white">{user.streak > 1 ? `${user.streak} dias seguidos` : user.xp > 0 ? '1º dia de imersão' : 'Iniciando ofensiva hoje'}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Precisão de Fala: <strong className="text-white">{user.accuracyRate > 0 ? `${user.accuracyRate}%` : 'Aguardando 1º áudio'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Sincronização em tempo real {isOffline ? '(Modo Offline Local)' : '(Nuvem Conectada)'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Goals, Skills & Teacher Marcelo Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Goal & Motivational Mission */}
        <div className="glass-card rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              Meta Diária de Imersão
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              {user.studiedMinutesToday} / {user.dailyGoalMinutes} min
            </span>
          </div>

          {/* Circular Progress Bar */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-rose-600 transition-all duration-1000 ease-out"
                  strokeDasharray={`${dailyProgressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-black text-slate-800 dark:text-slate-100">{dailyProgressPercent}%</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Faltam apenas {Math.max(0, user.dailyGoalMinutes - user.studiedMinutesToday)} minutos hoje!
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Mantenha sua chama acesa para ganhar 50 XP bônus e subir para a Liga Royal.
              </p>
            </div>
          </div>

          {/* Weekly Mission Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/60 dark:to-slate-800/30 p-4 rounded-2xl border border-blue-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Desafio Semanal: Sotaque Britânico RP
              </span>
              <span>2/3 concluídos</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-2/3"></div>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Complete 3 treinos de pronúncia com nota acima de 90% para destravar o emblema <strong>Royal Speaker</strong>.
            </p>
          </div>
        </div>

        {/* The 4 Core Skills Overview (Reading, Writing, Listening, Speaking) */}
        <div className="glass-card rounded-3xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                As 4 Habilidades Integradas (A0 a C2) & Trilhas Especiais
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Treine com auxílio de IA no modo Geral, Business, Bíblico ou Proficiência
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('curriculum')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              Ver Grade Completa
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Speaking Skill Card */}
            <div
              onClick={() => onNavigateTab('speaking')}
              className="cursor-pointer group p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50/50 dark:from-rose-950/20 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/40 hover:shadow-lg transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                  92% Precisão
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-600 transition">
                Speaking & Pronunciation Lab
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Reconhecimento de voz em tempo real e avaliação fonética precisa de cada palavra.
              </p>
            </div>

            {/* Listening Skill Card */}
            <div
              onClick={() => onNavigateTab('curriculum')}
              className="cursor-pointer group p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/40 hover:shadow-lg transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#0b1b3d] text-white flex items-center justify-center shadow-md">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                  88% Precisão
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition">
                Listening & Dictation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Áudios autênticos com sotaques de Londres, Manchester e Oxford com controle de velocidade.
              </p>
            </div>

            {/* Reading Skill Card */}
            <div
              onClick={() => onNavigateTab('curriculum')}
              className="cursor-pointer group p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-900/40 hover:shadow-lg transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                  94% Precisão
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition">
                Reading & Neural Translation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Textos culturais britânicos com dicionário inteligente e tradução contextual por toque.
              </p>
            </div>

            {/* Writing Skill Card */}
            <div
              onClick={() => onNavigateTab('curriculum')}
              className="cursor-pointer group p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50/50 dark:from-purple-950/20 dark:to-slate-900 border border-purple-200/80 dark:border-purple-900/40 hover:shadow-lg transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <PenTool className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                  85% Precisão
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 transition">
                Writing & Grammar Coach
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Correção imediata de redações e e-mails de trabalho com sugestões de vocabulário avançado.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Marcelo's Pedagogical Hub & Direct Contact */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0b1b3d] to-[#1a386b] text-white p-6 sm:p-8 shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <TeacherEmblem size="xl" />

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{TEACHER_MARCELO.name}</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Coordenação Pedagógica
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              "Para acelerar seu inglês rumo ao C2, foque hoje na articulação dos fonemas <strong>/θ/</strong> e <strong>/ð/</strong> no Pronunciation Lab. Estou disponível no WhatsApp para planejar seu plano de estudos individual."
            </p>
          </div>
        </div>

        <button
          onClick={onOpenWhatsApp}
          className="w-full md:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition"
        >
          <MessageCircle className="w-4 h-4" />
          Falar no WhatsApp: {TEACHER_MARCELO.formattedPhone}
        </button>
      </div>
    </div>
  );
};
