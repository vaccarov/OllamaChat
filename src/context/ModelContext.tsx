import React, { useEffect, useState } from 'react';
import { ModelContext } from './ModelContextDefinition';

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
