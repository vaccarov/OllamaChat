import { ApiStatus } from '@/types/api';
import { OllamaModel } from '@/types/OllamaModel';
import { Dispatch, SetStateAction } from 'react';

export interface ModelContextDefinition {
  currentModel?: OllamaModel;
  models: OllamaModel[];
  ollamaServerUrl: string;
  chatServerUrl: string;
  ollamaServerStatus: ApiStatus;
  transcribeServerStatus: ApiStatus;
  setModel: (model: string) => void;
  refreshModels: () => Promise<void>;
  setOllamaServerUrl: Dispatch<SetStateAction<string>>;
  setChatServerUrl: Dispatch<SetStateAction<string>>;
}