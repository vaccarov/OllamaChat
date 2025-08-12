import ChatBubble from "@/components/ChatBubble";
import { SCROLL_ARROW_PADDING } from "@/constants/Constants";
import { MessageContext } from "@/context/MessageContextDefinition";
import { ChatSession } from "@/types/ChatSession";
import { ChatText } from "@/types/ChatText";
import { ActionIcon } from "@mantine/core";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import "./Chat.css";

export const Chat: React.FC = (): React.ReactElement => {
  console.log('OOO Chat');
  const { activeSession }: { activeSession: ChatSession | undefined } = useContext(MessageContext)!;
  const [showTopArrow, setShowTopArrow] = useState<boolean>(false);
  const [showBottomArrow, setShowBottomArrow] = useState<boolean>(true);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatEl: HTMLDivElement = chatRef.current!;
    if (!chatEl) return;
    const handleScroll = (): void => {
      setShowTopArrow(chatEl.scrollTop > SCROLL_ARROW_PADDING);
      setShowBottomArrow(chatEl.scrollTop + chatEl.clientHeight < chatEl.scrollHeight - SCROLL_ARROW_PADDING);
    };
    handleScroll();

    chatEl.addEventListener("scroll", handleScroll);
    return () => chatEl.removeEventListener("scroll", handleScroll);
  }, [activeSession?.messages]);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.id]);

  const scrollToTop = (): void => {
    if (chatRef.current) chatRef.current.scrollTo({ top: 0, behavior: 'instant' });
  };

  const scrollToBottom = (): void => {
    const el: HTMLDivElement | null = chatRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="chatContainer">
      {showTopArrow && (
        <ActionIcon variant="subtle" size="lg" onClick={scrollToTop} className="up">
          <ChevronUp size="lg" />
        </ActionIcon>
      )}
      {showBottomArrow && (
        <ActionIcon variant="subtle" size="lg" onClick={scrollToBottom} className="down">
          <ChevronDown size="lg" />
        </ActionIcon>
      )}
      <div className="chat" ref={chatRef}>
        {
          activeSession?.messages
            ?.slice(1)
            .map((msg: ChatText, i: number) => <ChatBubble message={msg} key={i} />)
        }
      </div>
    </div>
  );
};
