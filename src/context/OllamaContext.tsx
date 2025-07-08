import React, { createContext, useContext, useMemo } from 'react';
import { Ollama } from 'ollama';

const OllamaContext = createContext<{ollama: Ollama} | undefined>(undefined);

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

export const useOllama = () => {
  const context = useContext(OllamaContext);
  if (!context) {
    throw new Error('useOllama must be used within an OllamaProvider');
  }
  return context.ollama;
};
