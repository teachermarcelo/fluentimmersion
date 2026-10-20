/**
 * Cross-browser Speech Recognition & Synthesis utility
 */

export interface SpeechRecognitionListener {
  onStart?: () => void;
  onInterim?: (text: string) => void;
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

let recognitionInstance: any = null;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function startSpeechRecognition(
  listener: SpeechRecognitionListener,
  lang: string = 'en-GB'
): { stop: () => void; abort: () => void } {
  if (!isSpeechRecognitionSupported()) {
    listener.onError?.('Reconhecimento de voz não suportado neste navegador. Use Chrome, Edge ou Safari.');
    return { stop: () => {}, abort: () => {} };
  }

  try {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (recognitionInstance) {
      try {
        recognitionInstance.abort();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognitionInstance = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listener.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        listener.onInterim?.(interim);
      }
      if (final) {
        listener.onResult?.(final, true);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      listener.onError?.(event.error === 'no-speech' ? 'Nenhuma fala detectada. Tente falar mais perto do microfone.' : `Erro de áudio: ${event.error}`);
    };

    recognition.onend = () => {
      listener.onEnd?.();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {}
      },
      abort: () => {
        try {
          recognition.abort();
        } catch (e) {}
      },
    };
  } catch (err: any) {
    listener.onError?.(err.message || 'Falha ao iniciar reconhecimento de voz');
    return { stop: () => {}, abort: () => {} };
  }
}

// Text to speech playback
export function speakText(
  text: string,
  options: {
    lang?: 'en-GB' | 'en-US' | 'pt-BR';
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
  } = {}
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || 'en-GB';
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;

  if (options.onEnd) {
    utterance.onend = options.onEnd;
  }

  // Look for British English voice if requested
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const ukVoice = voices.find(v => v.lang.startsWith('en-GB') || v.name.includes('UK') || v.name.includes('British'));
    if (ukVoice && (options.lang === 'en-GB' || !options.lang)) {
      utterance.voice = ukVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Offline word similarity matching
export function compareWordsOffline(target: string, transcript: string) {
  const cleanTarget = target.toLowerCase().replace(/[^\w\s]/g, '').trim().split(/\s+/).filter(Boolean);
  const cleanUser = transcript.toLowerCase().replace(/[^\w\s]/g, '').trim().split(/\s+/).filter(Boolean);

  let correctCount = 0;
  const wordStatus = cleanTarget.map((targetWord) => {
    const isExact = cleanUser.includes(targetWord);
    if (isExact) {
      correctCount++;
      return { word: targetWord, status: 'correct' as const };
    }
    // Check close similarity
    const hasSimilar = cleanUser.some(uw => {
      const dist = levenshteinDistance(targetWord, uw);
      return dist <= 1 || (targetWord.length > 5 && dist <= 2);
    });

    if (hasSimilar) {
      correctCount += 0.7;
      return { word: targetWord, status: 'acceptable' as const };
    }

    return { word: targetWord, status: 'needs_work' as const };
  });

  const score = cleanTarget.length > 0 ? Math.round((correctCount / cleanTarget.length) * 100) : 0;
  return {
    score: Math.min(100, Math.max(10, score)),
    words: wordStatus,
  };
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = [];

  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[m][n];
}
