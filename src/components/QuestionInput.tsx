'use client';

import { ActionIcon, Textarea } from '@mantine/core';
import { Loader, Play } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useState, useContext, SetStateAction, Dispatch } from 'react';
import { MessageContext } from '@/context/MessageContextDefinition';
import { getLineNumber, getTotalLines } from '@/utils/tools';
import { Message } from 'ollama';
import { ChatRole } from '@/types/ChatRoleDefinition';
import { MessageContextType } from '@/types';

interface QuestionInputProps {
  userPrompt: string;
  setUserPrompt: Dispatch<SetStateAction<string>>;
  onSend: (prompt: string) => void;
  onStop: () => void;
  loading: boolean;
  disabled: boolean;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({ userPrompt, setUserPrompt, onSend, onStop, loading, disabled }) => {
  const { t } = useTranslation();
  const { conversation }: MessageContextType = useContext(MessageContext)!;
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [promptBeforeNav, setPromptBeforeNav] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserPrompt(event.currentTarget.value);
    setHistoryIndex(null);
    setPromptBeforeNav(null);
  };

  const onArrowPressed = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const userMessages: Message[] = conversation.current?.filter((c: Message) => c.role === ChatRole.user) || [];
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
    <Textarea
      placeholder={t('chat.placeholder')}
      value={userPrompt}
      rightSection={
        <ActionIcon
          disabled={disabled}
          onClick={() => (loading ? onStop() : onSend(userPrompt))}>
          {loading ? <Loader className='spin-animation' /> : <Play />}
        </ActionIcon>
      }
      onChange={handleInputChange}
      onKeyDown={onArrowPressed}
      maxRows={10}
      autosize
    />
  );
};
