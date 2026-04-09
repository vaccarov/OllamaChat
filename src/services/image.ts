'use client';

import { DiffusionModel, ImageGenerationProgress, ImageGenerationStatus } from '@/types/image-generation';
import { apiFetch } from '@/utils/api';

export function generateImage(
  serverUrl: string,
  formData: FormData,
  callbacks: {
    onProgress: (progressData: ImageGenerationProgress) => void;
    onSuccess: (imageData: string) => void;
    onError: (error: Error) => void;
    onComplete: () => void;
  }
): AbortController {
  const ctrl: AbortController = new AbortController();

  (async (): Promise<void> => {
    try {
      const res: Response = await fetch(`${serverUrl}/image/generate`, { method: 'POST', body: formData, signal: ctrl.signal });
      if (!res.ok) throw new Error((await res.json() as { detail?: string }).detail || `Failed: ${res.status}`);
      const reader: ReadableStreamDefaultReader<Uint8Array> | undefined = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder: TextDecoder = new TextDecoder();
      let buffer: string = '';
      while (true) {
        const { done, value }: { done: boolean; value?: Uint8Array } = await reader.read();
        if (done) return callbacks.onComplete();

        buffer += decoder.decode(value, { stream: true });
        const lines: string[] = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          try {
            const data: ImageGenerationProgress = JSON.parse(line.substring(5).trim());
            data.status === ImageGenerationStatus.SUCCESS
              ? callbacks.onSuccess(`data:image/png;base64,${data.image_data}`)
              : callbacks.onProgress(data);
          } catch (e: unknown) {
            console.error('Parse error', e);
          }
        }
      }
    } catch (e: unknown) {
      callbacks.onError(e as Error);
    }
  })();
  return ctrl;
}

export async function getImageModels(serverUrl: string): Promise<DiffusionModel[]> {
  try {
    return await apiFetch<DiffusionModel[]>(serverUrl, '/image/models');
  } catch {
    return [];
  }
}
