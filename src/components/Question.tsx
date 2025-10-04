'use client';

import ImagePicker from '@/components/ImagePicker';
import AudioRecorder from '@/components/Record';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import { useTts } from '@/hooks/useTts';
import { streamChat } from '@/services/ollama';
import { ChatRole } from '@/types/ChatRoleDefinition';
import { ImageToSend } from '@/types/ImageToSend';
import { MessageContextType } from '@/types/MessageContextDefinition';
import { getLineNumber, getTotalLines, mapIsoToBcp47 } from '@/utils/tools';
import { ActionIcon, Chip, Menu, Textarea } from '@mantine/core';
import { Message } from 'ollama';
import { ReactElement, useContext, useRef, useState } from 'react';
import { Loader, MoreVertical, Play, Volume2, VolumeX, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import './Question.css';

export const Question: React.FC = (): ReactElement | null => {
  const { t } = useTranslation();
  const { currentModel, ollamaServerUrl } = useContext(ModelContext)!;
  const { conversation, addMessage, addChunk, activeSession, speechLang }: MessageContextType = useContext(MessageContext)!;
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [image, setImage] = useState<ImageToSend | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const { isTtsEnabled, setIsTtsEnabled, isSpeaking, speak, cancel } = useTts();
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [promptBeforeNav, setPromptBeforeNav] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopRequest = (): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    cancel();
    setLoading(false);
  };

  const handleTtsButtonClick = (): void => {
    setIsTtsEnabled(!isTtsEnabled);
    if (isSpeaking) {
      cancel();
    }
  };

  const sendRequest = async (prompt: string): Promise<void> => {
    if (!prompt && !image) return;

    const currentSessionId: string | undefined = activeSession?.id;

    const messagesForApi: Message[] = [
      ...(conversation.current || []),
      {
        role: 'user',
        content: prompt,
        images: image?.data ? [image.data.split(',')[1]] : undefined,
      } as Message,
    ];

    setUserPrompt('');
    addMessage(ChatRole.user, prompt, image, currentSessionId);
    setImage(undefined);
    setLoading(true);
    let sentenceBuffer: string = '';
    const currentSpeechLang: string = mapIsoToBcp47(speechLang);

    addMessage(ChatRole.assistant, '', undefined, currentSessionId);
    abortControllerRef.current = streamChat(
      ollamaServerUrl,
      { model: currentModel!.model, messages: messagesForApi },
      {
        onChunk: (chunk: string) => {
          addChunk(chunk, currentSessionId);
          sentenceBuffer += chunk;
          const sentenceEndIndex: number = sentenceBuffer.search(/[.!?]/);
          if (sentenceEndIndex !== -1) {
            const sentence: string = sentenceBuffer.substring(0, sentenceEndIndex + 1);
            speak(sentence, currentSpeechLang);
            sentenceBuffer = sentenceBuffer.substring(sentenceEndIndex + 1);
          }
        },
        onComplete: () => {
          if (sentenceBuffer.trim()) {
            speak(sentenceBuffer, currentSpeechLang);
          }
          setLoading(false);
          abortControllerRef.current = null;
        },
        onError: (error: unknown) => {
          const errorMessage: string =
            (error as Error).name === 'AbortError' ? t('errors.request_aborted') : `${t('errors.prefix')}${(error as Error).message || t('errors.unknown')}`;
          addMessage(ChatRole.custom, errorMessage, undefined, currentSessionId);
          setLoading(false);
          abortControllerRef.current = null;
        },
      }
    );
  };

  const handleTranscript = (transcript: string, error: boolean = false): void => {
    const newPrompt: string = userPrompt ? `${userPrompt} ${transcript}` : transcript;
    if (error) {
      setLoading(false);
      addMessage(ChatRole.custom, newPrompt);
      return;
    }
    setUserPrompt(newPrompt);
    sendRequest(newPrompt);
  };

  const onArrowPressed = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const userMessages: Message[] = conversation.current?.filter((c: Message) => c.role === ChatRole.user) || [];
    const textarea: EventTarget & HTMLTextAreaElement = e.currentTarget;
    const currentLine: number = getLineNumber(textarea);
    const totalLines: number = getTotalLines(textarea);

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendRequest(userPrompt);
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
        const newIndex: number = historyIndex + 1;
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
    <div className='questionContainer'>
      {image && (
        <Chip
          icon={
            <X
              size={16}
              onClick={() => setImage(undefined)}
            />
          }
          checked={true}>
          {image.name}
        </Chip>
      )}
      <Textarea
        className='questionArea'
        placeholder={t('chat.placeholder')}
        value={userPrompt}
        leftSection={
          <Menu>
            <Menu.Target>
              <ActionIcon title={t('menu.options')}>
                <MoreVertical />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <div className='questionMenu'>
                <AudioRecorder
                  onTranscript={handleTranscript}
                  setLoading={setLoading}
                />
                <ActionIcon
                  onClick={handleTtsButtonClick}
                  title={isTtsEnabled ? (isSpeaking ? t('audio.stop_reading') : t('audio.disable_reading')) : t('audio.enable_reading')}>
                  {isTtsEnabled ? <Volume2 /> : <VolumeX />}
                </ActionIcon>
                {currentModel?.show?.capabilities?.includes('vision') && <ImagePicker onImageSelect={setImage} />}
              </div>
            </Menu.Dropdown>
          </Menu>
        }
        rightSection={
          <ActionIcon
            disabled={!currentModel?.model || (!(userPrompt || image) && !loading)}
            onClick={() => (loading ? stopRequest() : sendRequest(userPrompt))}>
            {loading ? <Loader className='spin-animation' /> : <Play />}
          </ActionIcon>
        }
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
          setUserPrompt(event.currentTarget.value);
          setHistoryIndex(null);
          setPromptBeforeNav(null);
        }}
        onKeyDown={onArrowPressed}
        maxRows={10}
        autosize
      />
    </div>
  );
};
