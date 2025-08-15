import { Chat } from "@/components/Chat";
import { ChatList } from "@/components/ChatList";
import { LLMPicker } from "@/components/LLMPicker";
import { Question } from "@/components/Question";
import { SystemPrompt } from "@/components/SystemPrompt";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ActionIcon } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { Settings, Sidebar } from "react-feather";
import "./App.css";

const App: React.FC = (): React.ReactElement => {
  const [showChatList, setShowChatList] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.showChatList);
    return saved ? JSON.parse(saved) : false;
  });
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const isMobile: boolean = useMediaQuery();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.showChatList, JSON.stringify(showChatList));
  }, [showChatList]);

  // Adapt height for mobile use in browser
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  const toggleChatList = () => {
    setShowChatList(!showChatList);
  };

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

export default App;
