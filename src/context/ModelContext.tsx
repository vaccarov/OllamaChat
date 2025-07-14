import React, { createContext, useState } from 'react';

export type ModelContextType = {
  model: string;
  setModel: (newModel: string) => void;
};

export const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = ({ children }: { children: React.ReactNode }) => {
  const [model, setModel] = useState<string>('');

  return (
    <ModelContext.Provider value={{ model, setModel }}>
      {children}
    </ModelContext.Provider>
  );
};
