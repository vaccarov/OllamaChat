'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { ModelContext } from '@/context/ModelContextDefinition';
import type { UseTtsReturn } from '@/types/Tts';
import { apiFetch } from '@/utils/api';
import usePersistentState from './usePersistentState';

export const useTts = (): UseTtsReturn => {
  const { serverUrl } = useContext(ModelContext)!;
  const [isTtsEnabled, setIsTtsEnabled] = usePersistentState<boolean>(
    STORAGE_KEYS.ttsEnabled,
    false
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    async (text: string, _lang: string): Promise<void> => {
      if (!isTtsEnabled || !serverUrl) return;

      try {
        const blob = await apiFetch<Blob>(serverUrl, '/tts', {
          method: 'POST',
          body: JSON.stringify({ text }),
          responseType: 'blob',
        });

        const url = URL.createObjectURL(blob);

        if (audioRef.current) {
          audioRef.current.pause();
        }

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };

        audio.play();
      } catch (error) {
        console.error('TTS Error:', error);
        setIsSpeaking(false);
      }
    },
    [isTtsEnabled, serverUrl]
  );

  const cancel = useCallback((): void => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      }
    };
  }, []);

  return { isTtsEnabled, setIsTtsEnabled, isSpeaking, speak, cancel };
};
