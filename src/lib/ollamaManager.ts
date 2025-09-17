import { Ollama } from 'ollama';

const instances = new Map<string, Ollama>();

export function getOllamaInstance(url: string): Ollama {
  if (!instances.has(url)) {
    console.log(`Creating new Ollama instance for ${url}`);
    instances.set(url, new Ollama({ host: url }));
  }
  return instances.get(url)!;
}
