import { ModelResponse, ShowResponse } from 'ollama/browser';

export type OllamaModel = ModelResponse & {
  show: ShowResponse;
};