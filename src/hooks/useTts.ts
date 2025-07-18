import { useState, useEffect, useCallback, useRef } from 'react';

// Regex pour nettoyer le texte : supprime les émojis et les caractères de formatage Markdown.
const CLEAN_TEXT_REGEX: RegExp = /([\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26ff]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff]|\*|_|#|`)/g;

const cleanText = (text: string): string => {
  return text.replace(CLEAN_TEXT_REGEX, '').trim();
};

export const useTts = () => {
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(() => {
    const saved: string | null = localStorage.getItem('tts-enabled');
    return saved ? JSON.parse(saved) : false;
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const streamCancelledRef = useRef<boolean>(false);

  useEffect(() => {
    localStorage.setItem('tts-enabled', JSON.stringify(isTtsEnabled));
  }, [isTtsEnabled]);

  const processQueue = useCallback((): void => {
    if (!isTtsEnabled || utteranceQueueRef.current.length === 0 || window.speechSynthesis.speaking) {
      return;
    }

    const utterance: SpeechSynthesisUtterance | undefined = utteranceQueueRef.current.shift();
    if (utterance) {
      utterance.onstart = (): void => setIsSpeaking(true);
      utterance.onend = (): void => {
        setTimeout((): void => {
          setIsSpeaking(false);
          processQueue(); // Lance la phrase suivante
        }, 150);
      };
      utterance.onerror = (e: SpeechSynthesisErrorEvent): void => {
        if (e.error !== 'interrupted') {
          console.error("Erreur de SpeechSynthesis:", e);
        }
        setIsSpeaking(false);
        processQueue();
      };
      window.speechSynthesis.speak(utterance);
    }
  }, [isTtsEnabled]);

  const speak = useCallback((text: string, lang: string = 'fr-FR'): void => {
    if (!isTtsEnabled || !text.trim() || streamCancelledRef.current) return;

    const cleaned: string = cleanText(text);
    if (!cleaned) return;

    const utterance: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = lang;
    utteranceQueueRef.current.push(utterance);

    processQueue();
  }, [isTtsEnabled, processQueue]);

  const start = (): void => {
    streamCancelledRef.current = false;
  };

  const cancel = (): void => {
    streamCancelledRef.current = true;
    utteranceQueueRef.current = []; // Vide la file d'attente
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    return (): void => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    isTtsEnabled,
    setIsTtsEnabled,
    isSpeaking,
    speak,
    start,
    cancel,
  };
};