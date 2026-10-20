import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Hand,
  MessageSquare,
  Users,
  PenTool,
  Eraser,
  Sparkles,
  Send,
  HelpCircle,
  Calendar,
  CheckCircle,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { TEACHER_MARCELO } from '../data/mockData';
import { TeacherEmblem } from './TeacherEmblem';
import { sounds } from '../utils/audioEffects';
import { fireCelebrationConfetti } from '../utils/confetti';

interface LiveClassViewProps {
  onOpenWhatsApp: () => void;
}

export const LiveClassView: React.FC<LiveClassViewProps> = ({ onOpenWhatsApp }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string; isTeacher?: boolean }[]>([
    { sender: 'Teacher Marcelo', text: 'Welcome everyone! Today we are dissecting Received Pronunciation and connected speech!', time: '19:00', isTeacher: true },
    { sender: 'Camila Rossi', text: 'Hello Teacher! Excited for the lesson.', time: '19:01' },
    { sender: 'Mateus Carvalho', text: 'Good evening from Curitiba!', time: '19:01' },
  ]);
  const [newMsg, setNewMsg] = useState('');

  // Interactive Whiteboard Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#c8102e'); // British red
  const [penWidth, setPenWidth] = useState(3);

  // Live Poll State
  const [pollVoted, setPollVoted] = useState<number | null>(null);

  // Personalized Study Plan Generator State
  const [studentName, setStudentName] = useState('Lucas Silva');
  const [studyPlanResult, setStudyPlanResult] = useState<any | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sounds.playPop();
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    sounds.playPop();
    setChatMessages((prev) => [
      ...prev,
      { sender: 'Você (Lucas)', text: newMsg.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setNewMsg('');
  };

  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
    sounds.playCoin();
  };

  const handleGenerateStudyPlan = async () => {
    setIsGeneratingPlan(true);
    sounds.playPop();
    try {
      const res = await fetch('/api/teacher/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          level: 'B1',
          focusAreas: ['Speaking (Phonetics /θ/ and /ð/)', 'Listening (British RP)', 'Writing (Formal Emails)'],
          weeklyHours: 5,
        }),
      });
      const data = await res.json();
      setStudyPlanResult(data);
      sounds.playSuccess();
      fireCelebrationConfetti();
    } catch {
      setStudyPlanResult({
        planTitle: `Plano de Imersão Britânica - ${studentName}`,
        weeklyGoals: [
          '3 sessões no Pronunciation Lab com foco em /θ/ e /ð/',
          '1 participação na Sala ao Vivo com Teacher Marcelo',
          '2 atividades de listening com sotaque de Londres',
        ],
        teacherMarceloNote: 'Mantenha o ritmo! Estou à disposição no WhatsApp para tirar dúvidas.',
      });
      sounds.playSuccess();
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0b1b3d] via-[#102a5c] to-[#c8102e] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-xs font-bold uppercase tracking-wider animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Aula Interativa Ao Vivo com Teacher Marcelo
          </div>
          <h1 className="text-2xl sm:text-4xl font-black">
            Sala de Aula Imersiva & Videoconferência
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Transmissão em tempo real, lousa interativa, enquetes de compreensão e planos pedagógicos personalizados.
          </p>
        </div>

        <button
          onClick={onOpenWhatsApp}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition"
        >
          <Calendar className="w-4 h-4" />
          Agendar Aula 1-on-1 no WhatsApp
        </button>
      </div>

      {/* Main Classroom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Teacher Video & Interactive Whiteboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Broadcast Simulation */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-video shadow-2xl border-2 border-slate-800 flex items-center justify-center">
            {/* Live Studio Feed of Teacher Marcelo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#071329] via-[#0b1b3d] to-[#1a2d54] flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-rose-500/20 rounded-full blur-xl animate-pulse"></div>
                <TeacherEmblem size="xl" />
              </div>
              
              <div className="space-y-1 z-10 max-w-md">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                  Transmissão Oficial • Masterclass ao Vivo
                </span>
                <h4 className="text-lg font-black text-white">
                  Teacher Marcelo • Sala Principal
                </h4>
                <p className="text-xs text-slate-300">
                  "Bem-vindos! Pratique agora a prosódia britânica e entonação de oratória."
                </p>
              </div>

              {/* Acoustic Wave Animation */}
              <div className="flex items-center gap-1.5 h-6 z-10">
                <span className="w-1 bg-rose-500 h-3 rounded-full animate-pulse"></span>
                <span className="w-1 bg-amber-400 h-6 rounded-full animate-bounce"></span>
                <span className="w-1 bg-emerald-400 h-4 rounded-full animate-pulse"></span>
                <span className="w-1 bg-rose-500 h-6 rounded-full animate-bounce"></span>
                <span className="w-1 bg-amber-400 h-3 rounded-full animate-pulse"></span>
                <span className="w-1 bg-emerald-400 h-5 rounded-full animate-bounce"></span>
              </div>
            </div>

            {/* Live Badges Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                AO VIVO
              </span>
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> 18 Alunos Conectados
              </span>
            </div>

            {/* Teacher Name Tag */}
            <div className="absolute bottom-4 left-4 p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-white flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              <div>
                <p className="text-xs font-bold">{TEACHER_MARCELO.name}</p>
                <p className="text-[10px] text-slate-300">Tópico: Nuances do Sotaque Britânico RP & Entonação</p>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-2 rounded-xl transition ${isMicOn ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-rose-400'}`}
                title="Microfone do Aluno"
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={`p-2 rounded-xl transition ${isCameraOn ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-rose-400'}`}
                title="Câmera do Aluno"
              >
                {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <button
                onClick={handleRaiseHand}
                className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold ${
                  handRaised ? 'bg-amber-500 text-white animate-bounce' : 'bg-slate-800 text-slate-300'
                }`}
                title="Levantar a mão para falar"
              >
                <Hand className="w-4 h-4" />
                {handRaised && <span>Mão Levantada!</span>}
              </button>
            </div>
          </div>

          {/* Digital Interactive Whiteboard */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Lousa Interativa Digital (Teacher Marcelo & Alunos)
                </h3>
              </div>

              {/* Whiteboard tool buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPenColor('#c8102e')}
                  className={`w-6 h-6 rounded-full bg-[#c8102e] border-2 ${penColor === '#c8102e' ? 'border-white ring-2 ring-rose-500' : 'border-transparent'}`}
                />
                <button
                  onClick={() => setPenColor('#0b1b3d')}
                  className={`w-6 h-6 rounded-full bg-[#0b1b3d] border-2 ${penColor === '#0b1b3d' ? 'border-white ring-2 ring-blue-500' : 'border-transparent'}`}
                />
                <button
                  onClick={() => setPenColor('#10b981')}
                  className={`w-6 h-6 rounded-full bg-emerald-500 border-2 ${penColor === '#10b981' ? 'border-white ring-2 ring-emerald-500' : 'border-transparent'}`}
                />
                <button
                  onClick={clearCanvas}
                  className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                >
                  <Eraser className="w-3.5 h-3.5" /> Limpar Lousa
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Desenhe esquemas fonéticos, anote dúvidas de vocabulário ou pratique a escrita em tempo real.
            </p>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={700}
                height={260}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-64 touch-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Chat, Live Quiz & Custom Study Plan */}
        <div className="space-y-6">
          {/* Live Quick Poll by Teacher Marcelo */}
          <div className="glass-card rounded-3xl p-5 space-y-3 border-2 border-rose-200 dark:border-rose-900/40">
            <span className="text-xs font-bold uppercase text-rose-600 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Pergunta Relâmpago do Teacher Marcelo:
            </span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              "No sotaque britânico Received Pronunciation (RP), a letra 'R' no final de palavras (ex: 'car', 'water') costuma ser:"
            </p>

            <div className="space-y-2">
              {['Pronunciada fortemente enrolando a língua', 'Não pronunciada (não-rótico), alongando a vogal anterior', 'Substituída por som de L'].map(
                (opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPollVoted(idx);
                      sounds.playPop();
                      if (idx === 1) {
                        sounds.playSuccess();
                        fireCelebrationConfetti();
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition border ${
                      pollVoted === idx
                        ? idx === 1
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold'
                          : 'bg-rose-100 text-rose-800 border-rose-400'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                )
              )}
            </div>

            {pollVoted !== null && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                {pollVoted === 1
                  ? 'Correto! O inglês britânico padrão é não-rótico (/kɑː/, /ˈwɔːtə/).'
                  : 'Dica do Teacher: Lembre-se que o RP não é rótico!'}
              </p>
            )}
          </div>

          {/* Live Chat */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                Chat da Aula ao Vivo
              </h3>
              <span className="text-[10px] text-slate-400">Tempo Real</span>
            </div>

            <div className="h-44 overflow-y-auto space-y-2.5 pr-1">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl text-xs space-y-0.5 ${
                    msg.isTeacher
                      ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-slate-800 dark:text-slate-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-rose-600 dark:text-rose-400">
                      {msg.sender}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Enviar mensagem para o Teacher..."
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* AI Personalized Study Plan Generator */}
          <div className="glass-card rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Gerador de Plano de Estudo Individual
            </h3>
            <p className="text-xs text-slate-500">
              Gere um cronograma semanal customizado com metas ajustadas pelo Teacher Marcelo.
            </p>

            <button
              onClick={handleGenerateStudyPlan}
              disabled={isGeneratingPlan}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0b1b3d] to-[#1b365d] text-white text-xs font-bold shadow-md hover:from-rose-600 hover:to-red-600 transition disabled:opacity-50"
            >
              {isGeneratingPlan ? 'Criando Plano com IA...' : 'Gerar Meu Plano Semanal'}
            </button>

            {studyPlanResult && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2 animate-fade-in">
                <span className="font-bold text-slate-800 dark:text-slate-100 block">
                  {studyPlanResult.planTitle}
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  {studyPlanResult.weeklyGoals?.map((g: string, i: number) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
                <p className="text-[11px] italic text-rose-600 dark:text-rose-400">
                  "{studyPlanResult.teacherMarceloNote}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
