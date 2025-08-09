import { Message } from 'ollama';
import { ImageToSend } from './ImageToSend';

export type ChatText = Message & {
  date?: string;
  role: string; // 'user' | 'assistant' | 'system' | 'custom';
  image?: ImageToSend;
};