import { ChatHistory, ChatSession } from '@/models/ChatHistory';
import { ChatText } from '@/models/ChatText';
import { DocumentToSend } from '@/models/DocumentToSend';
import { Message } from 'ollama';
import React, { createContext, Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { ModelContext } from './ModelContext';

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

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();

  const createNewSession = useCallback((systemPrompt: string, model: string = '', name: string = t('new_chat_default_name')): ChatSession => ({
    id: uuidv4(),
    name,
    messages: [{ role: 'system', content: systemPrompt, date: new Date().toISOString() }],
    systemPrompt,
    model,
  }), [t]);
  const modelContext = React.useContext(ModelContext);
  const model: string = modelContext?.model || '';
  const setModel: (newModel: string) => void = modelContext?.setModel || (() => {});
  const [chatHistory, setChatHistory] = useState<ChatHistory>(() => {
    const savedHistory: string | null = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const parsedHistory: ChatHistory = JSON.parse(savedHistory);
      return parsedHistory;
    }
    const newSession: ChatSession = createNewSession(t('system_prompt_content'), '', t('new_chat_default_name')); 
    return { sessions: [newSession], activeSessionId: newSession.id };
  });


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
          images: m.doc && m.doc.data.split(',')[1] !== undefined
            ? [m.doc.data.split(',')[1] as string]
            : undefined
        }));
      setModel(active.model);
    }
  }, [chatHistory, setModel]);

  const activeSession: ChatSession | undefined = chatHistory.sessions.find((s: ChatSession) => s.id === chatHistory.activeSessionId);

  const addMessage = useCallback((role: string, content: string, doc?: DocumentToSend, sessionId?: string) => {
    setChatHistory((prev: ChatHistory) => {
      const targetSessionId = sessionId || prev.activeSessionId;
      const newMsg: ChatText = { role, content, date: new Date().toISOString(), doc };
      const sessions: ChatSession[] = prev.sessions.map((s: ChatSession) =>
        s.id === targetSessionId ? { ...s, messages: [...s.messages, newMsg] } : s
      );
      return { ...prev, sessions };
    });
  }, []);

  const addChunk = useCallback((chunk: string, sessionId?: string) => {
    setChatHistory((prev: ChatHistory) => {
      const targetSessionId = sessionId || prev.activeSessionId;
      const sessions: ChatSession[] = prev.sessions.map((s: ChatSession) => {
        if (s.id === targetSessionId) {
          const messages: ChatText[] = [...s.messages];
          const prevLastMessage = messages[messages.length - 1];
          const lastMessage: ChatText = {
            ...prevLastMessage,
            role: prevLastMessage?.role ?? '',
            content: (prevLastMessage?.content ?? '') + chunk,
            date: prevLastMessage?.date ?? new Date().toISOString()
          };
          messages[messages.length - 1] = lastMessage;
          return { ...s, messages };
        }
        return s;
      });
      return { ...prev, sessions };
    });
  }, []);

  const startNewSession = useCallback((name: string) => {
    setChatHistory((prev: ChatHistory) => {
      const newSession: ChatSession = createNewSession(t('system_prompt_content'), model, name);
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
        const newSession: ChatSession = createNewSession(t('system_prompt_content'), model, t('new_chat_default_name'));
        return { sessions: [newSession], activeSessionId: newSession.id };
      }
      if (prev.activeSessionId === id) {
        return { ...prev, sessions, activeSessionId: sessions[0]?.id ?? null };
      }
      return { ...prev, sessions };
    });
  }, [model]);

  const duplicateSession = useCallback((id: string) => {
    setChatHistory((prev: ChatHistory) => {
      const sessionToDuplicate: ChatSession | undefined = prev.sessions.find((s: ChatSession) => s.id === id);
      if (!sessionToDuplicate) return prev;
      const newSession: ChatSession = { ...sessionToDuplicate, id: uuidv4(), name: `${sessionToDuplicate.name}${t('copy_suffix')}` };
      return { ...prev, sessions: [...prev.sessions, newSession], activeSessionId: newSession.id };
    });
  }, []);

  const exportSessions = useCallback((): void => {
    const json: string = JSON.stringify(chatHistory, null, 2);
    const blob: Blob = new Blob([json], { type: 'application/json' });
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = t('chat_history_filename');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [chatHistory]);

  const importSessions = useCallback((jsonString: string) => {
    try {
      const importedHistory: ChatHistory = JSON.parse(jsonString);
      if (importedHistory && Array.isArray(importedHistory.sessions) && typeof importedHistory.activeSessionId === 'string') {
        setChatHistory(importedHistory);
      } else {
        console.error(t('invalid_chat_history_format'), importedHistory);
        alert(t('invalid_chat_history_format'));
      }
    } catch (error) {
      console.error(t('error_parsing_chat_history_json'), error);
      alert(t('error_parsing_chat_history_json'));
    }
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
      duplicateSession,
      exportSessions,
      importSessions
    }}>
      {children}
    </MessageContext.Provider>
  );
};