import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import { ChatHistory, ChatRole, ChatSession, ChatText, ImageToSend } from '@/types';
import { Message } from 'ollama';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const { t, i18n } = useTranslation();

  const createNewSession = useCallback((model: string = '', name: string = t('chat.new_chat_default_name')): ChatSession => ({
    id: uuidv4(),
    name,
    messages: [{ role: ChatRole.system, content: '', date: new Date().toISOString() }],
    systemPrompt: '',
    model,
  }), [t]);
  const { currentModel, setModel } = React.useContext(ModelContext)!;
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [image, setImage] = useState<ImageToSend | undefined>();
  const conversation = useRef<Message[]>([]);

  useEffect(() => {
    try {
      const savedHistory: string | null = localStorage.getItem('chatHistory');
      if (savedHistory) {
        const parsed: ChatHistory = JSON.parse(savedHistory) as ChatHistory;
        if (parsed.sessions && parsed.activeSessionId) {
          setSessions(parsed.sessions);
          setActiveSessionId(parsed.activeSessionId);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to parse chat history from localStorage", e);
    }
    const newSession: ChatSession = createNewSession('', t('chat.new_chat_default_name'));
    setSessions([newSession]);
    setActiveSessionId(newSession.id);
  }, [createNewSession, t]);

  useEffect(() => {
    if (sessions.length > 0 && activeSessionId) {
      const chatHistory: ChatHistory = { sessions, activeSessionId };
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [sessions, activeSessionId]);

  const activeSession: ChatSession | undefined = useMemo(() =>
    sessions.find((s: ChatSession) => s.id === activeSessionId)
  , [sessions, activeSessionId]);

  useEffect(() => {
    if (activeSession) {
      if (currentModel?.model !== activeSession.model) {
        setModel(activeSession.model);
      }
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
  }, [activeSession, currentModel, setModel]);


  const addMessage = useCallback((role: ChatRole, content: string, image?: ImageToSend, sessionId?: string) => {
    const targetSessionId: string = sessionId || activeSessionId;
    const newMsg: ChatText = { role, content, date: new Date().toISOString(), image };
    setSessions((prevSessions: ChatSession[]) =>
      prevSessions.map((s: ChatSession) =>
        s.id === targetSessionId ? { ...s, messages: [...s.messages, newMsg] } : s
      )
    );
  }, [activeSessionId]);

  const addChunk = useCallback((chunk: string, sessionId?: string) => {
    const targetSessionId: string = sessionId || activeSessionId;
    setSessions((prevSessions: ChatSession[]) =>
      prevSessions.map((s: ChatSession) => {
      if (s.id === targetSessionId) {
        const messages: ChatText[] = [...s.messages];
        const prevLastMessage: ChatText | undefined = messages[messages.length - 1];
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
    }));
  }, [activeSessionId]);

  const startNewSession = useCallback((name: string) => {
    const newSession: ChatSession = createNewSession(currentModel?.model || '', name);
    setSessions((prevSessions: ChatSession[]) => [...prevSessions, newSession]);
    setActiveSessionId(newSession.id);
  }, [createNewSession, currentModel?.model]);

  const updateSystemPrompt = useCallback((systemPrompt: string) => {
    setSessions((prevSessions: ChatSession[]) =>
      prevSessions.map((s: ChatSession) => {
        if (s.id !== activeSessionId) return s;
        const messages: ChatText[] = s.messages.map((msg: ChatText) => {
          return { ...msg, content: msg.role === ChatRole.system ? systemPrompt : msg.content };
        });
        return { ...s, systemPrompt, messages };
      })
    );
  }, [activeSessionId]);

  const updateModel = useCallback((model: string) => {
    setSessions((prevSessions: ChatSession[]) =>
      prevSessions.map((s: ChatSession) =>
        s.id === activeSessionId ? { ...s, model } : s
      )
    );
  }, [activeSessionId]);

  const [collapsibleStates, setCollapsibleStates] = useState<Map<string | undefined, boolean>>(new Map());

  const toggleCollapsible = (messageDate: string | undefined) => {
    setCollapsibleStates((prevStates: Map<string | undefined, boolean>) => {
      const newStates: Map<string | undefined, boolean> = new Map(prevStates);
      newStates.set(messageDate, !newStates.get(messageDate));
      return newStates;
    });
  };

  const renameSession = useCallback((id: string, name: string) => {
    setSessions((prevSessions: ChatSession[]) =>
      prevSessions.map((s: ChatSession) =>
        s.id === id ? { ...s, name } : s
      )
    );
  }, []);

  const deleteSession = useCallback((id: string) => {
    const remainingSessions: ChatSession[] = sessions.filter((s: ChatSession) => s.id !== id);
    if (remainingSessions.length === 0) {
      const newSession = createNewSession(currentModel?.model || '', t('chat.new_chat_default_name'));
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
      return;
    }
    setSessions(remainingSessions);
    if (activeSessionId === id) {
      const sortedSessions: ChatSession[] = remainingSessions.slice().sort((a, b) => {
        const dateA: number = new Date(a.messages[a.messages.length - 1]?.date || 0).getTime();
        const dateB: number = new Date(b.messages[b.messages.length - 1]?.date || 0).getTime();
        return dateB - dateA;
      });
      setActiveSessionId(sortedSessions[0]!.id);
    }
  }, [sessions, activeSessionId, createNewSession, currentModel?.model, t]);

  const duplicateSession = useCallback((id: string) => {
    const sessionToDuplicate: ChatSession | undefined = sessions.find((s: ChatSession) => s.id === id);
    if (!sessionToDuplicate) return;
    const newSession: ChatSession = { ...sessionToDuplicate, id: uuidv4(), name: `${sessionToDuplicate.name}${t('chat.copy_suffix')}` };
    setSessions(prevSessions => [...prevSessions, newSession]);
    setActiveSessionId(newSession.id);
  }, [sessions, t]);

  const exportSessions = useCallback((): void => {
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
  }, [sessions, activeSessionId, t]);

  const importSessions = useCallback((jsonString: string) => {
    try {
      const importedHistory: ChatHistory = JSON.parse(jsonString);
      if (importedHistory && Array.isArray(importedHistory.sessions) && typeof importedHistory.activeSessionId === 'string') {
        setSessions(importedHistory.sessions);
        setActiveSessionId(importedHistory.activeSessionId);
      } else {
        console.error(t('chat.history.invalid_format'), importedHistory);
        alert(t('chat.history.invalid_format'));
      }
    } catch (error) {
      console.error(t('chat.history.parsing_error'), error);
      alert(t('chat.history.parsing_error'));
    }
  }, [t]);

  const sessionsInGroup = useMemo(() => {
    return sessions
      .slice()
      .sort((a: ChatSession, b: ChatSession) => {
        const dateA: Date = new Date(a.messages[a.messages.length - 1]?.date || '');
        const dateB: Date = new Date(b.messages[b.messages.length - 1]?.date || '');
        return dateB.getTime() - dateA.getTime();
      })
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
      collapsibleStates,
      setImage,
      addMessage,
      addChunk,
      startNewSession,
      setActiveSessionId,
      updateSystemPrompt,
      updateModel,
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