'use client';

import type React from 'react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { systemPromptPresets } from '@/constants/prompts';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ControlledTextarea } from './ControlledTextarea';

export const SystemPrompt: React.FC = (): React.ReactElement | null => {
  const { t } = useTranslation();
  const messageContext = useContext(MessageContext);

  if (!messageContext) return null;

  const { activeSession, updateSystemPrompt } = messageContext;

  return (
    <ControlledTextarea
      value={activeSession?.systemPrompt ?? ''}
      placeholder={t('system_prompt.title')}
      onValueChange={updateSystemPrompt}
      presets={systemPromptPresets}
      presetLabel={t('system_prompt.select')}
      onPresetSelect={(preset) => updateSystemPrompt(preset.prompt)}
    />
  );
};
