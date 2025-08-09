import { ChatText } from '@/types/ChatText';

export type ChatSession = {
  id: string;
  name: string;
  messages: ChatText[];
  systemPrompt: string;
  model: string;
};