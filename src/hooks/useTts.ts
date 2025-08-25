'use client';

import { UseTtsReturn } from '@/types/Tts';
import { useCallback, useEffect, useState } from 'react';

export const useTts = (): UseTtsReturn => {
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    const saved: string | null = localStorage.getItem('tts-enabled');
    setIsTtsEnabled(saved ? JSON.parse(saved) : false);
  }, []);

  useEffect(() => {
    localStorage.setItem('tts-enabled', JSON.stringify(isTtsEnabled));
  }, [isTtsEnabled]);

  const speak = useCallback((text: string, lang: string): void => {
    if (!isTtsEnabled || !window.speechSynthesis) return;
    const utterance: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [isTtsEnabled]);

  const cancel = useCallback((): void => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { isTtsEnabled, setIsTtsEnabled, isSpeaking, speak, cancel };
};