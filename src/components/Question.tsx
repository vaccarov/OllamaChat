'use client';

import ImagePicker from "@/components/ImagePicker";
import AudioRecorder from "@/components/Record";
import { MessageContext } from "@/context/MessageContextDefinition";
import { ModelContext } from "@/context/ModelContextDefinition";
import { useTts } from "@/hooks/useTts";
import { OllamaModel } from "@/types";
import { ChatRole } from "@/types/ChatRoleDefinition";
import { MessageContextType } from "@/types/MessageContextDefinition";
import { getLineNumber, getTotalLines, mapIsoToBcp47 } from "@/utils/tools";
import { ActionIcon, Chip, Menu, Textarea } from "@mantine/core";
import { Message } from "ollama";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import { Loader, MoreVertical, Play, Volume2, VolumeX, X } from "react-feather";
import { useTranslation } from "react-i18next";
import "./Question.css";

export const Question: React.FC = (): ReactElement | null => {
  const { t } = useTranslation();
  const { currentModel }: { currentModel: OllamaModel | undefined } = useContext(ModelContext)!;
  const { conversation, image, addMessage, addChunk, setImage, activeSession }: MessageContextType = useContext(MessageContext)!;
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { isTtsEnabled, setIsTtsEnabled, isSpeaking, speak, cancel } = useTts();
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [promptBeforeNav, setPromptBeforeNav] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => setIsClient(true), []);

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
    let sentenceBuffer: string = "";
    const currentSpeechLang: string = mapIsoToBcp47(localStorage.getItem('speechLang') || 'fr');

    try {
      abortControllerRef.current = new AbortController();
      const response: Response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: currentModel!.model, messages: messagesForApi }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }

      addMessage(ChatRole.assistant, '', undefined, currentSessionId);
      const reader: ReadableStreamDefaultReader<Uint8Array> = response.body.getReader();
      const decoder: TextDecoder = new TextDecoder();
      let buffer: string = '';

      while (true) {
        const { done, value }: ReadableStreamReadResult<Uint8Array> = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines: string[] = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.trim() === '') continue;
          const content: string = JSON.parse(line).message.content;
          addChunk(content, currentSessionId);
          sentenceBuffer += content;

          const sentenceEndIndex: number = sentenceBuffer.search(/[.!?]/);

          if (sentenceEndIndex !== -1) {
            const sentence: string = sentenceBuffer.substring(0, sentenceEndIndex + 1);
            speak(sentence, currentSpeechLang);
            sentenceBuffer = sentenceBuffer.substring(sentenceEndIndex + 1);
          }
        }
      }

      if (sentenceBuffer.trim()) {
        speak(sentenceBuffer, currentSpeechLang);
      }

    } catch (error: unknown) {
      const errorMessage: string = (error as Error).name === 'AbortError'
        ? t('errors.request_aborted')
        : `${t('errors.prefix')}${(error as Error).message || t('errors.unknown')}`;
      addMessage(ChatRole.custom, errorMessage, undefined, currentSessionId);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
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
  }

  return !isClient ? null : (
    <div className="questionContainer">
      <Menu shadow="md">
        <Menu.Target>
          <ActionIcon title={t('menu.options')}>
            <MoreVertical />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <div className="questionMenu">
            <AudioRecorder onTranscript={handleTranscript} setLoading={setLoading} />
            <ActionIcon
              onClick={handleTtsButtonClick}
              title={isTtsEnabled ? (isSpeaking ? t('audio.stop_reading') : t('audio.disable_reading')) : t('audio.enable_reading')}>
              {isTtsEnabled ? <Volume2 /> : <VolumeX />}
            </ActionIcon>
            {currentModel?.show?.capabilities?.includes('vision') && <ImagePicker />}
          </div>
        </Menu.Dropdown>
      </Menu>
      {image && <Chip
        icon={<X size={16} />}
        onClick={() => setImage(undefined)}
        checked={true}>
        {image.name}
      </Chip>}
      <Textarea
        className="questionArea"
        radius='xl'
        placeholder={t('chat.placeholder')}
        value={userPrompt}
        rightSection={
          <ActionIcon
            variant="transparent"
            radius="xl"
            size="lg"
            disabled={!currentModel?.model || !(userPrompt || image) && !loading}
            onClick={() => loading ? stopRequest() : sendRequest(userPrompt)}>
            {loading ? <Loader className="spin-animation" /> : <Play />}
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
