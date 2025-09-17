import { OllamaModel } from '@/types';
import { Message, ModelResponse, ShowResponse } from 'ollama';

export async function checkTranscribeServer(transcribeServerUrl: string): Promise<{success: boolean}> {
  try {
    const response: Response = await fetch(transcribeServerUrl);
    return { success: response.ok };
  } catch (error) {
    return { success: false };
  }
}

export async function transcribe(audioBlob: Blob, language: string, transcribeServerUrl: string): Promise<{transcript: string}> {
  const formData: FormData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("language", language);

  const res: Response = await fetch(transcribeServerUrl, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Transcription failed with status ${res.status}`);
  }

  return res.json();
}

export function streamChat(
  ollamaServerUrl: string,
  body: { model: string; messages: Message[] },
  callbacks: {
    onChunk: (chunk: string) => void;
    onError: (error: Error) => void;
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
        const errorData = await response.json();
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
    } catch (error) {
      callbacks.onError(error as Error);
    }
  }
  
  stream();

  return abortController;
}

export async function listModels(ollamaServerUrl: string): Promise<OllamaModel[]> {
  try {
    const response: Response = await fetch(`${ollamaServerUrl}/api/tags`);
    if (!response.ok) return [];
    const basicModels = await response.json();
    const detailedModels: OllamaModel[] = await Promise.all(
      basicModels.models.map(async (model: ModelResponse): Promise<OllamaModel> => {
        const showResponse = await fetch(`${ollamaServerUrl}/api/show`, {
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

export async function checkOllamaServer(ollamaServerUrl: string): Promise<{success: boolean}> {
  try {
    const response: Response = await fetch(ollamaServerUrl);
    return { success: response.ok };
  } catch (error) {
    return { success: false };
  }
}
