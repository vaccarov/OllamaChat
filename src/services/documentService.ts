import { RagChatResponse, RagDocument } from "@/types/document";

export async function uploadDocuments(
  chatServerUrl: string,
  files: File[],
  embeddingModel: string,
  chatId: string
): Promise<{ message: string }> {
  const formData = new FormData();
  files.forEach((file: File) => {
    formData.append("files", file);
  });
  formData.append("embedding_model", embeddingModel);
  formData.append("chat_id", chatId);

  const response = await fetch(`${chatServerUrl}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(JSON.stringify(errorData.detail) || "Failed to upload documents");
  }

  return response.json();
}

export async function listDocuments(
  chatServerUrl: string,
  embeddingModel?: string,
  chatId?: string
): Promise<RagDocument[]> {
  const params = new URLSearchParams();
  if (embeddingModel) params.append("embedding_model", embeddingModel);
  if (chatId) params.append("chat_id", chatId);

  const response = await fetch(
    `${chatServerUrl}/documents/list?${params.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to list documents");
  }

  return response.json();
}

export async function searchDocuments(
  chatServerUrl: string,
  query: string,
  embeddingModel: string,
  chatId: string
): Promise<RagDocument[]> {
  const response = await fetch(`${chatServerUrl}/documents/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, embedding_model: embeddingModel, chat_id: chatId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to search documents");
  }

  return response.json();
}

export async function ragChat(
  chatServerUrl: string,
  query: string,
  embeddingModel: string,
  chatId: string
): Promise<RagChatResponse> {
  const response = await fetch(`${chatServerUrl}/documents/rag_chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, embedding_model: embeddingModel, chat_id: chatId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to get RAG prompt");
  }
  return response.json();
}

export async function resetAllDocuments(
  chatServerUrl: string,
  embeddingModel: string
): Promise<{ message: string }> {
  const response = await fetch(
    `${chatServerUrl}/documents/reset/${embeddingModel}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to reset documents");
  }

  return response.json();
}
