'use client';

import { apiFetch } from '@/utils/api';

export async function checkChatServer(serverUrl: string): Promise<{ success: boolean }> {
  try {
    const response: Response = await fetch(serverUrl);
    return { success: response.ok };
  } catch {
    return { success: false };
  }
}

export async function transcribe(
  audioBlob: Blob,
  language: string,
  serverUrl: string
): Promise<{ transcript: string }> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('language', language);

  return apiFetch<{ transcript: string }>(serverUrl, '/audio/decode', {
    method: 'POST',
    body: formData,
  });
}
