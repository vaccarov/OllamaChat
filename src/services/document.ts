import type { RagChatResponse, RagDocument } from '@/types/document';
import { apiFetch } from '@/utils/api';

export async function uploadDocuments(
  serverUrl: string,
  files: File[],
  embeddingModel: string,
  chatId?: string
): Promise<{ message: string }> {
  const formData: FormData = new FormData();
  files.forEach((f: File) => formData.append('files', f));
  formData.append('embedding_model', embeddingModel);
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

export async function searchDocuments(
  serverUrl: string,
  query: string,
  embeddingModel: string,
  chatId: string
): Promise<RagDocument[]> {
  const body: string = JSON.stringify({
    query,
    embedding_model: embeddingModel,
    chat_id: chatId,
  });
  return apiFetch<RagDocument[]>(serverUrl, '/documents/search', {
    method: 'POST',
    body,
  });
}

export async function ragChat(
  serverUrl: string,
  query: string,
  embeddingModel: string,
  chatId: string | undefined
): Promise<RagChatResponse> {
  const body: string = JSON.stringify({
    query,
    embedding_model: embeddingModel,
    chat_id: chatId,
  });
  return apiFetch<RagChatResponse>(serverUrl, '/documents/rag_chat', {
    method: 'POST',
    body,
  });
}

export async function resetAllDocuments(
  serverUrl: string,
  embeddingModel: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(serverUrl, `/documents/reset/${embeddingModel}`, {
    method: 'DELETE',
  });
}
