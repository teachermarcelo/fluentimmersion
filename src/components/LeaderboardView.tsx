import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Award,
  Crown,
  Medal,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  Star,
  CheckCircle,
} from 'lucide-react';
import { GLOBAL_LEADERBOARD, TEACHER_MARCELO } from '../data/mockData';
import { UserProfile } from '../types';

interface LeaderboardViewProps {
  user: UserProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ user }) => {
  const [filter, setFilter] = useState<'weekly' | 'allTime' | 'kids'>('weekly');

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0b1b3d] via-[#102a5c] to-[#c8102e] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            Liga dos Campeões Britânicos • Fluent Immersion
          </div>
          <h1 className="text-2xl sm:text-4xl font-black">
            Ranking Global & Desafios Semanais
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Suba de divisão acumulando XP nas atividades de fala, listening e leitura em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-1 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setFilter('weekly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'weekly' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-200 hover:text-white'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setFilter('allTime')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'allTime' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-200 hover:text-white'
            }`}
          >
            Geral
          </button>
          <button
            onClick={() => setFilter('kids')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'kids' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-200 hover:text-white'
            }`}
          >
            Kids League
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 Podium & Leaderboard Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 3 Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-4">
            {/* Rank 2 */}
            <div className="glass-card rounded-3xl p-4 text-center space-y-2 border-2 border-slate-300 dark:border-slate-700 order-1">
              <span className="text-xs font-black text-slate-400 block">#2 Prata</span>
              <img
                src={GLOBAL_LEADERBOARD[1].avatar}
                alt={GLOBAL_LEADERBOARD[1].name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto object-cover border-2 border-slate-300 shadow-md"
              />
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {GLOBAL_LEADERBOARD[1].name}
              </p>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">
                {GLOBAL_LEADERBOARD[1].xp} XP
              </span>
            </div>

            {/* Rank 1 (Champion) */}
            <div className="glass-card rounded-3xl p-5 text-center space-y-2 border-4 border-amber-400 shadow-xl bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900 order-2 -translate-y-3">
              <div className="flex justify-center -mt-8">
                <Crown className="w-8 h-8 text-amber-500 fill-amber-400 animate-bounce" />
              </div>
              <span className="text-xs font-black text-amber-600 block">#1 Campeã Ouro</span>
              <img
                src={GLOBAL_LEADERBOARD[0].avatar}
                alt={GLOBAL_LEADERBOARD[0].name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto object-cover border-4 border-amber-400 shadow-lg"
              />
              <p className="text-xs sm:text-base font-black text-slate-800 dark:text-slate-100 truncate">
                {GLOBAL_LEADERBOARD[0].name}
              </p>
              <span className="text-sm font-black text-rose-600 dark:text-rose-400 block">
                {GLOBAL_LEADERBOARD[0].xp} XP
              </span>
            </div>

            {/* Rank 3 (User) */}
            <div className="glass-card rounded-3xl p-4 text-center space-y-2 border-2 border-amber-600/50 dark:border-amber-900/60 order-3">
              <span className="text-xs font-black text-amber-700 block">#3 Bronze</span>
              <img
                src={GLOBAL_LEADERBOARD[2].avatar}
                alt={GLOBAL_LEADERBOARD[2].name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto object-cover border-2 border-amber-600 shadow-md ring-2 ring-rose-500"
              />
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {GLOBAL_LEADERBOARD[2].name}
              </p>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">
                {GLOBAL_LEADERBOARD[2].xp} XP
              </span>
            </div>
          </div>

          {/* Full Table */}
          <div className="glass-card rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>Posição & Aluno</span>
              <div className="flex items-center gap-8">
                <span>Nível</span>
                <span>Sequência</span>
                <span>XP Total</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {GLOBAL_LEADERBOARD.map((item) => {
                const isCurrentUser = item.name.includes('Você');
                return (
                  <div
                    key={item.rank}
                    className={`p-4 flex items-center justify-between transition ${
                      isCurrentUser
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-l-4 border-rose-600 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-black text-sm text-slate-500">
                        {item.rank}
                      </span>
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {item.name}
                        </p>
                        <span className="text-[10px] text-slate-400">{item.tier}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-8 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold">
                        {item.level}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {item.streak}d
                      </span>
                      <span className="font-black text-slate-900 dark:text-white sm:w-16 text-right">
                        {item.xp} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Missions & Badges */}
        <div className="space-y-6">
          {/* Active Missions */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Missões Ativas da Semana
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>🎙️ 3 Sessões no Pronunciation Lab</span>
                  <span className="text-rose-600">3/3 Feito!</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full"></div>
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Concluído • +100 XP Creditado
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>✍️ 1 Redação Corrigida com IA</span>
                  <span className="text-purple-600">1/1 Feito!</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full w-full"></div>
                </div>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Concluído • +80 XP Creditado
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>🇬🇧 Participar da Sala ao Vivo</span>
                  <span className="text-blue-600">0/1 Pendente</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-0"></div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Recompensa: +150 XP e Emblema Royal Attendee
                </p>
              </div>
            </div>
          </div>

          {/* User's Badges */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-500" />
              Suas Conquistas Desbloqueadas
            </h2>

            <div className="space-y-2.5">
              {user.badges.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0b1b3d] to-rose-600 text-white flex items-center justify-center font-bold">
                    <Crown className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {b.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {b.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
