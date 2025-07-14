import { MessageContext, MessageContextType } from "@/context/MessageContext";
import { Button, Textarea } from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import { Edit } from "react-feather";
import "./Systemprompt.css";

export const SystemPrompt: React.FC = (): React.ReactElement => {
  console.log('OOO SystemPrompt');
  const { activeSession, updateSystemPrompt }: MessageContextType = useContext(MessageContext)!;
  const [prompt, setPrompt] = useState<string>("");

  useEffect(() => {
    if (activeSession) {
      setPrompt(activeSession.systemPrompt);
    }
  }, [activeSession]);

  const handleUpdate = (): void => {
    if (activeSession) {
      updateSystemPrompt(prompt);
    }
  };

  return (
    <div className="systemPromptContainer">
      <Textarea
        className="systemPrompt"
        value={prompt}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
        autosize
        maxRows={4}/>
        <Button
          variant="light"
          rightSection={<Edit size={14} />}
          onClick={handleUpdate}>
          Update
        </Button>
    </div>
  );
};
