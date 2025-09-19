import { OllamaModel } from '@/types/OllamaModel';
import { Dispatch, SetStateAction } from 'react';

export interface ModelContextDefinition {
  models: OllamaModel[];
  setModel: (model: string) => void;
  currentModel?: OllamaModel;
  refreshModels: () => Promise<void>;
  ollamaServerUrl: string;
  setOllamaServerUrl: Dispatch<SetStateAction<string>>;
  transcribeServerUrl: string;
  setTranscribeServerUrl: Dispatch<SetStateAction<string>>;
}