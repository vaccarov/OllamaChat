import { STORAGE_KEYS } from '@/constants/storageKeys';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import usePersistentState from '@/hooks/usePersistentState';
import { ChatHistory, ChatRole, ChatSession, ChatText, ImageToSend } from '@/types';
import { sortSessionsByDate } from '@/utils/tools';
import { Message } from 'ollama';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

export const MessageProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const { t, i18n } = useTranslation();
  const { currentModel, setModel } = React.useContext(ModelContext)!;
  const [history, setHistory] = usePersistentState<ChatHistory>(STORAGE_KEYS.chatHistory, { sessions: [], activeSessionId: '' });
  const { sessions, activeSessionId }: ChatHistory = history;
  const [image, setImage] = useState<ImageToSend | undefined>();
  const conversation = useRef<Message[]>([]);
  const historyRef: React.MutableRefObject<ChatHistory> = useRef<ChatHistory>(history);
  historyRef.current = history;

  const createNewSession = useCallback((model: string = '', name: string = t('chat.new_chat_default_name')): ChatSession => ({
    id: uuidv4(),
    name,
    messages: [{ role: ChatRole.system, content: '', date: new Date().toISOString() }],
    systemPrompt: '',
    model,
  }), [t]);

  useEffect(() => {
    if (sessions.length === 0) {
      const newSession: ChatSession = createNewSession('', t('chat.new_chat_default_name'));
      setHistory({ sessions: [newSession], activeSessionId: newSession.id });
    }
  }, [sessions.length, createNewSession, setHistory, t]);

  const setSessions = useCallback((updater: React.SetStateAction<ChatSession[]>) => {
    setHistory((prev: ChatHistory) => {
      const newSessions: ChatSession[] = typeof updater === 'function' ? updater(prev.sessions) : updater;
      return { ...prev, sessions: newSessions };
    });
  }, [setHistory]);

  const setActiveSessionId = useCallback((updater: React.SetStateAction<string | null>) => {
    setHistory((prev: ChatHistory) => {
      const newId: string | null = typeof updater === 'function' ? updater(prev.activeSessionId) : updater;
      return { ...prev, activeSessionId: newId };
    });
  }, [setHistory]);

  // Centralized helper to update a session
  const findAndUpdateSession = useCallback((updater: (session: ChatSession) => ChatSession, sessionIdToUpdate?: string) => {
    const targetSessionId: string | null = sessionIdToUpdate || activeSessionId;
    setSessions((prevSessions: ChatSession[]) =>
      prevSessions.map((s: ChatSession) => (s.id === targetSessionId ? updater(s) : s))
    );
  }, [activeSessionId, setSessions]);

  const activeSession: ChatSession | undefined = useMemo(() =>
    sessions.find((s: ChatSession) => s.id === activeSessionId)
  , [sessions, activeSessionId]);

  useEffect(() => {
    if (activeSession && activeSession.model !== currentModel?.model) {
      setModel(activeSession.model);
    }
  }, [activeSession, currentModel, setModel]);

  useEffect(() => {
    if (activeSession) {
      conversation.current = activeSession.messages
        .filter((m: ChatText) => m.role !== 'custom')
        .map((m: ChatText) => ({
          role: m.role,
          content: m.content,
          images: m.image?.data?.split(',')[1] !== undefined
            ? [m.image.data.split(',')[1] as string]
            : undefined
        }));
    }
  }, [activeSession]);

  const addMessage = useCallback((role: ChatRole, content: string, image?: ImageToSend, sessionId?: string): void => {
    const newMsg: ChatText = { role, content, date: new Date().toISOString(), image };
    findAndUpdateSession((s: ChatSession) => ({ ...s, messages: [...s.messages, newMsg] }), sessionId);
  }, [findAndUpdateSession]);

  const addChunk = useCallback((chunk: string, sessionId?: string): void => {
    findAndUpdateSession((s: ChatSession) => {
      const messages: ChatText[] = [...s.messages];
      const lastMessage: ChatText | undefined = messages[messages.length - 1];
      messages[messages.length - 1] = {
        ...lastMessage,
        role: lastMessage?.role ?? ChatRole.user,
        content: (lastMessage?.content ?? '') + chunk,
        date: lastMessage?.date ?? new Date().toISOString()
      };
      return { ...s, messages };
    }, sessionId);
  }, [findAndUpdateSession]);

  const startNewSession = useCallback((name: string): void => {
    const newSession: ChatSession = createNewSession(currentModel?.model || '', name);
    setSessions((prevSessions: ChatSession[]) => [...prevSessions, newSession]);
    setActiveSessionId(newSession.id);
  }, [createNewSession, currentModel?.model, setActiveSessionId, setSessions]);

  const updateSystemPrompt = useCallback((systemPrompt: string): void => {
    findAndUpdateSession((s: ChatSession) => ({
      ...s,
      systemPrompt,
      messages: s.messages.map((msg: ChatText) => 
        msg.role === ChatRole.system ? { ...msg, content: systemPrompt } : msg
      ),
    }));
  }, [findAndUpdateSession]);

  const updateModel = useCallback((model: string): void => {
    findAndUpdateSession((s: ChatSession) => ({ ...s, model }));
  }, [findAndUpdateSession]);

  const renameSession = useCallback((id: string, name: string): void => {
    findAndUpdateSession((s: ChatSession) => ({ ...s, name }), id);
  }, [findAndUpdateSession]);

  const deleteSession = useCallback((id: string): void => {
    setHistory((prev: ChatHistory) => {
      const remainingSessions: ChatSession[] = prev.sessions.filter((s: ChatSession) => s.id !== id);
      if (remainingSessions.length === 0) {
        const newSession: ChatSession = createNewSession(currentModel?.model || '', t('chat.new_chat_default_name'));
        return { sessions: [newSession], activeSessionId: newSession.id };
      }
      const newActiveId: string | null = prev.activeSessionId === id
          ? sortSessionsByDate(remainingSessions)[0]!.id
          : prev.activeSessionId;
      return { sessions: remainingSessions, activeSessionId: newActiveId };
    });
  }, [createNewSession, currentModel?.model, t, setHistory]);

  const duplicateSession = useCallback((id: string): void => {
    setHistory((prev: ChatHistory) => {
      const sessionToDuplicate: ChatSession | undefined = prev.sessions.find((s: ChatSession) => s.id === id);
      if (!sessionToDuplicate) return prev;
      const newSession: ChatSession = { ...sessionToDuplicate, id: uuidv4(), name: `${sessionToDuplicate.name}${t('chat.copy_suffix')}` };
      return {
        sessions: [...prev.sessions, newSession],
        activeSessionId: newSession.id
      };
    });
  }, [t, setHistory]);

  const exportSessions = useCallback((): void => {
    const { sessions, activeSessionId }: ChatHistory = historyRef.current;
    const json: string = JSON.stringify({ sessions, activeSessionId }, null, 2);
    const blob: Blob = new Blob([json], { type: 'application/json' });
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = t('chat.history.filename');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [t]);

  const importSessions = useCallback((jsonString: string): void => {
    try {
      const importedHistory: ChatHistory = JSON.parse(jsonString);
      if (importedHistory && Array.isArray(importedHistory.sessions) && typeof importedHistory.activeSessionId === 'string') {
        setHistory((prev: ChatHistory) => {
          const existingIds: Set<string> = new Set(prev.sessions.map((s: ChatSession) => s.id));
          const newSessions: ChatSession[] = importedHistory.sessions.filter((s: ChatSession) => !existingIds.has(s.id));
          return {
            ...prev,
            sessions: [...prev.sessions, ...newSessions],
            activeSessionId: prev.activeSessionId || importedHistory.activeSessionId
          };
        });
      } else {
        console.error(t('chat.history.invalid_format'), importedHistory);
        alert(t('chat.history.invalid_format'));
      }
    } catch (error) {
      console.error(t('chat.history.parsing_error'), error);
      alert(t('chat.history.parsing_error'));
    }
  }, [t, setHistory]);

  const sessionsInGroup: Record<string, ChatSession[]> = useMemo(() => {
    return sortSessionsByDate(sessions)
      .reduce((acc: Record<string, ChatSession[]>, session: ChatSession) => {
        const lastMessage: ChatText | undefined = session.messages[session.messages.length - 1];
        const lastMessageDate: Date = new Date(lastMessage?.date || '');
        const formattedDate: string = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(lastMessageDate);
        if (!acc[formattedDate]) acc[formattedDate] = [];
        acc[formattedDate].push(session);
        return acc;
      }, {} as Record<string, ChatSession[]>);
  }, [sessions, i18n.language]);

  return (
    <MessageContext.Provider value={{
      activeSession,
      sessionsInGroup,
      image,
      conversation,
      setImage,
      addMessage,
      addChunk,
      startNewSession,
      setActiveSessionId,
      updateSystemPrompt,
      updateModel,
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