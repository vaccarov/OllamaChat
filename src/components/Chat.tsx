import { MessageContext } from "@/context/MessageContext";
import { ChatText } from "@/models/ChatText";
import { ActionIcon } from "@mantine/core";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "react-feather";
import "./Chat.css";
import ChatBubble from "./ChatBubble";

export const Chat: React.FC = (): React.ReactElement => {
  console.log('OOO Chat');
  const messages: ChatText[] = useContext(MessageContext)!.messages;
  const [showTopArrow, setShowTopArrow] = useState<boolean>(false);
  const [showBottomArrow, setShowBottomArrow] = useState<boolean>(true);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    const chatEl: HTMLDivElement = chatRef.current!;
    if (!chatEl) return;
    const handleScroll = (): void => {
      const { scrollTop, scrollHeight, clientHeight }: { scrollTop: number; scrollHeight: number; clientHeight: number; } = chatEl;
      setShowTopArrow(scrollTop > 0);
      setShowBottomArrow(scrollTop + clientHeight < scrollHeight - 5);
    };
    handleScroll();
    scrollToBottom();

    chatEl.addEventListener("scroll", handleScroll);
    return () => chatEl.removeEventListener("scroll", handleScroll);
  }, [messages]);

  const scrollToTop = (): void => {
    if (chatRef.current) chatRef.current.scrollTop = 0;
  };

  const scrollToBottom = (force: boolean = false): void => {
    const el = chatRef.current;
    if (!el) return;
    const isNearBottom: boolean = el.scrollHeight - el.scrollTop - el.clientHeight < 70;

    if (isNearBottom || force) {
      el.scrollTop = el.scrollHeight;
    }
  };

  return (
    <div className="chatContainer">
      <div className={"arrowsChat"}>
        {showTopArrow && (
          <ActionIcon variant="outline" color="white" onClick={scrollToTop}>
            <ArrowUp />
          </ActionIcon>
        )}
        {showBottomArrow && (
          <ActionIcon variant="outline" color="white" onClick={() => scrollToBottom(true)}>
            <ArrowDown />
          </ActionIcon>
        )}
      </div>
      <div className="chat" ref={chatRef}>
        {messages
        ?.slice(1)
        .map((msg: ChatText, i: number) => 
          <ChatBubble message={msg} key={i} />
        )}
      </div>
    </div>
  );
};
