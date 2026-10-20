import React, { useState } from 'react';
import {
  Sparkles,
  Gamepad2,
  Star,
  Trophy,
  Volume2,
  RotateCcw,
  Heart,
  CheckCircle,
  FileText,
  Printer,
  ShieldCheck,
  Smile,
  BookOpen,
} from 'lucide-react';
import { KidsGame, Lesson } from '../types';
import { KIDS_GAMES, TEACHER_MARCELO, ALL_LESSONS } from '../data/mockData';
import { TeacherEmblem } from './TeacherEmblem';
import { speakText } from '../utils/speech';
import { sounds } from '../utils/audioEffects';
import { fireKidsStars } from '../utils/confetti';

interface KidsViewProps {
  onAwardXP: (xp: number) => void;
  onOpenWhatsApp: () => void;
}

export const KidsView: React.FC<KidsViewProps> = ({ onAwardXP, onOpenWhatsApp }) => {
  const [activeTab, setActiveTab] = useState<'games' | 'parents'>('games');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [selectedKidsLesson, setSelectedKidsLesson] = useState<Lesson | null>(null);

  // Phonics Pop Game state
  const phonicsItems = [
    { letter: 'A', word: 'Apple', sound: '/æ/', emoji: '🍎' },
    { letter: 'B', word: 'Red Bus', sound: '/b/', emoji: '🚌' },
    { letter: 'C', word: 'Crown', sound: '/k/', emoji: '👑' },
    { letter: 'D', word: 'Dog (Corgi)', sound: '/d/', emoji: '🐶' },
    { letter: 'T', word: 'Tea Cup', sound: '/t/', emoji: '🫖' },
    { letter: 'L', word: 'London Lion', sound: '/l/', emoji: '🦁' },
  ];
  const [poppedLetters, setPoppedLetters] = useState<string[]>([]);
  const [starsCollected, setStarsCollected] = useState(12);

  // Memory Game state
  const memoryCardsInitial = [
    { id: 1, name: 'Big Ben', emoji: '🕰️', matched: false },
    { id: 2, name: 'Red Bus', emoji: '🚌', matched: false },
    { id: 3, name: 'Royal Crown', emoji: '👑', matched: false },
    { id: 4, name: 'Corgi', emoji: '🐕', matched: false },
    { id: 5, name: 'Big Ben', emoji: '🕰️', matched: false },
    { id: 6, name: 'Red Bus', emoji: '🚌', matched: false },
    { id: 7, name: 'Royal Crown', emoji: '👑', matched: false },
    { id: 8, name: 'Corgi', emoji: '🐕', matched: false },
  ];
  const [memoryCards, setMemoryCards] = useState(memoryCardsInitial);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

  // Phonics click handler
  const handlePopLetter = (item: typeof phonicsItems[0]) => {
    sounds.playPop();
    speakText(item.word, { lang: 'en-GB', pitch: 1.2 });

    if (!poppedLetters.includes(item.letter)) {
      const nextPopped = [...poppedLetters, item.letter];
      setPoppedLetters(nextPopped);
      setStarsCollected((prev) => prev + 1);
      sounds.playCoin();

      if (nextPopped.length === phonicsItems.length) {
        sounds.playSuccess();
        fireKidsStars();
        onAwardXP(40);
      }
    }
  };

  // Memory card click handler
  const handleCardClick = (index: number) => {
    if (flippedIndices.length >= 2 || memoryCards[index].matched || flippedIndices.includes(index)) {
      return;
    }

    sounds.playPop();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const card1 = memoryCards[newFlipped[0]];
      const card2 = memoryCards[newFlipped[1]];

      if (card1.name === card2.name) {
        sounds.playCoin();
        speakText(card1.name, { lang: 'en-GB' });
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c, i) => (i === newFlipped[0] || i === newFlipped[1] ? { ...c, matched: true } : c))
          );
          setFlippedIndices([]);
          setStarsCollected((s) => s + 2);
          fireKidsStars();
        }, 500);
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 font-kids">
      {/* Kids Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600 p-6 sm:p-10 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              Área Segura & Lúdica • Fluent Immersion Kids
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-wide">
              Aprenda Inglês Brincando com Leo & Penny! 🦁🇬🇧
            </h1>
            <p className="text-sm sm:text-base text-amber-100 font-medium">
              Jogos divertidos, sons dos animais, histórias em Londres e figurinhas mágicas para colecionar.
            </p>
          </div>

          {/* Star Jar & Switcher */}
          <div className="flex flex-col items-center gap-3 bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/30">
            <div className="flex items-center gap-2 text-2xl font-black text-amber-300">
              <Star className="w-8 h-8 fill-amber-300 text-amber-400 animate-bounce" />
              <span>{starsCollected} Estrelinhas</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('games')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition shadow-sm ${
                  activeTab === 'games'
                    ? 'bg-white text-indigo-900 shadow-md scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                🎮 Jogos Infantis
              </button>
              <button
                onClick={() => setActiveTab('parents')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition shadow-sm ${
                  activeTab === 'parents'
                    ? 'bg-white text-indigo-900 shadow-md scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                📊 Relatório dos Pais
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Games or Parents Report */}
      {activeTab === 'games' ? (
        <div className="space-y-8">
          {/* Active Mini-Game Container */}
          {activeGame === 'phonics' ? (
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border-4 border-amber-300">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🫧</span>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    Phonics Bubble Pop! (Estoure as Bolhas de Sons)
                  </h2>
                </div>
                <button
                  onClick={() => setActiveGame(null)}
                  className="px-4 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Voltar ao Menu
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Clique nas bolhas mágicas para ouvir a pronúncia britânica da palavra e ganhar estrelinhas!
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {phonicsItems.map((item) => {
                  const isPopped = poppedLetters.includes(item.letter);
                  return (
                    <button
                      key={item.letter}
                      onClick={() => handlePopLetter(item)}
                      className={`p-6 rounded-3xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center gap-2 border-2 ${
                        isPopped
                          ? 'bg-gradient-to-tr from-emerald-100 to-teal-100 border-emerald-400 text-emerald-900 shadow-md'
                          : 'bg-gradient-to-tr from-pink-50 to-amber-50 dark:from-slate-800 dark:to-slate-800/60 border-pink-300 dark:border-slate-700 hover:shadow-lg'
                      }`}
                    >
                      <span className="text-4xl animate-pulse">{item.emoji}</span>
                      <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                        {item.letter}
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {item.word}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {item.sound}
                      </span>
                      {isPopped && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Aprendido!
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : activeGame === 'memory' ? (
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border-4 border-indigo-300">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🃏</span>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    London Memory Match (Jogo da Memória)
                  </h2>
                </div>
                <button
                  onClick={() => setActiveGame(null)}
                  className="px-4 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Voltar ao Menu
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {memoryCards.map((card, idx) => {
                  const isFlipped = flippedIndices.includes(idx) || card.matched;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleCardClick(idx)}
                      className={`h-28 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 text-center p-2 border-2 ${
                        isFlipped
                          ? 'bg-white dark:bg-slate-800 border-indigo-400 shadow-md scale-100'
                          : 'bg-gradient-to-tr from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-sm hover:scale-105'
                      }`}
                    >
                      {isFlipped ? (
                        <>
                          <span className="text-3xl mb-1">{card.emoji}</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {card.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-black">🇬🇧 ?</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Kids Games Selection Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {KIDS_GAMES.map((game) => (
                <div
                  key={game.id}
                  className="glass-card rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition duration-300 border-2 border-pink-200 dark:border-slate-800 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300">
                        {game.category}
                      </span>
                      <span className="text-xs font-bold text-amber-500 flex items-center">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {game.stars}/{game.maxStars}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Faixa etária: {game.ageGroup} anos • Interativo com áudio nativo
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playPop();
                      setActiveGame(game.type === 'memory' ? 'memory' : 'phonics');
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-black text-sm shadow-md transition"
                  >
                    Jogar Agora!
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Kids Interactive Lessons created by Teacher Marcelo */}
          {ALL_LESSONS.filter((l) => l.targetAudience === 'kids').length > 0 && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border-2 border-amber-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🇬🇧</span>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                    Aulas Especiais do Teacher Marcelo no Kids
                  </h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                  Criadas no CMS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ALL_LESSONS.filter((l) => l.targetAudience === 'kids').map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-5 rounded-2xl bg-gradient-to-tr from-amber-50 to-pink-50 dark:from-slate-800 dark:to-slate-900 border border-amber-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-600 uppercase">
                        Nível {lesson.level} • Lição #{lesson.orderIndex || 1}
                      </span>
                      <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> +{lesson.xpReward} XP
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-800 dark:text-slate-100">
                      {lesson.title}
                    </h4>

                    {lesson.customHtml && (
                      <div
                        className="rounded-xl overflow-hidden p-3 bg-white/70 dark:bg-slate-800/80 border border-amber-200/50"
                        dangerouslySetInnerHTML={{ __html: lesson.customHtml }}
                      />
                    )}

                    <button
                      onClick={() => {
                        sounds.playSuccess();
                        fireKidsStars();
                        onAwardXP(lesson.xpReward);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-black text-xs shadow-md transition"
                    >
                      🌟 Concluir Aula e Ganhar Estrelas!
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sticker Cabinet / Kids Rewards */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Álbum de Figurinhas Mágicas de Londres
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-center space-y-1">
                <span className="text-4xl block">👑</span>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Guarda da Rainha</span>
                <span className="text-[10px] text-slate-500 block">Desbloqueado</span>
              </div>
              <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 text-center space-y-1">
                <span className="text-4xl block">🚌</span>
                <span className="text-xs font-bold text-pink-800 dark:text-pink-300">Ônibus Vermelho</span>
                <span className="text-[10px] text-slate-500 block">Desbloqueado</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 text-center space-y-1">
                <span className="text-4xl block">🕰️</span>
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Sininho Big Ben</span>
                <span className="text-[10px] text-slate-500 block">Desbloqueado</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center space-y-1 opacity-70">
                <span className="text-4xl block">🏰</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Castelo de Windsor</span>
                <span className="text-[10px] text-slate-400 block">Jogue mais 2 partidas</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Parental Progress Report */
        <div className="glass-card rounded-3xl p-6 sm:p-10 space-y-8 animate-fade-in border-2 border-indigo-200 dark:border-indigo-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Área Exclusiva dos Pais & Responsáveis
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
                Relatório de Desempenho e Engajamento Infantil
              </h2>
              <p className="text-xs text-slate-500">
                Aluno(a): Enzo Silva • Idade: 7 anos • Orientação Pedagógica: Teacher Marcelo
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-2xl bg-[#0b1b3d] hover:bg-[#102a5c] text-white text-xs font-bold flex items-center gap-2 shadow-md no-print"
            >
              <Printer className="w-4 h-4" />
              Imprimir Certificado / PDF
            </button>
          </div>

          {/* Parental Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 space-y-2">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Tempo de Tela Educativo</span>
              <span className="text-3xl font-black text-blue-900 dark:text-blue-100 block">3h 45min</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                100% focado em conteúdos fonéticos seguros e gamificados.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Palavras Fixadas</span>
              <span className="text-3xl font-black text-emerald-900 dark:text-emerald-100 block">48 palavras</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Excelente retenção nos nomes de animais, cores e cumprimentos em inglês.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Precisão Auditiva & Fala</span>
              <span className="text-3xl font-black text-amber-900 dark:text-amber-100 block">94%</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Grande facilidade com o sotaque britânico no jogo de Phonics.
              </p>
            </div>
          </div>

          {/* Teacher Marcelo's Note to Parents */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0b1b3d] to-[#1a386b] text-white space-y-3">
            <div className="flex items-center gap-3">
              <TeacherEmblem size="md" />
              <div>
                <h3 className="text-base font-bold text-amber-300">Parecer Pedagógico do Teacher Marcelo</h3>
                <p className="text-xs text-slate-300">Diretor Pedagógico FLUENT IMMERSION</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              "Enzo demonstra um ritmo de absorção impressionante. O cérebro infantil responde com extrema velocidade ao pareamento de som nativo e imagem. Recomendo manter 15 minutos diários de jogos e praticar as palavras do Red Bus durante o dia a dia da família. Estou à disposição dos responsáveis no WhatsApp para qualquer orientação personalizada!"
            </p>
            <div className="pt-2 flex justify-end no-print">
              <button
                onClick={onOpenWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-md"
              >
                Falar com Teacher Marcelo no WhatsApp ({TEACHER_MARCELO.formattedPhone})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
