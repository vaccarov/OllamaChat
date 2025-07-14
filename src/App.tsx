import { Chat } from "@/components/Chat";
import { LLMPicker } from "@/components/LLMPicker";
import { Question } from "@/components/Question";
import { SystemPrompt } from "@/components/SystemPrompt";
import { ActionIcon } from "@mantine/core";
import React, { useState } from "react";
import { Menu, X } from "react-feather";
import "./App.css";
import { ChatList } from "./components/ChatList";

const App: React.FC = (): React.ReactElement => {
  const [showChatList, setShowChatList] = useState<boolean>(true);

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
