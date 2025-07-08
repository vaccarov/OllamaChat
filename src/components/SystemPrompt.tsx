import { MessageContext } from "@/context/MessageContext";
import { Button, Textarea } from "@mantine/core";
import React, { useContext, useState } from "react";
import { Edit } from "react-feather";
import "./Systemprompt.css";

export const SystemPrompt: React.FC = (): React.ReactElement => {
  console.log('OOO SystemPrompt');
  const { messages, resetSystemPrompt } = useContext(MessageContext)!;
  const [prompt, setPrompt] = useState<string>(messages[0].content);

  return (
    <div className="systemPromptContainer">
      <Textarea
        className="systemPrompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        autosize
        maxRows={4}/>
        <Button
          variant="light"
          rightSection={<Edit size={14} />}
          onClick={() => resetSystemPrompt(prompt)}>
          Reset
        </Button>
    </div>
  );
};
