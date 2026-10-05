import type { OllamaModelDetails } from '@/types/api';

export interface LlmModel {
  model: string;
  name?: string;
  size?: number;
  details?: OllamaModelDetails;
  show: {
    capabilities?: string[];
  };
}
