import React from "react";
import "./App.css";
import { Chat } from "@/components/Chat";
import { LLMPicker } from "@/components/LLMPicker";
import { Question } from "@/components/Question";
import { SystemPrompt } from "@/components/SystemPrompt";

const App: React.FC = (): React.ReactElement => {
  return (
    <div className="container">
      <LLMPicker />
      <SystemPrompt />
      <Chat />
      <Question />
    </div>
  );
};

export default App;
