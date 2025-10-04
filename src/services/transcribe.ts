'use client';

export async function checkChatServer(chatServerUrl: string): Promise<{ success: boolean }> {
  try {
    const response: Response = await fetch(chatServerUrl);
    return { success: response.ok };
  } catch (_error) {
    return { success: false };
  }
}

export async function transcribe(audioBlob: Blob, language: string, chatServerUrl: string): Promise<{ transcript: string }> {
  const formData: FormData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('language', language);
  const res: Response = await fetch(`${chatServerUrl}/audio/decode`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Transcription failed with status ${res.status}`);
  return res.json();
}
