import { Message } from 'ollama';
import { DocumentToSend } from './DocumentToSend';

export type ChatText = Message & {
  date?: string;
  role: string; // 'user' | 'assistant' | 'system' | 'custom';
  doc?: DocumentToSend;
};