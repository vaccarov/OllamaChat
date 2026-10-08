'use client';

import { useLocalStorage } from '@mantine/hooks';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { ModelContext } from '@/context/ModelContextDefinition';
import type { UseTtsReturn } from '@/types/Tts';
import { apiFetch } from '@/utils/api';

/**
 * Markdown is read out literally ("**x**" becomes "asterisk asterisk x"), and the
 * backend's text normaliser turns markup-only input ("- ", "###", emoji) into an
 * empty string, which then divides by zero inside VoxCPM's retry path. Speak prose.
 */
const stripMarkup = (text: string): string =>
  text
    .replace(/[*_`#>~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const useTts = (): UseTtsReturn => {
  const modelContext = useContext(ModelContext);
  const [isTtsEnabled, setIsTtsEnabled] = useLocalStorage<boolean>({
    key: STORAGE_KEYS.ttsEnabled,
    defaultValue: false,
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<string[]>([]);
  const busyRef = useRef<boolean>(false);
  // Read in async continuations, where the captured isTtsEnabled would be stale.
  const enabledRef = useRef<boolean>(isTtsEnabled);
  enabledRef.current = isTtsEnabled;

  // Sentences arrive faster than they are spoken, so they queue instead of firing
  // overlapping /tts requests. One request at a time is also what the backend
  // needs: MPS cannot run two generations concurrently without aborting.
  const playNext = useCallback(async (): Promise<void> => {
    const text: string | undefined = queueRef.current.shift();
    if (!text || !enabledRef.current || !modelContext?.serverUrl) {
      busyRef.current = false;
      setIsSpeaking(false);
      return;
    }

    try {
      const blob = await apiFetch<Blob>(modelContext.serverUrl, '/tts', {
        method: 'POST',
        body: JSON.stringify({ text }),
        responseType: 'blob',
      });

      const url: string = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      const done = (): void => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        void playNext();
      };
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = done;
      audio.onerror = done;

      await audio.play();
    } catch (error) {
      console.error('TTS Error:', error);
      audioRef.current = null;
      void playNext();
    }
  }, [modelContext?.serverUrl]);

  const speak = useCallback(
    async (text: string): Promise<void> => {
      // /tts lives on the backend server, so there is nothing to call without it.
      if (!isTtsEnabled || !modelContext?.isServerOnline || !modelContext.serverUrl) return;

      const clean: string = stripMarkup(text);
      // Nothing a voice could read: a lone bullet, a heading marker, an emoji.
      if (!/[\p{L}\p{N}]/u.test(clean)) return;

      queueRef.current.push(clean);
      if (busyRef.current) return;
      busyRef.current = true;
      await playNext();
    },
    [isTtsEnabled, modelContext?.isServerOnline, modelContext?.serverUrl, playNext]
  );

  const cancel = useCallback((): void => {
    queueRef.current = [];
    busyRef.current = false;
    const audio: HTMLAudioElement | null = audioRef.current;
    if (audio) {
      audio.pause();
      if (audio.src) URL.revokeObjectURL(audio.src);
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      queueRef.current = [];
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
