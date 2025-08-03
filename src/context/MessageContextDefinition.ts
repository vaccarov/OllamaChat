import { ChatSession } from '@/models/ChatHistory';
import { DocumentToSend } from '@/models/DocumentToSend';
import { Message } from 'ollama';
import { createContext, Dispatch, RefObject, SetStateAction } from 'react';

export type MessageContextType = {
  activeSession: ChatSession | undefined;
  sessions: ChatSession[];
  doc: DocumentToSend | undefined;
  conversation: RefObject<Message[]>;
  setDoc: Dispatch<SetStateAction<DocumentToSend | undefined>>;
  addMessage: (role: string, content: string, doc?: DocumentToSend, sessionId?: string) => void;
  addChunk: (chunk: string, sessionId?: string) => void;
  startNewSession: (name: string) => void;
  setActiveSessionId: (id: string) => void;
  updateSystemPrompt: (prompt: string) => void;
  updateModel: (model: string) => void;
  collapsibleStates: Map<string | undefined, boolean>;
  toggleCollapsible: (messageDate: string | undefined) => void;
  renameSession: (id: string, name: string) => void;
  deleteSession: (id: string) => void;
  duplicateSession: (id: string) => void;
  exportSessions: () => void;
  importSessions: (jsonString: string) => void;
};

export const MessageContext = createContext<MessageContextType | undefined>(undefined);
