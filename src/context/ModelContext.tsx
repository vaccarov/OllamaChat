import React, { createContext, useEffect, useState } from 'react';

export type ModelContextType = {
  model: string;
  setModel: (newModel: string) => void;
};

export const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = ({ children }: { children: React.ReactNode }) => {
  const [model, setModel] = useState<string>(() => {
    const savedModel = localStorage.getItem('selectedModel');
    return savedModel || '';
  });

  useEffect(() => {
    localStorage.setItem('selectedModel', model);
  }, [model]);

  return (
    <ModelContext.Provider value={{ model, setModel }}>
      {children}
    </ModelContext.Provider>
  );
};
