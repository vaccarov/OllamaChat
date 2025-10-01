'use client';

import { IMAGE_GEN_STATUS_SUCCESS } from '@/constants/list';
import { OllamaModel } from '@/types';
import { DiffusionModel, ImageGenerationProgress } from '@/types/image-generation';
import { ListResponse, Message, ModelResponse, ShowResponse } from 'ollama';

export async function checkTranscribeServer(transcribeServerUrl: string): Promise<{success: boolean}> {
  try {
    const response: Response = await fetch(transcribeServerUrl);
    return { success: response.ok };
  } catch (error) {
    return { success: false };
  }
}

export async function checkOllamaServer(ollamaServerUrl: string): Promise<{success: boolean}> {
  try {
    const response: Response = await fetch(ollamaServerUrl);
    const success: boolean = await response.text() === 'Ollama is running';
    return { success };
  } catch (error) {
    return { success: false };
  }
}

export async function listModels(ollamaServerUrl: string): Promise<OllamaModel[]> {
  try {
    const response: Response = await fetch(`${ollamaServerUrl}/api/tags`);
    if (!response.ok) return [];
    const basicModels: ListResponse = await response.json();
    const detailedModels: OllamaModel[] = await Promise.all(
      basicModels.models.map(async (model: ModelResponse): Promise<OllamaModel> => {
        const showResponse: Response = await fetch(`${ollamaServerUrl}/api/show`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: model.model }),
        });
        const show: ShowResponse = await showResponse.json();
        return {
          ...model,
          show
        };
      })
    );
    const sortedModels: OllamaModel[] = detailedModels.sort((a: OllamaModel, b: OllamaModel) => a.size - b.size);
    return sortedModels;
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
}

export function streamChat(
  ollamaServerUrl: string,
  body: { model: string; messages: Message[] },
  callbacks: {
    onChunk: (chunk: string) => void;
    onError: (error: (unknown)) => void;
    onComplete: () => void;
  }
): AbortController {
  const abortController = new AbortController();

  const stream = async () => {
    try {
      const response: Response = await fetch(`${ollamaServerUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, stream: true }),
        signal: abortController.signal,
      });
    
      if (!response.ok || !response.body) {
        const errorData: { error?: string } = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }
    
      const reader: ReadableStreamDefaultReader<Uint8Array> = response.body.getReader();
      const decoder: TextDecoder = new TextDecoder();
      let buffer: string = '';
    
      while (true) {
        const { done, value }: ReadableStreamReadResult<Uint8Array> = await reader.read();
        if (done) {
          callbacks.onComplete();
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines: string[] = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.trim() === '') continue;
          const content: string = JSON.parse(line).message.content;
          callbacks.onChunk(content);
        }
      }
    } catch (error: unknown) {
      callbacks.onError(error);
    }
  }
  stream();
  return abortController;
}

export async function transcribe(audioBlob: Blob, language: string, transcribeServerUrl: string): Promise<{transcript: string}> {
  const formData: FormData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("language", language);
  const res: Response = await fetch(`${transcribeServerUrl}/transcribe/decode`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Transcription failed with status ${res.status}`);
  return res.json();
}

export function generateImage(
  transcribeServerUrl: string,
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
      const response: Response = await fetch(`${transcribeServerUrl}/image/generate`, {
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

export async function getImageModels(transcribeServerUrl: string): Promise<DiffusionModel[]> {
  try {
    const response: Response = await fetch(`${transcribeServerUrl}/image/models`);
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
