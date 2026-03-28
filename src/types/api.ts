export enum ApiStatus {
  UNKNOWN = 'unknown',
  CHECKING = 'checking',
  VALID = 'valid',
  INVALID = 'invalid',
}

export interface OllamaTagsResponse {
  models: {
    model: string;
    name?: string;
    size: number;
  }[];
}


export interface OpenAiModelsResponse {
  data: {
    id: string;
    object: string;
    owned_by: string;
  }[];
}

export interface LmStudioModelsResponse {
  models: {
    key: string;
    type: 'llm' | 'embedding';
    loaded_instances: Array<unknown>;
    capabilities?: {
      vision?: boolean;
      trained_for_tool_use?: boolean;
    };
    architecture?: string;
    max_context_length?: number;
    description?: string;
    size_bytes?: number;
    quantization?: {
      name: string;
      bits_per_weight: number;
    };
    publisher?: string;
  }[];
}