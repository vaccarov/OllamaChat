import { predefinedSystemPrompts } from '@/constants/systemPrompts';
import { MessageContext } from "@/context/MessageContextDefinition";
import { MessageContextType } from "@/types/MessageContextDefinition";
import { SystemPromptItem } from '@/types/SystemPromptDefinition';
import { ActionIcon, Menu, Textarea } from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import { List } from "react-feather";
import { useTranslation } from "react-i18next";
import "./SystemPrompt.css";

export const SystemPrompt: React.FC = (): React.ReactElement => {
  const { t } = useTranslation();
  const { activeSession, updateSystemPrompt }: MessageContextType = useContext(MessageContext)!;
  const [prompt, setPrompt] = useState<string>("");

  useEffect(() => {
    if (activeSession) {
      setPrompt(activeSession.systemPrompt);
    }
  }, [activeSession]);

  const handlePromptSelect = (value: string) => {
    const selectedPrompt: SystemPromptItem | undefined = predefinedSystemPrompts.find((p: SystemPromptItem) => p.id === value);
    if (selectedPrompt) {
      setPrompt(selectedPrompt.prompt);
      updateSystemPrompt(selectedPrompt.prompt);
    }
  };

  return (
    <Textarea
      className="systemPrompt"
      value={prompt}
      placeholder={t('system_prompt.title')}
      autosize
      maxRows={10}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
        updateSystemPrompt(e.target.value);
      }}
      leftSectionWidth={52}
      leftSection={
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon color='gray'>
              <List />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{t('system_prompt.select')}</Menu.Label>
            {predefinedSystemPrompts.map((p) => (
              <Menu.Item key={p.id} onClick={() => handlePromptSelect(p.id)}>
                {p.name}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      }/>
  );
};