import type { ComboboxData } from '@mantine/core';
import type { Dispatch, SetStateAction } from 'react';
import type { LlmModel } from '@/types';
import type { ApiStatus, LlmProvider } from '@/types/api';

export interface ModelContextDefinition {
  currentModel: LlmModel | undefined;
  models: LlmModel[];
  embeddingModels: ComboboxData;
  chatServerUrl: string; // The LLM Server (Ollama / LM Studio)
  llmProvider: LlmProvider; // Which LLM API the server answered on
  serverUrl: string; // The Backend Server (Transcription / Images / RAG)
  chatServerUrlInput: string;
  setChatServerUrlInput: Dispatch<SetStateAction<string>>;
  serverUrlInput: string;
  setServerUrlInput: Dispatch<SetStateAction<string>>;
  chatServerStatus: ApiStatus;
  serverStatus: ApiStatus;
  isServerOnline: boolean;
  setModel: (model: string) => void;
  refreshModels: () => Promise<void>;
}
