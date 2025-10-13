import { OllamaModel } from '@/types';
import { ApiStatus } from '@/types/api';
import { ComboboxData } from '@mantine/core';
import { Dispatch, SetStateAction } from 'react';

export interface ModelContextDefinition {
  currentModel: OllamaModel | undefined;
  models: OllamaModel[];
  embeddingModels: ComboboxData;
  ollamaServerUrl: string;
  chatServerUrl: string;
  ollamaServerStatus: ApiStatus;
  chatServerStatus: ApiStatus;
  isChatServerOnline: boolean;
  setModel: (model: string) => void;
  refreshModels: () => Promise<void>;
  setOllamaServerUrl: Dispatch<SetStateAction<string>>;
  setChatServerUrl: Dispatch<SetStateAction<string>>;
}
