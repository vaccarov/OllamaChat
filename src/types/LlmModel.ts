export interface LlmModel {
  model: string;
  name?: string;
  size?: number;
  size_bytes?: number;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
  show: {
    capabilities?: string[];
    modality?: string[];
  };
}
