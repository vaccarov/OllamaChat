import { Ollama } from 'ollama';

const host: string = `${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_OLLAMA_PORT}`;

export const ollama = new Ollama({ host });
