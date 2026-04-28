'use client';

import type React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { systemPromptPresets } from '@/constants/prompts';
import { MessageContext } from '@/context/MessageContextDefinition';
import type { MessageContextType } from '@/types';
import { ControlledTextarea } from './ControlledTextarea';

export const SystemPrompt: React.FC = (): React.ReactElement => {
  const { t } = useTranslation();
  const { activeSession, updateSystemPrompt }: MessageContextType = useContext(MessageContext)!;
  const [prompt, setPrompt] = useState<string>('');

  useEffect(() => {
    if (activeSession) {
      setPrompt(activeSession.systemPrompt);
    }
  }, [activeSession]);

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
