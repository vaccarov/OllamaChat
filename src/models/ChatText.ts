import { Message } from 'ollama';

export type ChatText = Message & {
  date?: string;
  role: string; // 'user' | 'assistant' | 'system' | 'custom';
};