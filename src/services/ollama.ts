'use client';

import { OllamaModel } from '@/types';
import { AbortableAsyncIterator, ChatResponse } from 'ollama';
import { Ollama, ListResponse, Message, ModelResponse, ShowResponse } from 'ollama/browser';

export async function checkOllamaServer(client: Ollama): Promise<{ success: boolean }> {
  try {
    await client.list();
    return { success: true };
  } catch (_error) {
    return { success: false };
  }
}

export async function listModels(client: Ollama): Promise<OllamaModel[]> {
  try {
    const basicModels: ListResponse = await client.list();
    const detailedModels: OllamaModel[] = await Promise.all(
      basicModels.models.map(async (model: ModelResponse): Promise<OllamaModel> => {
        const show: ShowResponse = await client.show({ model: model.model });
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
  ollamaClient: Ollama,
  body: { model: string; messages: Message[] },
  callbacks: {
    onChunk: (chunk: { message: Message }) => void;
    onError: (error: unknown) => void;
    onComplete: () => void;
  },
  think?: boolean
): AbortController {
  const abortController = new AbortController();

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
