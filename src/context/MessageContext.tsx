import { ChatText } from '@/models/ChatText';
import { systemPrompt } from '@/utils/constants';
import { Message } from 'ollama';
import React, { createContext, Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react';

export type DocumentToSend = {
  name: string;
  size: number;
  data: string;
}

export type MessageContextType = {
  messages: ChatText[];
  doc: DocumentToSend | undefined;
  conversation: RefObject<Message[]>;
  setDoc: Dispatch<SetStateAction<DocumentToSend | undefined>>
  setMessages: Dispatch<SetStateAction<ChatText[]>>;
  addMessage: (role: string, content: string) => void;
  addChunk: (chunk: string) => void;
  resetSystemPrompt: (chunk: string) => void;
  collapsibleStates: Map<string | undefined, boolean>;
  toggleCollapsible: (messageDate: string | undefined) => void;
};

export const MessageContext = createContext<MessageContextType | undefined>(undefined);

const message = (role: string, content: string): ChatText =>
  ({role, content, date: new Date().toISOString()});

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const conversation = useRef<Message[]>([]);
  const [messages, setMessages] = useState<ChatText[]>([message('system', systemPrompt)]);
  const [doc, setDoc] = useState<DocumentToSend | undefined>();

  useEffect(() => {
    conversation.current = messages
      .filter((m: ChatText) => m.role !== 'custom')
      .map((m: ChatText) => ({role: m.role, content: m.content}));
  }, [messages]);

  const addMessage = (role: string, content: string): void => {
    const newMsg: ChatText = message(role, content);
    setMessages(prevMessages => [...prevMessages, newMsg]);
  };

  const addChunk = (chunk: string): void => {
    setMessages(prevMessages => {
      const updated: ChatText[] = [...prevMessages];
      if (updated.length > 0) {
        const lastMessage: ChatText = updated[updated.length - 1];
        updated[updated.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + chunk,
        };
      }
      return updated;
    });
  }

  const resetSystemPrompt = (prompt: string): void => {
    setMessages([message('system', prompt)]);
  }

  const [collapsibleStates, setCollapsibleStates] = useState<Map<string | undefined, boolean>>(new Map());

  const toggleCollapsible = (messageDate: string | undefined) => {
    setCollapsibleStates(prevStates => {
      const newStates = new Map(prevStates);
      newStates.set(messageDate, !newStates.get(messageDate));
      return newStates;
    });
  };

  return (
    <MessageContext.Provider value={{
      messages,
      conversation,
      doc,
      setDoc,
      setMessages,
      addMessage,
      addChunk,
      resetSystemPrompt,
      collapsibleStates,
      toggleCollapsible
    }}>
      {children}
    </MessageContext.Provider>
  );
};