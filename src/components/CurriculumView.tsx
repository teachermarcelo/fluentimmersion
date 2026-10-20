import React, { useState } from 'react';
import {
  Layers,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Volume2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Languages,
  Send,
  Award,
} from 'lucide-react';
import { CEFRLevel, Lesson, SkillType, LessonCategory } from '../types';
import { ALL_LESSONS } from '../data/mockData';
import { speakText } from '../utils/speech';
import { sounds } from '../utils/audioEffects';
import { fireCelebrationConfetti } from '../utils/confetti';

interface CurriculumViewProps {
  currentLevel: CEFRLevel;
  onSelectLevel: (lvl: CEFRLevel) => void;
  onAwardXP: (xp: number) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  currentLevel,
  onSelectLevel,
  onAwardXP,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<LessonCategory | 'all'>('all');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Lesson state
  const [quizAnswers, setQuizAnswers] = useState<{ [index: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [writingInput, setWritingInput] = useState('');
  const [writingAnalysis, setWritingAnalysis] = useState<any | null>(null);
  const [isSubmittingWriting, setIsSubmittingWriting] = useState(false);
  const [translatedWord, setTranslatedWord] = useState<{ word: string; translation: string; note?: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const filteredLessons = ALL_LESSONS
    .filter((l) => {
      const levelMatch = l.level === currentLevel;
      const skillMatch = selectedSkill === 'all' || l.skill === selectedSkill;
      const categoryMatch = selectedCategory === 'all' || l.category === selectedCategory;
      return levelMatch && skillMatch && categoryMatch;
    })
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const handleStartLesson = (lesson: Lesson) => {
    sounds.playPop();
    setActiveLesson(lesson);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setWritingInput('');
    setWritingAnalysis(null);
    setTranslatedWord(null);
  };

  const handleTranslateWord = async (word: string) => {
    const clean = word.replace(/[^\w]/g, '').trim();
    if (!clean) return;

    sounds.playPop();
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, sourceLang: 'en', targetLang: 'pt' }),
      });
      const data = await res.json();
      setTranslatedWord({
        word: clean,
        translation: data.translatedText || clean,
        note: data.explanation || data.grammaticalNotes,
      });
    } catch {
      setTranslatedWord({
        word: clean,
        translation: 'Tradução rápida em modo offline.',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleEvaluateWriting = async () => {
    if (!writingInput.trim()) return;

    setIsSubmittingWriting(true);
    sounds.playPop();
    try {
      const res = await fetch('/api/writing-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptTopic: activeLesson?.content.writingPrompt || 'Writing practice',
          studentText: writingInput,
          level: currentLevel,
        }),
      });
      const data = await res.json();
      setWritingAnalysis(data);

      if (data.overallScore >= 80) {
        sounds.playSuccess();
        fireCelebrationConfetti();
        onAwardXP(activeLesson?.xpReward || 50);
      } else {
        sounds.playCoin();
        onAwardXP(25);
      }
    } catch {
      setWritingAnalysis({
        overallScore: 85,
        grammarScore: 82,
        vocabularyScore: 88,
        coherenceScore: 85,
        feedback: 'Bom texto! Mantenha a clareza e variedade lexical.',
        correctedText: writingInput,
      });
      sounds.playSuccess();
      onAwardXP(30);
    } finally {
      setIsSubmittingWriting(false);
    }
  };

  const handleCompleteQuiz = () => {
    setQuizSubmitted(true);
    let correct = 0;
    activeLesson?.content.multipleChoice?.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });

    if (correct > 0) {
      sounds.playSuccess();
      fireCelebrationConfetti();
      onAwardXP(activeLesson?.xpReward || 50);
    } else {
      sounds.playRetry();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b1b3d] via-[#102a5c] to-[#c8102e] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Grade Curricular Oficial • Quadro Europeu (CEFR)
            </span>
            <h1 className="text-2xl sm:text-4xl font-black">
              Trilhas de Aprendizado: A0 até C2
            </h1>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl backdrop-blur-md">
            {(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onSelectLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  currentLevel === lvl
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Skill filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => setSelectedSkill('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedSkill === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Todas as Habilidades
          </button>
          <button
            onClick={() => setSelectedSkill('reading')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              selectedSkill === 'reading'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Leitura
          </button>
          <button
            onClick={() => setSelectedSkill('writing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              selectedSkill === 'writing'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" /> Escrita
          </button>
          <button
            onClick={() => setSelectedSkill('listening')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              selectedSkill === 'listening'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" /> Escuta
          </button>
          <button
            onClick={() => setSelectedSkill('speaking')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              selectedSkill === 'speaking'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> Fala
          </button>
        </div>

        {/* Thematic Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          <span className="text-xs font-bold text-amber-300 mr-1">Trilhas Especiais:</span>
          {[
            { id: 'all', label: 'Todas as Lições' },
            { id: 'geral', label: '🇬🇧 Geral Britânico' },
            { id: 'business', label: '💼 Business & Finanças' },
            { id: 'biblico', label: '📖 Bíblico & Teologia' },
            { id: 'proficiencia', label: '🎓 Proficiência (IELTS/Cambridge)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-slate-900 font-bold shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {activeLesson ? (
        /* Active Lesson Player */
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 animate-scale-up">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold uppercase">
                {activeLesson.level} • {activeLesson.skill}
              </span>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {activeLesson.title}
              </h2>
            </div>

            <button
              onClick={() => setActiveLesson(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
            >
              Voltar às Lições
            </button>
          </div>

          {/* Reading Lesson Content with Interactive Click-to-Translate */}
          {activeLesson.content.readingText && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold flex items-center gap-1">
                  <Languages className="w-4 h-4 text-emerald-500" />
                  Dica: Toque em qualquer palavra para tradução neural e pronúncia imediata!
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 leading-relaxed text-base sm:text-lg text-slate-800 dark:text-slate-100 font-medium">
                {activeLesson.content.readingText.split(' ').map((word, idx) => (
                  <span
                    key={idx}
                    onClick={() => handleTranslateWord(word)}
                    className="inline-block cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-600 rounded px-1 transition duration-150 mr-1"
                  >
                    {word}
                  </span>
                ))}
              </div>

              {/* Translation popup bubble */}
              {translatedWord && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-4 animate-fade-in">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                        "{translatedWord.word}"
                      </span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">
                        ➜ {translatedWord.translation}
                      </span>
                    </div>
                    {translatedWord.note && (
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">
                        {translatedWord.note}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => speakText(translatedWord.word, { lang: 'en-GB' })}
                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                    title="Ouvir pronúncia britânica"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Writing Coach Lesson */}
          {activeLesson.content.writingPrompt && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-2">
                <span className="text-xs font-bold uppercase text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" />
                  Desafio de Redação & Gramática (Teacher Marcelo)
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {activeLesson.content.writingPrompt}
                </p>
              </div>

              <div>
                <textarea
                  rows={5}
                  value={writingInput}
                  onChange={(e) => setWritingInput(e.target.value)}
                  placeholder="Escreva sua resposta em inglês aqui..."
                  className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleEvaluateWriting}
                disabled={isSubmittingWriting || !writingInput.trim()}
                className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md flex items-center gap-2 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {isSubmittingWriting ? 'Analisando Gramática com IA...' : 'Enviar para Correção com IA'}
              </button>

              {writingAnalysis && (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Pontuação Geral: <strong className="text-purple-600 text-xl">{writingAnalysis.overallScore}/100</strong>
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                      CEFR {currentLevel}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Feedback do Professor:
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {writingAnalysis.feedback}
                    </p>
                  </div>

                  {writingAnalysis.correctedText && (
                    <div className="space-y-1 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Versão Polida Recomendada:
                      </span>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {writingAnalysis.correctedText}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Multiple Choice Quiz */}
          {activeLesson.content.multipleChoice && (
            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Questões de Fixação e Compreensão:
              </h3>

              {activeLesson.content.multipleChoice.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {qIdx + 1}. {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[qIdx] === optIdx;
                      const isCorrect = optIdx === q.correctIndex;

                      let btnStyle = 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700';
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-400 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-400';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-600 text-white font-bold border-rose-600';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
                          className={`p-3.5 rounded-xl border text-left text-xs transition ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
                      <strong>Explicação:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              {!quizSubmitted ? (
                <button
                  onClick={handleCompleteQuiz}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md"
                >
                  Conferir Respostas e Ganhar +{activeLesson.xpReward} XP
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Lição Concluída com Sucesso!
                  </span>
                  <button
                    onClick={() => setActiveLesson(null)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold"
                  >
                    Próxima Lição
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Lessons Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="glass-card rounded-3xl p-6 space-y-4 hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        lesson.skill === 'speaking'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          : lesson.skill === 'writing'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                          : lesson.skill === 'listening'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      }`}
                    >
                      {lesson.level} • {lesson.skill}
                    </span>
                    {lesson.category && lesson.category !== 'geral' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        {lesson.category === 'business' ? '💼 Business' : lesson.category === 'biblico' ? '📖 Bíblico' : '🎓 Proficiência'}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> +{lesson.xpReward} XP
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-600 transition">
                  {lesson.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {lesson.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Duração: ~{lesson.durationMinutes} min
                </span>

                <button
                  onClick={() => handleStartLesson(lesson)}
                  className="px-4 py-2 rounded-xl bg-[#0b1b3d] dark:bg-slate-800 hover:bg-rose-600 dark:hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  Iniciar Lição
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
