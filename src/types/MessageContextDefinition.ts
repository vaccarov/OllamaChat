import { ChatRole } from '@/types/ChatRoleDefinition';
import { ChatSession } from '@/types/ChatSession';
import { ImageToSend } from '@/types/ImageToSend';
import { Message } from 'ollama';
import { Dispatch, RefObject, SetStateAction } from 'react';

export type MessageContextType = {
  activeSession: ChatSession | undefined;
  sessions: ChatSession[];
  image: ImageToSend | undefined;
  conversation: RefObject<Message[]>;
  setImage: Dispatch<SetStateAction<ImageToSend | undefined>>;
  addMessage: (role: ChatRole, content: string, image?: ImageToSend, sessionId?: string) => void;
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
