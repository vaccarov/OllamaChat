'use client';

import { OllamaModel } from '@/types';
import { ListResponse, Message, ModelResponse, ShowResponse } from 'ollama';

export async function checkOllamaServer(ollamaServerUrl: string): Promise<{ success: boolean }> {
  try {
    const response: Response = await fetch(ollamaServerUrl);
    const success: boolean = (await response.text()) === 'Ollama is running';
    return { success };
  } catch (_error) {
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
          show,
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
    onError: (error: unknown) => void;
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
  };
  stream();
  return abortController;
}
