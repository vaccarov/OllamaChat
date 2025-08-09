import { ModelResponse, ShowResponse } from 'ollama/browser';

export type ModelContextType = {
  setModel: (newModel: string) => void;
  models: (ModelResponse & { show: ShowResponse })[];
  currentModel: (ModelResponse & { show: ShowResponse }) | undefined;
  refreshModels: () => Promise<void>;
};
