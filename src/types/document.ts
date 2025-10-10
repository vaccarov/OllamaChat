export interface UploadDocumentRequest {
  file_name: string;
  metadata?: { [key: string]: any };
}

export interface RagDocument {
  id: string;
  filename: string;
  content: string;
}

export interface RagChatRequest {
  query: string;
  metadata_filter?: { [key: string]: any };
  n_results?: number;
}

export interface RagChatResponse {
  prompt: string;
}