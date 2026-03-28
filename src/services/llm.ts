'use client';

import { LlmModel, Message, OllamaTagsResponse, OpenAiModelsResponse, LmStudioModelsResponse } from '@/types';

export function parseLlmChunk(
  line: string,
  type: 'ollama' | 'lmstudio'
): { message?: Message; done?: boolean } | null {
  const trimmedLine = line.trim();
  if (!trimmedLine) return null;

  try {
    const data = JSON.parse(trimmedLine.startsWith('data: ') ? trimmedLine.slice(6) : trimmedLine);
    
    if (type === 'ollama') {
      const message = data.message;
      if (message && message.content) {
        // Handle models that stream <think> tags in content
        const thinkMatch = message.content.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
          return {
            message: {
              ...message,
              thinking: thinkMatch[1],
              content: message.content.replace(/<think>[\s\S]*?<\/think>/, '').trim(),
            },
            done: data.done,
          };
        }
      }
      return { message: data.message, done: data.done };
    } 
    if (type === 'lmstudio') {
      // Handle native LM Studio format: {"type": "message.delta", "content": "..."}
      if (data.type === 'message.delta' && data.content) {
        return {
          message: { role: 'assistant', content: data.content },
          done: false,
        };
      }
      if (data.type === 'reasoning.delta' && data.content) {
        return {
          message: { role: 'assistant', content: '', thinking: data.content },
          done: false,
        };
      }
      if (data.type === 'chat.end') {
        return { done: true };
      }
    }

    // OpenAI and LM Studio's OpenAI-compatible format
    if (data.choices && (data.choices[0]?.delta?.content || data.choices[0]?.delta?.reasoning_content)) {
      const content = data.choices[0].delta.content || '';
      const thinking = data.choices[0].delta.reasoning_content || '';
      return {
        message: { role: 'assistant', content, thinking },
        done: false,
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function listModels(baseUrl: string, apiKey?: string): Promise<{ models: LlmModel[]; type: 'ollama' | 'lmstudio' }> {
  const headers: Record<string, string> = apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {};
  
  // Try LMStudio API (v0.3.0+) - Check /models
  try {
    const lmstudioResponse = await fetch(`${baseUrl}models`, { headers, cache: 'no-cache' }).catch(() => null);
    if (lmstudioResponse && (lmstudioResponse.ok || lmstudioResponse.status === 304)) {
      const data = (await lmstudioResponse.json()) as LmStudioModelsResponse;
      if (data.models && Array.isArray(data.models)) {
        const models = data.models.map((m) => {
          const capabilities: string[] = ['chat'];
          if (m.type === 'embedding') capabilities.push('embedding');
          if (m.capabilities?.vision) capabilities.push('vision');
          if (m.key.toLowerCase().includes('think') || m.key.toLowerCase().includes('reasoning')) {
            capabilities.push('think');
          }
          
          return {
            model: m.key,
            name: m.key.split('/').pop() || m.key,
            size: 0,
            size_bytes: m.size_bytes,
            details: {
              family: m.architecture,
              quantization_level: m.quantization?.name,
            },
            show: {
              capabilities,
            },
          };
        });
        return { models, type: 'lmstudio' };
      }
    }
  } catch {
    // Fallback
  }

  try {
    // Try Ollama - Check /tags
    const ollamaCheck = await fetch(`${baseUrl}tags`).catch(() => null);

    if (ollamaCheck && ollamaCheck.ok) {
      const data = (await ollamaCheck.json()) as OllamaTagsResponse;
      if (data.models && Array.isArray(data.models)) {
        const models = await Promise.all(
          data.models.map(async (model) => {
            try {
              const showRes = await fetch(`${baseUrl}show`, {
                method: 'POST',
                body: JSON.stringify({ name: model.model || model.name }),
              });
              const showData = await showRes.json();
              
              const capabilities: string[] = ['chat'];
              if (showData.details?.family?.includes('clip') || showData.details?.families?.some((f: string) => f.includes('clip'))) {
                capabilities.push('vision');
              }
              if (showData.template?.includes('think') || showData.system?.includes('think') || (model.model || model.name).toLowerCase().includes('think')) {
                capabilities.push('think');
              }

              return {
                model: model.model || (model.name as string),
                name: model.name || model.model,
                size: model.size,
                details: showData.details,
                show: {
                  capabilities,
                  modality: showData.modality,
                },
              };
            } catch {
              return {
                model: model.model || (model.name as string),
                name: model.name || model.model,
                size: model.size,
                show: { capabilities: ['chat'] },
              };
            }
          })
        );
        return { models, type: 'ollama' };
      }
    }
  } catch {
    // Fallback
  }

  // Try OpenAI compatible - Check /models
  try {
    const openaiResponse = await fetch(`${baseUrl}models`, { headers }).catch(() => null);
    if (openaiResponse && openaiResponse.ok) {
      const data = (await openaiResponse.json()) as OpenAiModelsResponse;
      if (data.data && Array.isArray(data.data)) {
        const models = data.data.map((m) => {
          const capabilities: string[] = ['chat', 'vision'];
          if (m.id.toLowerCase().includes('think') || m.id.toLowerCase().includes('reasoning')) {
            capabilities.push('think');
          }
          
          return {
            model: m.id,
            name: m.id,
            size: 0,
            show: {
              capabilities,
            },
          };
        });
        return { models, type: 'openai' };
      }
    }
  } catch {
  }
  
  return { models: [], type: 'ollama' };
}

export function streamChat(
  baseUrl: string,
  type: 'ollama' | 'lmstudio',
  body: { model: string; messages: Message[] },
  callbacks: {
    onChunk: (chunk: { message: Message }) => void;
    onError: (error: unknown) => void;
    onComplete: () => void;
  },
  options?: {
    think?: boolean;
    apiKey?: string;
  }
): AbortController {
  const abortController = new AbortController();

  const stream = async () => {
    try {
      let apiUrl: string;
      let requestBody: Record<string, unknown>;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (options?.apiKey) {
        headers['Authorization'] = `Bearer ${options.apiKey}`;
      }

      if (type === 'ollama') {
        apiUrl = `${baseUrl}chat`;
        requestBody = {
          model: body.model,
          messages: body.messages,
          stream: true,
          options: { think: options?.think }
        };
      } else if (type === 'lmstudio') {
        // Native LM Studio API: /chat
        apiUrl = `${baseUrl}chat`;
        
        const systemMessage = body.messages.find(m => m.role === 'system');
        const otherMessages = body.messages.filter(m => m.role !== 'system');
        
        requestBody = {
          model: body.model,
          input: otherMessages.length > 0 ? otherMessages[otherMessages.length - 1].content : '',
          system_prompt: systemMessage?.content || '',
          stream: true,
        };
      } else {
        // OpenAI standard endpoint at /chat/completions
        apiUrl = `${baseUrl}chat/completions`;
        requestBody = {
          model: body.model,
          messages: body.messages,
          stream: true,
        };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: abortController.signal,
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText} (${response.status})`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const chunk = parseLlmChunk(line, type);
          if (chunk?.message) {
            callbacks.onChunk({ message: chunk.message });
          }
        }
      }
      callbacks.onComplete();
    } catch (error: unknown) {
      if ((error as Error).name === 'AbortError') {
        callbacks.onComplete();
        return;
      }
      callbacks.onError(error);
    }
  };

  stream();

  return abortController;
}
