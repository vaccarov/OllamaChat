import { MessageContext, MessageContextType } from "@/context/MessageContextDefinition";
import { ActionIcon, Textarea } from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import { Edit } from "react-feather";
import { useTranslation } from "react-i18next";
import "./Systemprompt.css";

export const SystemPrompt: React.FC = (): React.ReactElement => {
  const { t } = useTranslation();
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
        maxRows={2}/>
        <ActionIcon
          color={'var(--maincolor)'} 
          variant="light"
          onClick={handleUpdate}
          title={t('system_prompt.update')}>
          <Edit size={14} />
        </ActionIcon>
    </div>
  );
};