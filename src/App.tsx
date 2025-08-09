import { Chat } from "@/components/Chat";
import { LLMPicker } from "@/components/LLMPicker";
import { Question } from "@/components/Question";
import { SystemPrompt } from "@/components/SystemPrompt";
import { ActionIcon } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { Menu, X } from "react-feather";
import "./App.css";
import { ChatList } from "./components/ChatList";

const App: React.FC = (): React.ReactElement => {
  const [showChatList, setShowChatList] = useState<boolean>(() => {
    const saved = localStorage.getItem('showChatList');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('showChatList', JSON.stringify(showChatList));
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
      {showChatList && <ChatList />}
      <div className="mainPanel">
        <div className="header">
          <ActionIcon onClick={toggleChatList} variant="subtle" size="lg">
            {showChatList ? <X /> : <Menu />}
          </ActionIcon>
          <LLMPicker />
        </div>
        <SystemPrompt />
        <Chat />
        <Question />
      </div>
    </div>
  );
};

export default App;
