'use client';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { UseTtsReturn } from '@/types/Tts';
import { useCallback, useState } from 'react';
import usePersistentState from './usePersistentState';

export const useTts = (): UseTtsReturn => {
  const [isTtsEnabled, setIsTtsEnabled] = usePersistentState<boolean>(STORAGE_KEYS.ttsEnabled, false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const speak = useCallback(
    (text: string, lang: string): void => {
      if (!isTtsEnabled || !window.speechSynthesis) return;
      const utterance: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [isTtsEnabled]
  );

  const cancel = useCallback((): void => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { isTtsEnabled, setIsTtsEnabled, isSpeaking, speak, cancel };
};
