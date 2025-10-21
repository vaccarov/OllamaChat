'use client';

import { OllamaModel } from '@/types';
import { AbortableAsyncIterator, ChatResponse } from 'ollama';
import { Ollama, ListResponse, Message, ModelResponse, ShowResponse } from 'ollama/browser';

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
    onChunk: (chunk: { message: Message }) => void;
    onError: (error: unknown) => void;
    onComplete: () => void;
  },
  think?: boolean
): AbortController {
  const abortController = new AbortController();
  const ollamaClient = new Ollama({ host: ollamaServerUrl });

  abortController.signal.addEventListener('abort', () => {
    ollamaClient.abort();
  });

  const stream = async () => {
    try {
      const responseStream: AbortableAsyncIterator<ChatResponse> = await ollamaClient.chat({
        model: body.model,
        messages: body.messages,
        stream: true,
        think,
      });

      for await (const chunk of responseStream) {
        callbacks.onChunk({ message: chunk.message });
      }

      callbacks.onComplete();
    } catch (error: unknown) {
      if ((error as Error).name === 'AbortError') {
        console.log('Stream aborted');
        callbacks.onComplete();
        return;
      }
      callbacks.onError(error);
    }
  };

  stream();

  return abortController;
}
