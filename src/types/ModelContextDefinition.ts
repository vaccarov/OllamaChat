import { OllamaModel } from '@/types/OllamaModel';

export interface ModelContextDefinition {
  models: OllamaModel[];
  currentModel: OllamaModel | undefined;
  setModel: (model: string) => void;
  refreshModels: () => Promise<void>;
}
