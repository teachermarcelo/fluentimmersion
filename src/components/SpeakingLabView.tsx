import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Award,
  ChevronRight,
  Flame,
  Radio,
  BookOpen,
} from 'lucide-react';
import { CEFRLevel, PronunciationFeedback, WordAnalysis, LessonCategory } from '../types';
import { PRONUNCIATION_DRILLS, TEACHER_MARCELO } from '../data/mockData';
import { TeacherEmblem } from './TeacherEmblem';
import {
  startSpeechRecognition,
  speakText,
  stopSpeaking,
  compareWordsOffline,
  isSpeechRecognitionSupported,
} from '../utils/speech';
import { sounds } from '../utils/audioEffects';
import { fireCelebrationConfetti } from '../utils/confetti';

interface SpeakingLabViewProps {
  currentLevel: CEFRLevel;
  onLevelChange: (level: CEFRLevel) => void;
  onAwardXP: (xp: number, speechScore?: number) => void;
  onOpenWhatsApp: () => void;
}

export const SpeakingLabView: React.FC<SpeakingLabViewProps> = ({
  currentLevel,
  onLevelChange,
  onAwardXP,
  onOpenWhatsApp,
}) => {
  const [selectedDrillIndex, setSelectedDrillIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<LessonCategory | 'all'>('all');
  const [customPhrase, setCustomPhrase] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [accent, setAccent] = useState<'en-GB' | 'en-US'>('en-GB');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const activeRecognition = useRef<{ stop: () => void; abort: () => void } | null>(null);

  const levelDrills = PRONUNCIATION_DRILLS.filter((d) => {
    const levelMatch = d.level === currentLevel;
    const catMatch = selectedCategory === 'all' || d.category === selectedCategory;
    return levelMatch && catMatch;
  });
  const fallbackDrill = PRONUNCIATION_DRILLS.find((d) => d.category === selectedCategory) || PRONUNCIATION_DRILLS[0];
  const activeDrill = levelDrills[selectedDrillIndex] || levelDrills[0] || fallbackDrill;
  const targetPhrase = customPhrase.trim() || activeDrill.phrase;

  useEffect(() => {
    setSelectedDrillIndex(0);
    setFeedback(null);
    setLiveTranscript('');
  }, [currentLevel, selectedCategory]);

  const handleListenTarget = () => {
    sounds.playPop();
    speakText(targetPhrase, {
      lang: accent,
      rate: playbackSpeed,
    });
  };

  const handleStartRecording = () => {
    setMicError(null);
    setLiveTranscript('');
    setInterimTranscript('');
    setFeedback(null);
    sounds.playPop();

    if (!isSpeechRecognitionSupported()) {
      setMicError('Seu navegador não suporta reconhecimento de voz Web Speech. Recomendamos o Google Chrome.');
      return;
    }

    setIsRecording(true);

    const rec = startSpeechRecognition(
      {
        onStart: () => {
          setIsRecording(true);
        },
        onInterim: (text) => {
          setInterimTranscript(text);
        },
        onResult: (text, isFinal) => {
          setLiveTranscript(text);
          if (isFinal) {
            handleCompleteSpeech(text);
          }
        },
        onError: (err) => {
          setMicError(err);
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        },
      },
      accent
    );

    activeRecognition.current = rec;
  };

  const handleStopRecording = () => {
    if (activeRecognition.current) {
      activeRecognition.current.stop();
    }
    setIsRecording(false);
  };

  const handleCompleteSpeech = async (transcript: string) => {
    setIsRecording(false);
    setIsAnalyzing(true);

    // Instant offline grading for immediate visual feedback
    const offlineResult = compareWordsOffline(targetPhrase, transcript);

    try {
      const response = await fetch('/api/pronunciation-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPhrase,
          userTranscript: transcript,
          level: currentLevel,
          accent: accent === 'en-GB' ? 'British' : 'American',
        }),
      });

      if (!response.ok) {
        throw new Error('API offline fallback');
      }

      const data: PronunciationFeedback = await response.json();
      setFeedback(data);

      if (data.score >= 85) {
        sounds.playSuccess();
        fireCelebrationConfetti();
        onAwardXP(50, data.score);
      } else if (data.score >= 60) {
        sounds.playCoin();
        onAwardXP(25, data.score);
      } else {
        sounds.playRetry();
        onAwardXP(10, data.score);
      }
    } catch (err) {
      // Graceful offline fallback
      const fallbackFeedback: PronunciationFeedback = {
        score: offlineResult.score,
        phoneticsIpa: activeDrill.ipa || `/${targetPhrase}/`,
        words: offlineResult.words.map((w) => ({
          word: w.word,
          status: w.status,
          ipa: `/${w.word}/`,
        })),
        mispronouncedWords: offlineResult.words.filter((w) => w.status === 'needs_work').map((w) => w.word),
        tonguePositionTip: activeDrill.focusHint || 'Mantenha a língua relaxada e atente-se às vogais longas britânicas.',
        pedagogicalFeedback: 'Bom esforço! O Teacher Marcelo recomenda praticar a cadência e a conexão entre as palavras.',
        accentDetected: accent === 'en-GB' ? 'British (RP)' : 'American',
      };
      setFeedback(fallbackFeedback);

      if (offlineResult.score >= 80) {
        sounds.playSuccess();
        fireCelebrationConfetti();
        onAwardXP(40, offlineResult.score);
      } else {
        sounds.playRetry();
        onAwardXP(15, offlineResult.score);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* British Flag Gradient Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0b1b3d] via-[#102a5c] to-[#c8102e] text-white p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            Laboratório Fonético com IA • Padrão Britânico (RP)
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Pronunciation & Acoustic Lab
          </h1>
          <p className="text-sm text-slate-200">
            Fale no microfone e receba pontuação instantânea, análise palavra por palavra, posição articulatória da língua e feedback pedagógico do <strong>Teacher Marcelo</strong>.
          </p>
        </div>

        {/* Level Badges */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => onLevelChange(lvl)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                currentLevel === lvl
                  ? 'bg-rose-600 text-white shadow-lg ring-2 ring-white/50 scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              Nível {lvl}
            </button>
          ))}
        </div>

        {/* Thematic Category Pills */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 mr-1">Trilha Fonética:</span>
          {[
            { id: 'all', label: 'Todas as Frases' },
            { id: 'geral', label: '🇬🇧 Geral Britânico' },
            { id: 'business', label: '💼 Business & Finanças' },
            { id: 'biblico', label: '📖 Bíblico & Oratória' },
            { id: 'proficiencia', label: '🎓 Proficiência (IELTS/Cambridge)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-slate-900 font-bold shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Target Phrase & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Drill Selector Ticker */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Exercício {selectedDrillIndex + 1} de {Math.max(1, levelDrills.length)}
                </span>
              </div>

              {levelDrills.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDrillIndex((prev) => (prev > 0 ? prev - 1 : levelDrills.length - 1));
                      setFeedback(null);
                      setLiveTranscript('');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDrillIndex((prev) => (prev + 1) % levelDrills.length);
                      setFeedback(null);
                      setLiveTranscript('');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    Próximo
                  </button>
                </div>
              )}
            </div>

            {/* Target Phrase Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Frase de Imersão (Target English):
                </span>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                  Foco: {activeDrill.targetSound}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  "{targetPhrase}"
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
                  <span className="font-mono bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-800 dark:text-slate-200">
                    {activeDrill.ipa}
                  </span>
                  <span>{activeDrill.translationPt}</span>
                </div>
              </div>
            </div>

            {/* Audio Playback Controls & Accent Selector */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleListenTarget}
                  className="px-4 py-2.5 rounded-xl bg-[#0b1b3d] hover:bg-[#102a5c] text-white text-xs font-bold flex items-center gap-2 shadow-md transition"
                >
                  <Volume2 className="w-4 h-4 text-amber-300" />
                  Ouvir Pronúncia Nativa
                </button>

                {/* Playback speed toggle */}
                <button
                  onClick={() => setPlaybackSpeed(playbackSpeed === 1.0 ? 0.75 : playbackSpeed === 0.75 ? 1.25 : 1.0)}
                  className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-xs"
                >
                  {playbackSpeed}x
                </button>
              </div>

              {/* Accent selection */}
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="text-slate-500 dark:text-slate-400">Sotaque:</span>
                <button
                  onClick={() => setAccent('en-GB')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                    accent === 'en-GB'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🇬🇧 British (RP)
                </button>
                <button
                  onClick={() => setAccent('en-US')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                    accent === 'en-US'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🇺🇸 American
                </button>
              </div>
            </div>

            {/* Live Recording Station */}
            <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-b from-slate-50 to-rose-50/30 dark:from-slate-900 dark:to-rose-950/20 border-2 border-dashed border-rose-300 dark:border-rose-900/50 space-y-4">
              <div className="relative">
                {isRecording && (
                  <span className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping"></span>
                )}
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isAnalyzing}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-105 active:scale-95 ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300 dark:ring-rose-900'
                      : 'bg-gradient-to-tr from-[#0b1b3d] to-rose-600 text-white'
                  }`}
                  aria-label={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
                >
                  {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {isRecording
                    ? 'Ouvindo sua pronúncia em tempo real...'
                    : isAnalyzing
                    ? 'Avaliando fonética com IA...'
                    : 'Clique no microfone e fale a frase em voz alta'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isRecording
                    ? 'Fale com clareza. Finalize a fala ou clique novamente para enviar.'
                    : 'A IA do Teacher Marcelo analisará a precisão acústica e ritmo.'}
                </p>
              </div>

              {micError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{micError}</span>
                </div>
              )}

              {/* Real-time Transcription Display */}
              {(liveTranscript || interimTranscript) && (
                <div className="w-full max-w-lg p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Transcrição Detectada:
                  </span>
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    {liveTranscript || interimTranscript}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Acoustic Analysis & Articulatory Guide */}
        <div className="space-y-6">
          {/* Real-time Score Gauge */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-500" />
              Resultado da Avaliação
            </h2>

            {feedback ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Precisão Acústica</span>
                    <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                      {feedback.score}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        feedback.score >= 85
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : feedback.score >= 60
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {feedback.score >= 85
                        ? 'Excelente (Nativo)'
                        : feedback.score >= 60
                        ? 'Compreensível'
                        : 'Ajuste Necessário'}
                    </span>
                  </div>
                </div>

                {/* Word by Word Breakdown */}
                <div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Análise Palavra por Palavra:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {feedback.words.map((w, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          w.status === 'correct'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : w.status === 'acceptable'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {w.word}
                        {w.status === 'correct' ? (
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Articulatory Phonetics Tip (Tongue & Mouth Placement) */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Posição Articulatória da Língua & Boca:
                  </h4>
                  <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                    {feedback.tonguePositionTip}
                  </p>
                </div>

                {/* Pedagogical Critique by Teacher Marcelo */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0b1b3d] to-[#102a5c] text-white space-y-2">
                  <div className="flex items-center gap-2.5">
                    <TeacherEmblem size="sm" />
                    <span className="text-xs font-bold text-amber-300">Feedback do Teacher Marcelo</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    "{feedback.pedagogicalFeedback}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3 text-slate-400">
                <Mic className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs">
                  Grave sua fala para receber o mapa fonético detalhado e a nota de sotaque britânico.
                </p>
              </div>
            )}
          </div>

          {/* Quick WhatsApp Support Trigger */}
          <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Dificuldade em algum som específico?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Envie um áudio diretamente para o Teacher Marcelo no WhatsApp para uma análise personalizada em 1-on-1.
            </p>
            <button
              onClick={onOpenWhatsApp}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              Pedir Ajuda no WhatsApp ({TEACHER_MARCELO.formattedPhone})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
