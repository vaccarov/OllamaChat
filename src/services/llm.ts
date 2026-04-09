'use client';

import { LlmModel, Message, OllamaTagsResponse, OpenAiModelsResponse, LmStudioModelsResponse } from '@/types';

export function parseLlmChunk(line: string, type: 'ollama' | 'lmstudio'): { message?: Message; done?: boolean; response_id?: string } | null {
  const trimmed: string = line.trim();
  if (!trimmed) return null;

  try {
    const data: any = JSON.parse(trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed);
    if (type === 'ollama') {
      const msg: Message = data.message;
      if (msg?.content?.includes('<think>')) {
        const match: RegExpMatchArray | null = msg.content.match(/<think>([\s\S]*?)<\/think>/);
        if (match) return { message: { ...msg, thinking: match[1], content: msg.content.replace(/<think>[\s\S]*?<\/think>/, '').trim() }, done: data.done };
      }
      return { message: data.message, done: data.done };
    }
    if (type === 'lmstudio') {
      if (data.type === 'message.delta' && data.content) return { message: { role: 'assistant', content: data.content }, done: false };
      if (data.type === 'reasoning.delta' && data.content) return { message: { role: 'assistant', content: '', thinking: data.content }, done: false };
      if (data.type === 'chat.end') return { done: true, response_id: data.response_id };
    }

    if (data.choices?.[0]?.delta) {
      const { content = '', reasoning_content: thinking = '' } = data.choices[0].delta;
      if (content || thinking) return { message: { role: 'assistant', content, thinking }, done: false };
    }
    return null;
  } catch {
    return null;
  }
}

export async function listModels(baseUrl: string, apiKey?: string): Promise<{ models: LlmModel[]; type: 'ollama' | 'lmstudio' }> {
  const headers: Record<string, string> = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
  const fetchApi = (path: string, options: RequestInit = {}) => fetch(`${baseUrl}${path}`, { headers, cache: 'no-cache', ...options }).catch(() => null);

  // LMStudio
  const lmRes: Response | null = await fetchApi('models');
  if (lmRes?.ok || lmRes?.status === 304) {
    const data: LmStudioModelsResponse = await lmRes.json();
    if (Array.isArray(data.models)) {
      return {
        type: 'lmstudio',
        models: data.models.map((m) => {
          const caps: string[] = ['chat'];
          if (m.type === 'embedding') caps.push('embedding');
          if (m.capabilities?.vision) caps.push('vision');
          if (/think|reasoning/i.test(m.key)) caps.push('think');
          return { model: m.key, name: m.key.split('/').pop() || m.key, size: 0, size_bytes: m.size_bytes, details: { family: m.architecture, quantization_level: m.quantization?.name }, show: { capabilities: caps } };
        }),
      };
    }
  }

  // Ollama
  const ollamaCheck: Response | null = await fetchApi('tags');
  if (ollamaCheck?.ok) {
    const data: OllamaTagsResponse = await ollamaCheck.json();
    if (Array.isArray(data.models)) {
      const models: LlmModel[] = await Promise.all(data.models.map(async (m) => {
        const name: string = m.model || m.name || '';
        try {
          const showRes: Response = await fetch(`${baseUrl}show`, { method: 'POST', body: JSON.stringify({ name }) });
          const show: any = await showRes.json();
          const caps: string[] = ['chat'];
          if (/clip/i.test(show.details?.family) || show.details?.families?.some((f: string) => /clip/i.test(f))) caps.push('vision');
          if (/think|reasoning/i.test(name) || show.template?.includes('think') || show.system?.includes('think')) caps.push('think');
          return { model: name, name: m.name || m.model, size: m.size, details: show.details, show: { capabilities: caps, modality: show.modality } };
        } catch {
          return { model: name, name: m.name || m.model, size: m.size, show: { capabilities: ['chat'] } };
        }
      }));
      return { models, type: 'ollama' };
    }
  }

  // OpenAI
  const oaRes: Response | null = await fetchApi('models');
  if (oaRes?.ok) {
    const data: OpenAiModelsResponse = await oaRes.json();
    if (Array.isArray(data.data)) {
      return {
        type: 'ollama', // Using ollama as default type for compatibility
        models: data.data.map((m) => ({ model: m.id, name: m.id, size: 0, show: { capabilities: ['chat', 'vision', ...( /think|reasoning/i.test(m.id) ? ['think'] : [] )] } })),
      };
    }
  }
  
  return { models: [], type: 'ollama' };
}

export function streamChat(
  baseUrl: string,
  type: 'ollama' | 'lmstudio',
  body: { model: string; messages: Message[] },
  callbacks: { onChunk: (chunk: { message: Message }) => void; onError: (error: unknown) => void; onComplete: () => void },
  options?: { think?: boolean; apiKey?: string }
): AbortController {
  const ctrl: AbortController = new AbortController();

  (async (): Promise<void> => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (options?.apiKey) headers.Authorization = `Bearer ${options.apiKey}`;
      let url: string = `${baseUrl}chat`;
      let req: any;

      if (type === 'ollama') {
        req = { model: body.model, messages: body.messages, stream: true, options: { think: options?.think } };
      } else if (type === 'lmstudio') {
        const sys: Message | undefined = body.messages.find(m => m.role === 'system');
        const msgs: Message[] = body.messages.filter(m => m.role !== 'system');
        const last: Message = msgs[msgs.length - 1];
        // LM Studio Stateful API (/api/v1/chat) expects 'content' and 'type: text|image'
        let input: any = last.content;
        if (last.images?.length) {
          input = [
            { type: 'text', content: last.content },
            ...last.images.map(img => ({ type: 'image', content: img }))
          ];
        }
        req = {
          model: body.model, 
          input,
          system_prompt: sys?.content || '',
          stream: true
        };
      } else {
        url = `${baseUrl}chat/completions`;
        const messages = body.messages.map(m => ({
          role: m.role,
          content: m.images?.length 
            ? [{ type: 'text', text: m.content }, ...m.images.map(img => ({ type: 'image_url', image_url: { url: `data:image/png;base64,${img}` } }))]
            : m.content
        }));
        req = { model: body.model, messages, stream: true };
      }

      const res: Response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(req), signal: ctrl.signal });
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const reader: ReadableStreamDefaultReader<Uint8Array> | undefined = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder: TextDecoder = new TextDecoder();
      let buffer: string = '';

      while (true) {
        const { done, value }: { done: boolean; value?: Uint8Array } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines: string[] = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const chunk = parseLlmChunk(line, type);
          if (chunk?.message) callbacks.onChunk({ message: chunk.message });
        }
      }
      callbacks.onComplete();
    } catch (e: unknown) {
      (e as Error).name === 'AbortError' ? callbacks.onComplete() : callbacks.onError(e);
    }
  })();

  return ctrl;
}
