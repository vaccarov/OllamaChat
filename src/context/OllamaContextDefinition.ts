import { Ollama } from 'ollama';
import { createContext } from 'react';

export const OllamaContext = createContext<{ollama: Ollama} | undefined>(undefined);
