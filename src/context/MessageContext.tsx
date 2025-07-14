import { ChatHistory, ChatSession } from '@/models/ChatHistory';
import { ChatText } from '@/models/ChatText';
import { DocumentToSend } from '@/models/DocumentToSend';
import { systemPrompt as defaultSystemPrompt } from '@/utils/constants';
import { Message } from 'ollama';
import React, { createContext, Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ModelContext } from './ModelContext';

export type MessageContextType = {
  activeSession: ChatSession | undefined;
  sessions: ChatSession[];
  doc: DocumentToSend | undefined;
  conversation: RefObject<Message[]>;
  setDoc: Dispatch<SetStateAction<DocumentToSend | undefined>>;
  addMessage: (role: string, content: string, doc?: DocumentToSend) => void;
  addChunk: (chunk: string) => void;
  startNewSession: (name?: string) => void;
  setActiveSessionId: (id: string) => void;
  updateSystemPrompt: (prompt: string) => void;
  updateModel: (model: string) => void;
  collapsibleStates: Map<string | undefined, boolean>;
  toggleCollapsible: (messageDate: string | undefined) => void;
  renameSession: (id: string, name: string) => void;
  deleteSession: (id: string) => void;
  duplicateSession: (id: string) => void;
};

export const MessageContext = createContext<MessageContextType | undefined>(undefined);

