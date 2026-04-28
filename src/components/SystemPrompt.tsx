'use client';

import type React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { systemPromptPresets } from '@/constants/prompts';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ControlledTextarea } from './ControlledTextarea';

export const SystemPrompt: React.FC = (): React.ReactElement | null => {
  const { t } = useTranslation();
  const messageContext = useContext(MessageContext);
  const [prompt, setPrompt] = useState<string>('');

  useEffect(() => {
    if (messageContext?.activeSession) {
      setPrompt(messageContext.activeSession.systemPrompt);
    }
  }, [messageContext?.activeSession]);

  if (!messageContext) return null;

  const { updateSystemPrompt } = messageContext;

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    updateSystemPrompt(value);
  };

  return (
    <ControlledTextarea
      value={prompt}
      placeholder={t('system_prompt.title')}
      onValueChange={handlePromptChange}
      presets={systemPromptPresets}
      presetLabel={t('system_prompt.select')}
      onPresetSelect={(preset) => handlePromptChange(preset.prompt)}
    />
  );
};
