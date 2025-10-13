import ChatBubble from '@/components/ChatBubble';
import { SCROLL_TOLERANCE } from '@/constants/list';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import { ModalContext, SettingsContextDefinition } from '@/context/ModalContextDefinition';
import { ChatSession, ModelContextDefinition } from '@/types';
import { ChatText } from '@/types/ChatText';
import { ActionIcon } from '@mantine/core';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Settings } from 'react-feather';
import { useTranslation } from 'react-i18next';
import './Chat.css';

export const Chat: React.FC = (): React.ReactElement | null => {
  const { t } = useTranslation();
  const { activeSession }: { activeSession: ChatSession | undefined } = useContext(MessageContext)!;
  const { models }: ModelContextDefinition = useContext(ModelContext)!;
  const { setIsSettingsOpen }: SettingsContextDefinition = useContext(ModalContext)!;
  const chatRef: React.RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [showTopArrow, setShowTopArrow] = useState<boolean>(false);

  const scrollToBottom = useCallback((): void => {
    const el: HTMLDivElement | null = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);

  const scrollToTop = useCallback((): void => {
    if (chatRef.current) chatRef.current.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const el: HTMLDivElement | null = chatRef.current;
    if (!el) return;
    const handleScroll = (): void => {
      const isScrolledToBottom: boolean = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_TOLERANCE;
      setIsAtBottom(isScrolledToBottom);
      setShowTopArrow(el.scrollTop > SCROLL_TOLERANCE);
    };
    el.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, [activeSession?.id]);

  useEffect(() => {
    if (isAtBottom) scrollToBottom();
  }, [activeSession?.messages, isAtBottom, scrollToBottom]);

  useEffect(() => scrollToBottom(), [activeSession?.id, scrollToBottom]);

  return (
    <div className='chatContainer'>
      {showTopArrow && (
        <ActionIcon
          onClick={scrollToTop}
          className='up'>
          <ChevronUp />
        </ActionIcon>
      )}
      {!isAtBottom && (
        <ActionIcon
          onClick={scrollToBottom}
          className='down'>
          <ChevronDown />
        </ActionIcon>
      )}
      <div
        className='chat'
        ref={chatRef}>
        {!models || models.length === 0 ? (
          <div className='emptyChatMessage'>
            <p>{t('chat.no_models_setup_message')}</p>
            <ActionIcon onClick={() => setIsSettingsOpen(true)}>
              <Settings />
            </ActionIcon>
          </div>
        ) : activeSession?.messages && activeSession.messages.length > 1 ? (
          activeSession?.messages.slice(1).map((msg: ChatText, i: number) => (
            <ChatBubble
              message={msg}
              key={i}
            />
          ))
        ) : (
          <div className='emptyChatMessage'>
            <p>{t('chat.empty_chat_invitation')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
