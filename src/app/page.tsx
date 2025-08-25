'use client';

import { Chat } from "@/components/Chat";
import { ChatList } from "@/components/ChatList";
import { LLMPicker } from "@/components/LLMPicker";
import { Question } from "@/components/Question";
import { SystemPrompt } from "@/components/SystemPrompt";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ActionIcon } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import { Settings, Sidebar } from "react-feather";

const HomePage: React.FC = (): React.ReactElement => {
  const [showChatList, setShowChatList] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const isMobile: boolean = useMediaQuery();
  const isInitialMount: React.MutableRefObject<boolean> = useRef(true);

  useEffect(() => {
    const saved: string | null = localStorage.getItem(STORAGE_KEYS.showChatList);
    if (saved) {
      setShowChatList(JSON.parse(saved));
    }
    const setAppHeight = (): void => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      localStorage.setItem(STORAGE_KEYS.showChatList, JSON.stringify(showChatList));
    }
  }, [showChatList]);

  const toggleChatList = (): void => setShowChatList(!showChatList);

  return (
    <div className="appContainer">
      <ChatList show={showChatList} />
      <div className={`mainPanel ${showChatList && 'shifted'}`}>
        {isMobile && showChatList && <div className="backdrop" onClick={toggleChatList}></div>}
        <div className='header'>
          <ActionIcon onClick={toggleChatList}>
            <Sidebar />
          </ActionIcon>
          <ActionIcon onClick={() => setShowSettings(!showSettings)}>
            <Settings />
          </ActionIcon>
        </div>
        {showSettings && (
          <div className="settingsContainer">
            <LLMPicker />
            <SystemPrompt />
          </div>
        )}
        <Chat />
        <Question />
      </div>
    </div>
  );
};

export default HomePage;