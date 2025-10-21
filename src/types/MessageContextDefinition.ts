import { ChatRole } from '@/types/ChatRoleDefinition';
import { ChatSession } from '@/types/ChatSession';
import { ImageToSend } from '@/types/ImageToSend';
import { Message } from 'ollama';
import { Dispatch, RefObject, SetStateAction } from 'react';

export type MessageContextType = {
  activeSession: ChatSession | undefined;
  conversation: RefObject<Message[]>;
  sessionsInGroup: Record<string, ChatSession[]>;
  speechLang: string;
  isThinkingEnabled: boolean;
  setIsThinkingEnabled: (enabled: boolean) => void;
  addMessage: (role: ChatRole, content: string, image?: ImageToSend, sessionId?: string) => void;
  addChunk: (message: Message, sessionId?: string) => void;
  renameSession: (id: string, name: string) => void;
  deleteSession: (id: string) => void;
  duplicateSession: (id: string) => void;
  exportSessions: () => void;
  importSessions: (jsonString: string) => void;
  startNewSession: (name: string) => void;
  setActiveSessionId: (id: string) => void;
  updateSystemPrompt: (prompt: string) => void;
  updateModel: (model: string) => void;
  setSpeechLang: Dispatch<SetStateAction<string>>;
};
