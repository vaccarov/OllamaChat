import { createContext } from 'react';

export type ModelContextType = {
  model: string;
  setModel: (newModel: string) => void;
};

export const ModelContext = createContext<ModelContextType | undefined>(undefined);