export interface RagDocument {
  id: string;
  filename: string;
  content: string;
}

export interface RagChatResponse {
  prompt: string;
}
