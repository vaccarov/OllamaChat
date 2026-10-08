import { useLocalStorage } from '@mantine/hooks';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_SPEECH_LANG } from '@/constants/langs';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import {
  type ChatHistory,
  ChatRole,
  type ChatSession,
  type ChatText,
  type ImageToSend,
  type Message,
} from '@/types';
import { downloadFile, sortSessionsByDate } from '@/utils/tools';

export const MessageProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const { t, i18n } = useTranslation();
  const modelContext = React.useContext(ModelContext);
  const [history, setHistory] = useLocalStorage<ChatHistory>({
    key: STORAGE_KEYS.chatHistory,
    defaultValue: { sessions: [], activeSessionId: '' },
    getInitialValueInEffect: false,
  });
  const [speechLang, setSpeechLang] = useLocalStorage<string>({
    key: STORAGE_KEYS.speechLang,
    defaultValue: DEFAULT_SPEECH_LANG,
  });
  const [isThinkingEnabled, setIsThinkingEnabled] = useState<boolean>(false);
  const { sessions, activeSessionId }: ChatHistory = history;

  const createNewSession = useCallback(
    (model: string = '', name: string = t('chat.new_chat_default_name')): ChatSession => ({
      id: uuidv4(),
      name,
      messages: [
        { id: uuidv4(), role: ChatRole.system, content: '', date: new Date().toISOString() },
      ],
      systemPrompt: '',
      model,
    }),
    [t]
  );

  useEffect(() => {
    if (sessions.length === 0) {
      const newSession: ChatSession = createNewSession('', t('chat.new_chat_default_name'));
      setHistory({ sessions: [newSession], activeSessionId: newSession.id });
    }
  }, [sessions.length, createNewSession, setHistory, t]);

  const setSessions = useCallback(
    (updater: (sessions: ChatSession[]) => ChatSession[]) => {
      setHistory((prev: ChatHistory) => ({ ...prev, sessions: updater(prev.sessions) }));
    },
    [setHistory]
  );

  const setActiveSessionId = useCallback(
    (id: string | null) => {
      setHistory((prev: ChatHistory) => ({ ...prev, activeSessionId: id }));
    },
    [setHistory]
  );

  // Centralized helper to update a session
  const findAndUpdateSession = useCallback(
    (updater: (session: ChatSession) => ChatSession, sessionIdToUpdate?: string) => {
      const targetSessionId: string | null = sessionIdToUpdate || activeSessionId;
      setSessions((prevSessions: ChatSession[]) =>
        prevSessions.map((s: ChatSession) => (s.id === targetSessionId ? updater(s) : s))
      );
    },
    [activeSessionId, setSessions]
  );

  const activeSession: ChatSession | undefined = useMemo(
    () => sessions.find((s: ChatSession) => s.id === activeSessionId),
    [sessions, activeSessionId]
  );

  useEffect(() => {
    if (activeSession && modelContext && activeSession.model !== modelContext.currentModel?.model) {
      modelContext.setModel(activeSession.model);
    }
  }, [activeSession, modelContext]);

  const conversation: Message[] = useMemo(
    () =>
      (activeSession?.messages ?? [])
        .filter((m: ChatText) => m.role !== 'custom')
        .map((m: ChatText) => ({
          role: m.role,
          content: m.content,
          images:
            m.image?.data?.split(',')[1] !== undefined
              ? [m.image.data.split(',')[1] as string]
              : undefined,
        })),
    [activeSession]
  );

  const addMessage = useCallback(
    (role: ChatRole, content: string, image?: ImageToSend, sessionId?: string): void => {
      const newMsg: ChatText = {
        id: uuidv4(),
        role,
        content,
        date: new Date().toISOString(),
        image,
      };
      findAndUpdateSession(
        (s: ChatSession) => ({ ...s, messages: [...s.messages, newMsg] }),
        sessionId
      );
    },
    [findAndUpdateSession]
  );

  const addChunk = useCallback(
    (message: Message, sessionId?: string): void => {
      findAndUpdateSession((s: ChatSession) => {
        const messages: ChatText[] = [...s.messages];
        const lastMessage: ChatText | undefined = messages[messages.length - 1];

        let newContent = (lastMessage?.content ?? '') + (message.content ?? '');
        let newThinking = (lastMessage?.thinking ?? '') + (message.thinking ?? '');

        // Handle models that stream <think> tags in content
        if (newContent.includes('<think>')) {
          const thinkParts = newContent.split('<think>');
          const beforeThink = thinkParts[0];
          const afterThink = thinkParts.slice(1).join('<think>');

          if (afterThink.includes('</think>')) {
            const endThinkParts = afterThink.split('</think>');
            newThinking += endThinkParts[0];
            newContent = (beforeThink || '') + endThinkParts.slice(1).join('</think>');
          } else {
            // Still thinking...
            newThinking += afterThink;
            newContent = beforeThink || '';
          }
        }

        messages[messages.length - 1] = {
          ...lastMessage,
          id: lastMessage?.id ?? uuidv4(),
          role: lastMessage?.role ?? ChatRole.assistant,
          content: newContent,
          thinking: newThinking,
          date: lastMessage?.date ?? new Date().toISOString(),
        };
        return { ...s, messages };
      }, sessionId);
    },
    [findAndUpdateSession]
  );

  const startNewSession = useCallback(
    (name: string): void => {
      const newSession: ChatSession = createNewSession(
        modelContext?.currentModel?.model || '',
        name
      );
      setSessions((prevSessions: ChatSession[]) => [...prevSessions, newSession]);
      setActiveSessionId(newSession.id);
    },
    [createNewSession, modelContext?.currentModel?.model, setActiveSessionId, setSessions]
  );

  const updateSystemPrompt = useCallback(
    (systemPrompt: string): void => {
      findAndUpdateSession((s: ChatSession) => ({
        ...s,
        systemPrompt,
        messages: s.messages.map((msg: ChatText) =>
          msg.role === ChatRole.system ? { ...msg, content: systemPrompt } : msg
        ),
      }));
    },
    [findAndUpdateSession]
  );

  const updateModel = useCallback(
    (model: string): void => {
      findAndUpdateSession((s: ChatSession) => ({ ...s, model }));
    },
    [findAndUpdateSession]
  );

  const renameSession = useCallback(
    (id: string, name: string): void => {
      findAndUpdateSession((s: ChatSession) => ({ ...s, name }), id);
    },
    [findAndUpdateSession]
  );

  const deleteSession = useCallback(
    (id: string): void => {
      setHistory((prev: ChatHistory) => {
        const remainingSessions: ChatSession[] = prev.sessions.filter(
          (s: ChatSession) => s.id !== id
        );
        if (remainingSessions.length === 0) {
          const newSession: ChatSession = createNewSession(
            modelContext?.currentModel?.model || '',
            t('chat.new_chat_default_name')
          );
          return { sessions: [newSession], activeSessionId: newSession.id };
        }
        const newActiveId: string | null =
          prev.activeSessionId === id
            ? sortSessionsByDate(remainingSessions)[0]?.id
            : prev.activeSessionId;
        return { sessions: remainingSessions, activeSessionId: newActiveId };
      });
    },
    [createNewSession, modelContext?.currentModel?.model, t, setHistory]
  );

  const duplicateSession = useCallback(
    (id: string): void => {
      setHistory((prev: ChatHistory) => {
        const sessionToDuplicate: ChatSession | undefined = prev.sessions.find(
          (s: ChatSession) => s.id === id
        );
        if (!sessionToDuplicate) return prev;
        const newSession: ChatSession = {
          ...sessionToDuplicate,
          id: uuidv4(),
          name: `${sessionToDuplicate.name}${t('chat.copy_suffix')}`,
        };
        return {
          sessions: [...prev.sessions, newSession],
          activeSessionId: newSession.id,
        };
      });
    },
    [t, setHistory]
  );

  const exportSessions = useCallback((): void => {
    const blob: Blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    downloadFile(t('chat.history.filename'), URL.createObjectURL(blob));
  }, [history, t]);

  const importSessions = useCallback(
    (jsonString: string): void => {
      try {
        const importedHistory: ChatHistory = JSON.parse(jsonString);
        if (
          importedHistory &&
          Array.isArray(importedHistory.sessions) &&
          typeof importedHistory.activeSessionId === 'string'
        ) {
          setHistory((prev: ChatHistory) => {
            const existingIds: Set<string> = new Set(prev.sessions.map((s: ChatSession) => s.id));
            const newSessions: ChatSession[] = importedHistory.sessions
              .filter((s: ChatSession) => !existingIds.has(s.id))
              .map((s: ChatSession) => ({
                ...s,
                messages: s.messages.map((m: ChatText) => ({
                  ...m,
                  id: m.id || uuidv4(),
                })),
              }));
            return {
              ...prev,
              sessions: [...prev.sessions, ...newSessions],
              activeSessionId: prev.activeSessionId || importedHistory.activeSessionId,
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
    },
    [t, setHistory]
  );

  const sessionsInGroup: Record<string, ChatSession[]> = useMemo(() => {
    const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'long',
    });
    return sortSessionsByDate(sessions).reduce(
      (acc: Record<string, ChatSession[]>, s: ChatSession) => {
        const date: string = formatter.format(
          new Date(s.messages[s.messages.length - 1]?.date || '')
        );
        if (!acc[date]) acc[date] = [];
        acc[date].push(s);
        return acc;
      },
      {}
    );
  }, [sessions, i18n.language]);

  return (
    <MessageContext.Provider
      value={{
        activeSession,
        sessionsInGroup,
        conversation,
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
        importSessions,
        speechLang,
        setSpeechLang,
        isThinkingEnabled,
        setIsThinkingEnabled,
      }}>
      {children}
    </MessageContext.Provider>
  );
};
