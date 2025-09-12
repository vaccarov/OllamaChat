import ChatBubble from "@/components/ChatBubble";
import { SCROLL_TOLERANCE, TOP_ARROW_THRESHOLD } from "@/constants/list";
import { MessageContext } from "@/context/MessageContextDefinition";
import { ChatSession } from "@/types/ChatSession";
import { ChatText } from "@/types/ChatText";
import { ActionIcon } from "@mantine/core";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import { useTranslation } from "react-i18next";
import "./Chat.css";

export const Chat: React.FC = (): React.ReactElement | null => {
  const { t } = useTranslation();
  const { activeSession }: { activeSession: ChatSession | undefined } = useContext(MessageContext)!;
  const chatRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [showTopArrow, setShowTopArrow] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  const scrollToBottom = (): void => {
    const el: HTMLDivElement | null = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  const scrollToTop = (): void => {
    if (chatRef.current) chatRef.current.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    setIsClient(true);
    const el: HTMLDivElement | null = chatRef.current;
    if (!el) return;
    const handleScroll = (): void => {
      const isScrolledToBottom: boolean = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_TOLERANCE;
      setIsAtBottom(isScrolledToBottom);
      setShowTopArrow(el.scrollTop > TOP_ARROW_THRESHOLD);
    };
    el.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottom) scrollToBottom();
  }, [activeSession?.messages, isAtBottom]);

  useEffect(() => scrollToBottom(), [activeSession?.id]);

  return !isClient ? null : (
    <div className="chatContainer">
      {showTopArrow && (
        <ActionIcon onClick={scrollToTop} className="up">
          <ChevronUp />
        </ActionIcon>
      )}
      {!isAtBottom && (
        <ActionIcon onClick={scrollToBottom} className="down">
          <ChevronDown />
        </ActionIcon>
      )}
      <div className="chat" ref={chatRef}>
        {
          activeSession?.messages && activeSession.messages.length > 1
            ? activeSession?.messages
              .slice(1)
              .map((msg: ChatText, i: number) => <ChatBubble message={msg} key={i} />)
            : <div className="emptyChatMessage">
              <p>{t('chat.empty_chat_invitation')}</p>
            </div>
        }
      </div>
    </div>
  );
};