const createNewSession = (systemPrompt: string, model: string = '', name: string = 'Nouvelle Discussion'): ChatSession => ({
  id: uuidv4(),
  name,
  messages: [{ role: 'system', content: systemPrompt, date: new Date().toISOString() }],
  systemPrompt,
  model,
});

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const modelContext = React.useContext(ModelContext);
  const model: string = modelContext?.model || '';
  const setModel: (newModel: string) => void = modelContext?.setModel || (() => {});
  const [chatHistory, setChatHistory] = useState<ChatHistory>(() => {
    const savedHistory: string | null = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const parsedHistory: ChatHistory = JSON.parse(savedHistory);
      return parsedHistory;
    }
    const newSession: ChatSession = createNewSession(defaultSystemPrompt, ''); 
    return { sessions: [newSession], activeSessionId: newSession.id };
  });

  useEffect(() => {
    if (model && chatHistory.activeSessionId) {
      setChatHistory((prev: ChatHistory) => {
        const activeSession: ChatSession | undefined = prev.sessions.find((s: ChatSession) => s.id === prev.activeSessionId);
        if (activeSession && activeSession.model === '') { // Only update if model is not already set
          const sessions: ChatSession[] = prev.sessions.map((s: ChatSession) =>
            s.id === prev.activeSessionId ? { ...s, model } : s
          );
          return { ...prev, sessions };
        }
        return prev;
      });
    }
  }, [model, chatHistory.activeSessionId]);

  const [doc, setDoc] = useState<DocumentToSend | undefined>();
  const conversation = useRef<Message[]>([]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    const active: ChatSession | undefined = chatHistory.sessions.find((s: ChatSession) => s.id === chatHistory.activeSessionId);
    if (active) {
      conversation.current = active.messages
        .filter((m: ChatText) => m.role !== 'custom')
        .map((m: ChatText) => ({
          role: m.role,
          content: m.content,
          images: m.doc ? [m.doc.data.split(',')[1]] : undefined
        }));
      setModel(active.model);
    }
  }, [chatHistory, setModel]);

  const activeSession: ChatSession | undefined = chatHistory.sessions.find((s: ChatSession) => s.id === chatHistory.activeSessionId);

  const addMessage = useCallback((role: string, content: string, doc?: DocumentToSend) => {
    setChatHistory((prev: ChatHistory) => {
      const newMsg: ChatText = { role, content, date: new Date().toISOString(), doc };
      const sessions: ChatSession[] = prev.sessions.map((s: ChatSession) =>
        s.id === prev.activeSessionId ? { ...s, messages: [...s.messages, newMsg] } : s
      );
      return { ...prev, sessions };
    });
  }, []);

  const addChunk = useCallback((chunk: string) => {
    setChatHistory((prev: ChatHistory) => {
      const sessions: ChatSession[] = prev.sessions.map((s: ChatSession) => {
        if (s.id === prev.activeSessionId) {
          const messages: ChatText[] = [...s.messages];
          const lastMessage: ChatText = { ...messages[messages.length - 1] };
          lastMessage.content += chunk;
          messages[messages.length - 1] = lastMessage;
          return { ...s, messages };
        }
        return s;
      });
      return { ...prev, sessions };
    });
  }, []);

  const startNewSession = useCallback((name?: string) => {
    setChatHistory((prev: ChatHistory) => {
      const newSession: ChatSession = createNewSession(defaultSystemPrompt, model, name);
      return { sessions: [...prev.sessions, newSession], activeSessionId: newSession.id };
    });
  }, [model]);

  const setActiveSessionId = useCallback((id: string) => {
    setChatHistory((prev: ChatHistory) => ({ ...prev, activeSessionId: id }));
  }, []);

  const updateSystemPrompt = useCallback((prompt: string) => {
    setChatHistory((prev: ChatHistory) => {
      const sessions: ChatSession[] = prev.sessions.map((s: ChatSession) => {
        if (s.id !== prev.activeSessionId) return s;
        const messages: ChatText[] = s.messages.map((msg: ChatText) => {
          return { ...msg, content: msg.role === 'system' ? prompt : msg.content };
        });
        return { ...s, systemPrompt: prompt, messages };
      });
      return { ...prev, sessions };
    });
  }, []);

  const updateModel = useCallback((model: string) => {
    setChatHistory((prev: ChatHistory) => {
      const sessions: ChatSession[] = prev.sessions.map((s: ChatSession) =>
        s.id === prev.activeSessionId ? { ...s, model } : s
      );
      return { ...prev, sessions };
    });
  }, []);

  const [collapsibleStates, setCollapsibleStates] = useState<Map<string | undefined, boolean>>(new Map());

  const toggleCollapsible = (messageDate: string | undefined) => {
    setCollapsibleStates((prevStates: Map<string | undefined, boolean>) => {
      const newStates: Map<string | undefined, boolean> = new Map(prevStates);
      newStates.set(messageDate, !newStates.get(messageDate));
      return newStates;
    });
  };

  const renameSession = useCallback((id: string, name: string) => {
    setChatHistory((prev: ChatHistory) => {
      const sessions: ChatSession[] = prev.sessions.map((s: ChatSession) =>
        s.id === id ? { ...s, name } : s
      );
      return { ...prev, sessions };
    });
  }, []);

  const deleteSession = useCallback((id: string) => {
    setChatHistory((prev: ChatHistory) => {
      const sessions: ChatSession[] = prev.sessions.filter((s: ChatSession) => s.id !== id);
      if (sessions.length === 0) {
        const newSession: ChatSession = createNewSession(defaultSystemPrompt, model);
        return { sessions: [newSession], activeSessionId: newSession.id };
      }
      if (prev.activeSessionId === id) {
        return { ...prev, sessions, activeSessionId: sessions[0].id };
      }
      return { ...prev, sessions };
    });
  }, [model]);

  const duplicateSession = useCallback((id: string) => {
    setChatHistory((prev: ChatHistory) => {
      const sessionToDuplicate: ChatSession | undefined = prev.sessions.find((s: ChatSession) => s.id === id);
      if (!sessionToDuplicate) return prev;
      const newSession: ChatSession = { ...sessionToDuplicate, id: uuidv4(), name: `${sessionToDuplicate.name} (copy)` };
      return { ...prev, sessions: [...prev.sessions, newSession], activeSessionId: newSession.id };
    });
  }, []);

  return (
    <MessageContext.Provider value={{
      activeSession,
      sessions: chatHistory.sessions,
      doc,
      conversation,
      setDoc,
      addMessage,
      addChunk,
      startNewSession,
      setActiveSessionId,
      updateSystemPrompt,
      updateModel,
      collapsibleStates,
      toggleCollapsible,
      renameSession,
      deleteSession,
      duplicateSession
    }}>
      {children}
    </MessageContext.Provider>
  );
};