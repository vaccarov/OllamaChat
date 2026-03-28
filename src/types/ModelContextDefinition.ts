import { LlmModel } from '@/types';
import { ApiStatus } from '@/types/api';
import { ComboboxData } from '@mantine/core';
import { Dispatch, SetStateAction } from 'react';

export interface ModelContextDefinition {
  currentModel: LlmModel | undefined;
  models: LlmModel[];
  embeddingModels: ComboboxData;
  chatServerUrl: string; // The LLM Server (Ollama / LM Studio)
  serverUrl: string; // The Backend Server (Transcription / Images)
  chatServerUrlInput: string;
  setChatServerUrlInput: Dispatch<SetStateAction<string>>;
  serverUrlInput: string;
  setServerUrlInput: Dispatch<SetStateAction<string>>;
  serverType: 'ollama' | 'lmstudio'; // Type for chatServerUrl
  chatServerStatus: ApiStatus;
  serverStatus: ApiStatus;
  isChatServerOnline: boolean;
  isServerOnline: boolean;
  setModel: (model: string) => void;
  refreshModels: () => Promise<void>;
}
