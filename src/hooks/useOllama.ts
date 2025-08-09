import { OllamaContext } from '@/context/OllamaContextDefinition';
import { useContext } from 'react';

export const useOllama = () => {
  const context = useContext(OllamaContext);
  if (!context) {
    throw new Error('useOllama must be used within an OllamaProvider');
  }
  return context.ollama;
};
