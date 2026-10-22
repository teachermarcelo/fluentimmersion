import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Minimize2, RotateCcw, Award, CheckCircle2, Volume2, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { sounds } from '../utils/audioEffects';
import { fireCelebrationConfetti } from '../utils/confetti';

interface InteractiveLessonViewerProps {
  htmlContent?: string;
  srcUrl?: string;
  title: string;
  xpReward?: number;
  onComplete?: () => void;
  isStudentView?: boolean;
  deviceMode?: 'desktop' | 'mobile';
  className?: string;
  defaultFullscreen?: boolean;
  onClose?: () => void;
}

export const InteractiveLessonViewer: React.FC<InteractiveLessonViewerProps> = ({
  htmlContent = '',
  srcUrl,
  title,
  xpReward = 80,
  onComplete,
  isStudentView = true,
  deviceMode = 'desktop',
  className = '',
  defaultFullscreen = false,
  onClose,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(defaultFullscreen);
  const [iframeKey, setIframeKey] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if content is a URL path (e.g. /lessons/lesson-13-dates.html)
  const isUrl = !!srcUrl || (typeof htmlContent === 'string' && (htmlContent.startsWith('/') || htmlContent.startsWith('http')));
  const effectiveSrc = srcUrl || (isUrl ? htmlContent.trim() : undefined);

  // Check if content is a complete HTML document or contains scripts/styles
  const isCompleteDocument =
    isUrl ||
    /<!doctype html>/i.test(htmlContent) ||
    /<html[\s>]/i.test(htmlContent) ||
    /<head[\s>]/i.test(htmlContent) ||
    /<body[\s>]/i.test(htmlContent) ||
    /<script[\s>]/i.test(htmlContent) ||
    /<style[\s>]/i.test(htmlContent);

  // Build sanitized srcDoc
  const getDocumentSrcDoc = () => {
    if (effectiveSrc) return undefined;
    if (!htmlContent) return '<html><body style="font-family:sans-serif;padding:20px;text-align:center;color:#64748b;">Nenhum conteúdo HTML carregado.</body></html>';

    // If it's already a full HTML document, return as is
    if (/<!doctype html>/i.test(htmlContent) || /<html[\s>]/i.test(htmlContent)) {
      return htmlContent;
    }

    // Wrap snippet into a beautiful, self-contained British Immersion document
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Aula Interativa'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #091326;
      color: #f1f5f9;
      padding: 16px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    a { color: #f59e0b; }
    button { cursor: pointer; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
  };

  const handleRestart = () => {
    sounds.playPop();
    setIframeKey((prev) => prev + 1);
  };

  const handleComplete = () => {
    sounds.playSuccess();
    fireCelebrationConfetti();
    setIsCompleted(true);
    if (onComplete) onComplete();
  };

  const toggleFullscreen = () => {
    sounds.playPop();
    setIsFullscreen((prev) => !prev);
  };

  // Close fullscreen on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
        else if (isFullscreen) setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 w-screen h-screen flex flex-col p-0 overflow-hidden'
          : `w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${className}`
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-slate-900 border-b border-slate-800 text-xs shrink-0 gap-2 text-slate-100 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          {onClose && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-white font-extrabold text-xs transition border border-slate-700 shrink-0"
              title="Voltar às Lições (ESC)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="font-extrabold text-white truncate max-w-xs sm:max-w-md lg:max-w-lg">
              {title || 'Atividade Interativa'}
            </span>
            {isCompleteDocument && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700 font-bold text-[10px] shrink-0">
                ⚡ Web App Ativo
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleRestart}
            title="Recarregar Lição"
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Reduzir para modo janela (ESC)' : 'Expandir em tela inteira'}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 font-bold text-[11px] border border-slate-700"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modo Janela</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline text-amber-300">Tela Inteira</span>
              </>
            )}
          </button>

          {isStudentView && onComplete && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isCompleted}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition ${
                isCompleted
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white active:scale-95'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5 text-amber-300" /> Concluir (+{xpReward} XP)
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Frame Container taking 100% of available viewport */}
      <div
        className={`relative flex-1 w-full bg-slate-950 flex items-center justify-center overflow-hidden ${
          isFullscreen ? 'h-[calc(100vh-46px)] flex-1' : deviceMode === 'mobile' ? 'min-h-[580px]' : 'min-h-[520px]'
        }`}
      >
        <div
          className={`h-full transition-all duration-300 ${
            deviceMode === 'mobile' && !isFullscreen
              ? 'w-[375px] max-w-full my-auto rounded-[32px] overflow-hidden border-4 border-slate-700 shadow-2xl bg-black'
              : 'w-full h-full'
          }`}
        >
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={effectiveSrc}
            srcDoc={getDocumentSrcDoc()}
            title={title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            className="w-full h-full border-none block bg-white"
            style={{
              minHeight: isFullscreen ? 'calc(100vh - 46px)' : deviceMode === 'mobile' ? '560px' : '520px',
            }}
          />
        </div>
      </div>
    </div>
  );
};
