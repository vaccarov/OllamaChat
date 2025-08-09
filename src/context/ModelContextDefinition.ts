import { ModelResponse, ShowResponse } from 'ollama/browser';
import { createContext } from 'react';

export type ModelContextType = {
  setModel: (newModel: string) => void;
  models: (ModelResponse & { show: ShowResponse })[];
  currentModel: (ModelResponse & { show: ShowResponse }) | undefined;
  refreshModels: () => Promise<void>;
};

export const ModelContext = createContext<ModelContextType | undefined>(undefined);