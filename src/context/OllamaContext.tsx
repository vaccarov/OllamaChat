import { Ollama } from 'ollama';
import React, { useMemo } from 'react';
import { OllamaContext } from './OllamaContextDefinition';

export const OllamaProvider = ({ children }: { children: React.ReactNode }) => {
  const ollama = useMemo(() => {
    return new Ollama({ host: import.meta.env.VITE_OLLAMA_URL });
  }, []);

  return (
    <OllamaContext.Provider value={{ ollama }}>
      {children}
    </OllamaContext.Provider>
  );
};


