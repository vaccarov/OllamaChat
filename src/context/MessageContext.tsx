import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import { ChatHistory } from '@/types/ChatHistory';
import { ChatRole } from '@/types/ChatRoleDefinition';
import { ChatSession } from '@/types/ChatSession';
import { ChatText } from '@/types/ChatText';
import { ImageToSend } from '@/types/ImageToSend';
import { Message } from 'ollama';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();

  const createNewSession = useCallback((model: string = '', name: string = t('chat.new_chat_default_name')): ChatSession => ({
    id: uuidv4(),
    name,
    messages: [{ role: ChatRole.system, content: '', date: new Date().toISOString() }],
    systemPrompt: '',
    model,
  }), [t]);
  const { currentModel, setModel } = React.useContext(ModelContext)!;
  const [chatHistory, setChatHistory] = useState<ChatHistory>(() => {
    const savedHistory: string | null = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const parsedHistory: ChatHistory = JSON.parse(savedHistory);
      return parsedHistory;
    }
    const newSession: ChatSession = createNewSession('', t('chat.new_chat_default_name')); 
    return { sessions: [newSession], activeSessionId: newSession.id };
  });


  const [image, setImage] = useState<ImageToSend | undefined>();
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
          images: m.image?.data?.split(',')[1] !== undefined
            ? [m.image.data.split(',')[1] as string]
            : undefined
        }));
      setModel(active.model);
    }
  }, [chatHistory, setModel]);

  const activeSession: ChatSession | undefined = chatHistory.sessions.find((s: ChatSession) => s.id === chatHistory.activeSessionId);

  const addMessage = useCallback((role: ChatRole, content: string, image?: ImageToSend, sessionId?: string) => {
    setChatHistory((prev: ChatHistory) => {
      const targetSessionId = sessionId || prev.activeSessionId;
      const newMsg: ChatText = { role, content, date: new Date().toISOString(), image };
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
            role: prevLastMessage?.role ?? ChatRole.user,
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
      const newSession: ChatSession = createNewSession(currentModel?.model || '', name);
      return { sessions: [...prev.sessions, newSession], activeSessionId: newSession.id };
    });
  }, [createNewSession, currentModel?.model]);

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
        const newSession: ChatSession = createNewSession(currentModel?.model || '', t('chat.new_chat_default_name'));
        return { sessions: [newSession], activeSessionId: newSession.id };
      }
      if (prev.activeSessionId === id) {
        return { ...prev, sessions, activeSessionId: sessions[0]?.id ?? null };
      }
      return { ...prev, sessions };
    });
  }, [createNewSession, currentModel?.model, t]);

  const duplicateSession = useCallback((id: string) => {
    setChatHistory((prev: ChatHistory) => {
      const sessionToDuplicate: ChatSession | undefined = prev.sessions.find((s: ChatSession) => s.id === id);
      if (!sessionToDuplicate) return prev;
      const newSession: ChatSession = { ...sessionToDuplicate, id: uuidv4(), name: `${sessionToDuplicate.name}${t('chat.copy_suffix')}` };
      return { ...prev, sessions: [...prev.sessions, newSession], activeSessionId: newSession.id };
    });
  }, [t]);

  const exportSessions = useCallback((): void => {
    const json: string = JSON.stringify(chatHistory, null, 2);
    const blob: Blob = new Blob([json], { type: 'application/json' });
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = t('chat.history.filename');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [chatHistory, t]);

  const importSessions = useCallback((jsonString: string) => {
    try {
      const importedHistory: ChatHistory = JSON.parse(jsonString);
      if (importedHistory && Array.isArray(importedHistory.sessions) && typeof importedHistory.activeSessionId === 'string') {
        setChatHistory(importedHistory);
      } else {
        console.error(t('chat.history.invalid_format'), importedHistory);
        alert(t('chat.history.invalid_format'));
      }
    } catch (error) {
      console.error(t('chat.history.parsing_error'), error);
      alert(t('chat.history.parsing_error'));
    }
  }, [t]);

  return (
    <MessageContext.Provider value={{
      activeSession,
      sessions: chatHistory.sessions,
      image,
      conversation,
      setImage,
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