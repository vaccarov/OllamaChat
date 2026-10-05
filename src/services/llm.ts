'use client';

import type {
  LlmModel,
  LlmProvider,
  LmStudioV0ModelsResponse,
  Message,
  OllamaShowResponse,
  OllamaTagsResponse,
  OpenAiModelsResponse,
} from '@/types';

/** Matches a trailing `/api`, `/v1` or `/api/v1` so `host`, `host/v1` and `host/api` all work. */
const API_SUFFIX = /\/(?:api|v1)(?:\/v1)?$/;

const apiRoot = (url: string): string => url.replace(/\/+$/, '').replace(API_SUFFIX, '');

const VISION_RE =
  /vision|visual|vlm\b|multimodal|llava|clip|florence|cogvlm|internvl|qwen.*vl|phi.*vision|deepseek.*vl/i;
const THINKING_RE = /think|reasoning|reason|deepseek.*r1|qwq/i;
const EMBEDDING_RE = /embed|bge|gte|e5-|nomic/i;

/** Best-effort capability guess for servers that expose no capability metadata. */
const guessCapabilities = (id: string): string[] => {
  if (EMBEDDING_RE.test(id)) return ['embedding'];
  return [
    'chat',
    ...(VISION_RE.test(id) ? ['vision'] : []),
    ...(THINKING_RE.test(id) ? ['thinking'] : []),
  ];
};

/** The three Ollama capabilities the UI understands; `completion` and `tools` are implied. */
const OLLAMA_CAPS = ['vision', 'thinking', 'embedding'];

const mapOllamaCapabilities = (raw: string[]): string[] => {
  const mapped = raw.filter((c: string) => OLLAMA_CAPS.includes(c));
  // Embedding models report `embedding` only; everything else is a chat model.
  return mapped.includes('embedding') ? mapped : ['chat', ...mapped];
};

function parseLlmChunk(line: string): { message?: Message; done?: boolean } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  try {
    const raw = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed;
    if (raw === '[DONE]') return { done: true };

    const data = JSON.parse(raw) as {
      choices?: {
        delta?: {
          content?: string;
          reasoning_content?: string;
        };
      }[];
    };

    if (data.choices?.[0]?.delta) {
      const content = data.choices[0].delta.content ?? '';
      const thinking = data.choices[0].delta.reasoning_content ?? '';
      if (content || thinking)
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

async function ollamaModel(
  root: string,
  m: OllamaTagsResponse['models'][number]
): Promise<LlmModel> {
  const name = m.model || m.name || '';
  const model: LlmModel = {
    model: name,
    name: m.name || m.model,
    size: m.size,
    details: m.details,
    show: { capabilities: guessCapabilities(name) },
  };

  try {
    const res = await fetch(`${root}/api/show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return model;

    const show: OllamaShowResponse = await res.json();
    if (Array.isArray(show.capabilities) && show.capabilities.length > 0) {
      model.show.capabilities = mapOllamaCapabilities(show.capabilities);
    } else {
      // Older Ollama servers don't report capabilities: keep the model card data.
      model.show.capabilities = guessCapabilities(name).concat(
        show.details?.family && /clip/i.test(show.details.family) ? ['vision'] : []
      );
    }
  } catch {
    // Keep the /api/tags-only result.
  }

  return model;
}

async function listOllamaModels(root: string): Promise<LlmModel[] | null> {
  try {
    const res = await fetch(`${root}/api/tags`, { cache: 'no-cache' });
    if (!res.ok) return null;
    const data: OllamaTagsResponse = await res.json();
    if (!Array.isArray(data.models) || data.models.length === 0) return null;
    return Promise.all(data.models.map((m) => ollamaModel(root, m)));
  } catch {
    return null;
  }
}

/** LM Studio's native API: the only source of model type (llm / vlm / embeddings). */
async function listLmStudioModels(root: string): Promise<LlmModel[] | null> {
  try {
    const res = await fetch(`${root}/api/v0/models`, { cache: 'no-cache' });
    if (!res.ok) return null;
    const data: LmStudioV0ModelsResponse = await res.json();
    if (!Array.isArray(data.data) || data.data.length === 0) return null;

    return data.data.map((m) => ({
      model: m.id,
      name: m.id,
      details: { family: m.arch, quantization_level: m.quantization },
      show: {
        capabilities:
          m.type === 'embeddings'
            ? ['embedding']
            : [
                'chat',
                ...(m.type === 'vlm' ? ['vision'] : []),
                ...(THINKING_RE.test(m.id) ? ['thinking'] : []),
              ],
      },
    }));
  } catch {
    return null;
  }
}

async function listOpenAiModels(root: string): Promise<LlmModel[]> {
  try {
    const res = await fetch(`${root}/v1/models`, { cache: 'no-cache' });
    if (!res.ok) return [];

    const data: OpenAiModelsResponse = await res.json();
    if (!Array.isArray(data.data)) return [];

    return data.data.map((m) => ({
      model: m.id,
      name: m.id,
      show: { capabilities: guessCapabilities(m.id) },
    }));
  } catch {
    return [];
  }
}

export async function listModels(baseUrl: string): Promise<{
  models: LlmModel[];
  provider: LlmProvider;
}> {
  const root = apiRoot(baseUrl);
  if (!root) return { models: [], provider: 'openai' };

  const ollama = await listOllamaModels(root);
  if (ollama) return { models: ollama, provider: 'ollama' };

  const lmStudio = await listLmStudioModels(root);
  if (lmStudio) return { models: lmStudio, provider: 'lmstudio' };

  return { models: await listOpenAiModels(root), provider: 'openai' };
}

export function streamChat(
  baseUrl: string,
  body: { model: string; messages: Message[] },
  callbacks: {
    onChunk: (chunk: { message: Message }) => void;
    onError: (error: unknown) => void;
    onComplete: () => void;
  },
  options?: { think?: boolean }
): AbortController {
  const ctrl = new AbortController();

  (async (): Promise<void> => {
    try {
      const messages = body.messages.map((m) => ({
        role: m.role,
        content: m.images?.length
          ? [
              { type: 'text', text: m.content },
              ...m.images.map((img) => ({
                type: 'image_url',
                image_url: { url: `data:image/png;base64,${img}` },
              })),
            ]
          : m.content,
      }));

      const req: Record<string, unknown> = {
        model: body.model,
        messages,
        stream: true,
      };
      if (options?.think !== undefined) {
        // `options.think` is Ollama's native switch, `reasoning_effort` is the OpenAI one.
        // Each server ignores the field belonging to the other dialect.
        req.options = { think: options.think };
        req.reasoning_effort = options.think ? 'medium' : 'none';
      }

      const res = await fetch(`${apiRoot(baseUrl)}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const chunk = parseLlmChunk(line);
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
