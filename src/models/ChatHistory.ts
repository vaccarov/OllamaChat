import { ChatText } from './ChatText';

export type ChatSession = {
  id: string;
  name: string;
  messages: ChatText[];
  systemPrompt: string;
  model: string;
};

export type ChatHistory = {
  sessions: ChatSession[];
  activeSessionId: string | null;
};