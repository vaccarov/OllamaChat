export enum ApiStatus {
  UNKNOWN = 'unknown',
  CHECKING = 'checking',
  VALID = 'valid',
  INVALID = 'invalid',
}

/** Which API family the configured LLM server answered on. */
export type LlmProvider = 'ollama' | 'lmstudio' | 'openai';

/** The model card Ollama returns in `/api/tags` and `/api/show`. */
export interface OllamaModelDetails {
  family?: string;
  quantization_level?: string;
}

export interface OllamaTagsResponse {
  models: {
    model: string;
    name?: string;
    size: number;
    details?: OllamaModelDetails;
  }[];
}

/** `POST /api/show` on an Ollama server. */
export interface OllamaShowResponse {
  capabilities?: string[];
  details?: OllamaModelDetails;
}

/** `GET /api/v0/models` on an LM Studio server. */
export interface LmStudioV0ModelsResponse {
  data: {
    id: string;
    type: 'llm' | 'vlm' | 'embeddings';
    arch?: string;
    quantization?: string;
  }[];
}

export interface OpenAiModelsResponse {
  data: { id: string }[];
}
