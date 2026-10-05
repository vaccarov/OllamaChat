import type { LlmProvider } from '@/types';
import type { RagChatResponse, RagDocument } from '@/types/document';
import { apiFetch } from '@/utils/api';

/** The LLM server ChatServer must call to turn text into vectors. */
export interface EmbeddingTarget {
  provider: LlmProvider;
  baseUrl: string;
}

export async function uploadDocuments(
  serverUrl: string,
  files: File[],
  embeddingModel: string,
  target: EmbeddingTarget,
  chatId?: string
): Promise<{ message: string }> {
  const formData: FormData = new FormData();
  files.forEach((f: File) => {
    formData.append('files', f);
  });
  formData.append('embedding_model', embeddingModel);
  formData.append('embedding_provider', target.provider);
  formData.append('embedding_base_url', target.baseUrl);
  if (chatId) formData.append('chat_id', chatId);

  return apiFetch<{ message: string }>(serverUrl, '/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function listDocuments(
  serverUrl: string,
  embeddingModel?: string,
  chatId?: string
): Promise<RagDocument[]> {
  const params: URLSearchParams = new URLSearchParams();
  if (embeddingModel) params.append('embedding_model', embeddingModel);
  if (chatId) params.append('chat_id', chatId);

  return apiFetch<RagDocument[]>(serverUrl, `/documents/list?${params.toString()}`);
}

export async function ragChat(
  serverUrl: string,
  query: string,
  embeddingModel: string,
  target: EmbeddingTarget,
  chatId: string | undefined
): Promise<RagChatResponse> {
  const body: string = JSON.stringify({
    query,
    embedding_model: embeddingModel,
    embedding_provider: target.provider,
    embedding_base_url: target.baseUrl,
    chat_id: chatId,
  });
  return apiFetch<RagChatResponse>(serverUrl, '/documents/rag_chat', {
    method: 'POST',
    body,
  });
}
