import { Ollama } from 'ollama';
import React, { useMemo } from 'react';
import { OllamaContext } from './OllamaContextDefinition';

export const OllamaProvider = ({ children }: { children: React.ReactNode }) => {
  const ollama = useMemo(() => {
    return new Ollama({ host: window.location.origin });
  }, []);

  return (
    <OllamaContext.Provider value={{ ollama }}>
      {children}
    </OllamaContext.Provider>
  );
};


