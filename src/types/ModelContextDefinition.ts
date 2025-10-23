import { OllamaModel } from '@/types';
import { ApiStatus } from '@/types/api';
import { ComboboxData } from '@mantine/core';
import type { Ollama } from 'ollama/browser';
import { Dispatch, SetStateAction } from 'react';

export interface ModelContextDefinition {
  currentModel: OllamaModel | undefined;
  models: OllamaModel[];
  embeddingModels: ComboboxData;
  chatServerUrl: string;
  ollamaServerStatus: ApiStatus;
  chatServerStatus: ApiStatus;
  isChatServerOnline: boolean;
  ollamaClient: Ollama | undefined;
  setModel: (model: string) => void;
  refreshModels: () => Promise<void>;
  setChatServerUrl: Dispatch<SetStateAction<string>>;
  setOllamaClient: Dispatch<SetStateAction<Ollama | undefined>>;
}
