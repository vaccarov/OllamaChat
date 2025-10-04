import { ChatSession } from '@/types/ChatSession';

export type ChatHistory = {
  sessions: ChatSession[];
  activeSessionId: string | null;
};
