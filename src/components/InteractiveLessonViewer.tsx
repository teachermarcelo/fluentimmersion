import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Minimize2, RotateCcw, Award, CheckCircle2, Volume2, Sparkles, AlertCircle } from 'lucide-react';
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
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
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
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-2 sm:p-6 flex flex-col'
          : `w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${className}`
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 text-xs shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
            {title || 'Atividade Interativa'}
          </span>
          {isCompleteDocument && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px] shrink-0">
              ⚡ Web App / Artifact Ativo
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleRestart}
            title="Recarregar Lição"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia (ESC)' : 'Expandir em Tela Cheia'}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1 font-semibold text-[11px]"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sair Tela Cheia</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Modo Imersivo</span>
              </>
            )}
          </button>

          {isStudentView && onComplete && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isCompleted}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition ${
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

      {/* Frame Container */}
      <div
        className={`relative flex-1 w-full bg-slate-950 flex items-center justify-center overflow-hidden ${
          isFullscreen ? 'h-[calc(100vh-60px)]' : deviceMode === 'mobile' ? 'min-h-[580px]' : 'min-h-[520px]'
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
            className="w-full h-full border-none block"
            style={{
              minHeight: isFullscreen ? 'calc(100vh - 65px)' : deviceMode === 'mobile' ? '560px' : '520px',
            }}
          />
        </div>
      </div>
    </div>
  );
};
