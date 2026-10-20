import React, { useState } from 'react';
import { MessageSquare, Phone, Send, X, ExternalLink, CheckCircle } from 'lucide-react';
import { TEACHER_MARCELO } from '../data/mockData';
import { TeacherEmblem } from './TeacherEmblem';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = 'Gostaria de agendar uma aula ao vivo e tirar dúvidas pedagógicas.',
}) => {
  const [studentName, setStudentName] = useState('Lucas Silva');
  const [topic, setTopic] = useState(defaultTopic);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá Teacher Marcelo! Meu nome é ${studentName}. Vim pela plataforma FLUENT IMMERSION.\n\nMensagem: ${topic}`
    );
    const url = `https://wa.me/55${TEACHER_MARCELO.whatsapp}?text=${text}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(TEACHER_MARCELO.whatsapp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header with British Flag + WhatsApp styling */}
        <div className="bg-gradient-to-r from-[#0b1b3d] via-[#1b365d] to-[#c8102e] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition text-white"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <TeacherEmblem size="lg" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
                WhatsApp Oficial • Online
              </div>
              <h3 className="text-xl font-bold">{TEACHER_MARCELO.name}</h3>
              <p className="text-xs text-slate-200">
                {TEACHER_MARCELO.role} • FLUENT IMMERSION
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shadow-sm">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  Contato Direto (WhatsApp)
                </p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {TEACHER_MARCELO.formattedPhone}
                </p>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 shadow-sm"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Copiado!
                </>
              ) : (
                'Copiar'
              )}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Seu Nome:
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assunto / Mensagem para o Teacher Marcelo:
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Digite sua dúvida ou o que precisa..."
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setTopic('Gostaria de agendar uma aula particular de nivelamento.')}
              className="text-left p-2 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              📅 Agendar nivelamento
            </button>
            <button
              type="button"
              onClick={() => setTopic('Tenho dúvidas sobre a pronúncia do fonema /θ/ da lição.')}
              className="text-left p-2 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              🎙️ Dúvida de fonética
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleOpenWhatsApp}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
          >
            <Send className="w-4 h-4" />
            Iniciar Conversa no WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
