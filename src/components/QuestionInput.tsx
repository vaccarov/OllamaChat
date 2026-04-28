'use client';

import { ActionIcon } from '@mantine/core';
import { type Dispatch, type ReactElement, type SetStateAction, useContext, useState } from 'react';
import { Loader, Play } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ChatRole, type Message, type MessageContextType } from '@/types';
import { getLineNumber, getTotalLines } from '@/utils/tools';
import { ControlledTextarea } from './ControlledTextarea';

interface QuestionInputProps {
  userPrompt: string;
  setUserPrompt: Dispatch<SetStateAction<string>>;
  onSend: (prompt: string) => void;
  onStop: () => void;
  loading: boolean;
  disabled: boolean;
}

export function QuestionInput({
  userPrompt,
  setUserPrompt,
  onSend,
  onStop,
  loading,
  disabled,
}: QuestionInputProps): ReactElement {
  const { t } = useTranslation();
  const { conversation }: MessageContextType = useContext(MessageContext)!;
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [promptBeforeNav, setPromptBeforeNav] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    setUserPrompt(value);
    setHistoryIndex(null);
    setPromptBeforeNav(null);
  };

  const onArrowPressed = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const userMessages: Message[] =
      conversation.current?.filter((c: Message) => c.role === ChatRole.user) || [];
    const textarea = e.currentTarget;
    const currentLine = getLineNumber(textarea);
    const totalLines = getTotalLines(textarea);

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(userPrompt);
      setUserPrompt('');
      setHistoryIndex(null);
      setPromptBeforeNav(null);
    } else if (e.key === 'ArrowUp' && currentLine === 1 && userMessages.length > 0) {
      e.preventDefault();
      let newIndex: number;
      if (historyIndex === null) {
        setPromptBeforeNav(userPrompt);
        newIndex = userMessages.length - 1;
      } else {
        newIndex = Math.max(0, historyIndex - 1);
      }
      setHistoryIndex(newIndex);
      setUserPrompt(userMessages[newIndex]?.content || '');
    } else if (e.key === 'ArrowDown' && currentLine === totalLines) {
      if (historyIndex !== null && historyIndex < userMessages.length - 1) {
        e.preventDefault();
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setUserPrompt(userMessages[newIndex]?.content || '');
      } else if (historyIndex === userMessages.length - 1) {
        e.preventDefault();
        setHistoryIndex(null);
        setUserPrompt(promptBeforeNav || '');
        setPromptBeforeNav(null);
      }
    }
  };

  return (
    <ControlledTextarea
      placeholder={t('chat.placeholder')}
      value={userPrompt}
      rightSection={
        <ActionIcon
          disabled={disabled}
          onClick={() => (loading ? onStop() : onSend(userPrompt))}>
          {loading ? <Loader className='spin-animation' /> : <Play />}
        </ActionIcon>
      }
      onValueChange={handleInputChange}
      onKeyDown={onArrowPressed}
    />
  );
}
