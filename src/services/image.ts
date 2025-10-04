'use client';

import { IMAGE_GEN_STATUS_SUCCESS } from '@/constants/list';
import { DiffusionModel, ImageGenerationProgress } from '@/types/image-generation';

export function generateImage(
  chatServerUrl: string,
  formData: FormData,
  callbacks: {
    onProgress: (progressData: ImageGenerationProgress) => void;
    onSuccess: (imageData: string) => void;
    onError: (error: Error) => void;
    onComplete: () => void;
  }
): AbortController {
  const abortController = new AbortController();

  const stream = async () => {
    try {
      const response: Response = await fetch(`${chatServerUrl}/image/generate`, {
        method: 'POST',
        body: formData,
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errData: { detail?: string } = await response.json();
        throw new Error(errData.detail || `Request failed with status ${response.status}`);
      }
      const reader: ReadableStreamDefaultReader<Uint8Array> | undefined = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder: TextDecoder = new TextDecoder();
      let buffer: string = '';
      while (true) {
        const { done, value }: { done: boolean; value?: Uint8Array } = await reader.read();
        if (done) {
          callbacks.onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines: string[] = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const dataJson: string = line.substring(5);
            try {
              const progressData: ImageGenerationProgress = JSON.parse(dataJson.trim());
              const status: string = progressData.status;
              if (status === IMAGE_GEN_STATUS_SUCCESS) {
                callbacks.onSuccess(`data:image/png;base64,${progressData.image_data}`);
              } else if (status === 'progress') {
                callbacks.onProgress(progressData);
              } else if (status === 'starting_image') {
                callbacks.onProgress(progressData);
              } else if (status) {
                callbacks.onProgress(progressData);
              }
            } catch (e: unknown) {
              console.error("Failed to parse progress JSON", dataJson, e);
            }
          }
        }
      }
    } catch (error: unknown) {
      callbacks.onError(error as Error);
    }
  };
  stream();
  return abortController;
}

export async function getImageModels(chatServerUrl: string): Promise<DiffusionModel[]> {
  try {
    const response: Response = await fetch(`${chatServerUrl}/image/models`);
    if (!response.ok) {
      console.error('Error fetching image models:', response.statusText);
      return [];
    }
    const models: DiffusionModel[] = await response.json();
    return models;
  } catch (error) {
    console.error('Error fetching image models:', error);
    return [];
  }
}
