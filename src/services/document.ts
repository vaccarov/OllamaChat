import { RagChatResponse, RagDocument } from '@/types/document';
import { apiFetch } from '@/utils/api';

export async function uploadDocuments(serverUrl: string, files: File[], embeddingModel: string, chatId?: string): Promise<{ message: string }> {
  const formData = new FormData();
  files.forEach((file: File) => {
    formData.append('files', file);
  });
  formData.append('embedding_model', embeddingModel);
  if (chatId) {
    formData.append('chat_id', chatId);
  }

  return apiFetch<{ message: string }>(serverUrl, '/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function listDocuments(serverUrl: string, embeddingModel?: string, chatId?: string): Promise<RagDocument[]> {
  const params = new URLSearchParams();
  if (embeddingModel) params.append('embedding_model', embeddingModel);
  if (chatId) params.append('chat_id', chatId);

  return apiFetch<RagDocument[]>(serverUrl, `/documents/list?${params.toString()}`);
}

export async function searchDocuments(serverUrl: string, query: string, embeddingModel: string, chatId: string): Promise<RagDocument[]> {
  return apiFetch<RagDocument[]>(serverUrl, '/documents/search', {
    method: 'POST',
    body: JSON.stringify({ query, embedding_model: embeddingModel, chat_id: chatId }),
  });
}

export async function ragChat(serverUrl: string, query: string, embeddingModel: string, chatId: string | undefined): Promise<RagChatResponse> {
  return apiFetch<RagChatResponse>(serverUrl, '/documents/rag_chat', {
    method: 'POST',
    body: JSON.stringify({ query, embedding_model: embeddingModel, chat_id: chatId }),
  });
}

export async function resetAllDocuments(serverUrl: string, embeddingModel: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(serverUrl, `/documents/reset/${embeddingModel}`, {
    method: 'DELETE',
  });
}
