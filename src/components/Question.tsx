import { MessageContext, MessageContextType } from "@/context/MessageContextDefinition";
import { ModelContext, ModelContextType } from "@/context/ModelContextDefinition";
import { useOllama } from "@/hooks/useOllama";
import { useTts } from "@/hooks/useTts";
import { mapIsoToBcp47 } from "@/utils/tools";
import { ActionIcon, Chip, Textarea, Menu } from "@mantine/core";
import { AbortableAsyncIterator, ChatResponse, Message } from "ollama";
import React, { useContext, useState } from "react";
import { Loader, Play, Volume2, VolumeX, X, MoreVertical } from "react-feather";
import { useTranslation } from "react-i18next";
import ImagePicker from "./ImagePicker";
import "./Question.css";
import AudioRecorder from "./Record";

export const Question: React.FC = (): React.ReactElement => {
  const { t } = useTranslation();
  const ollama = useOllama();
  const { currentModel }: ModelContextType = useContext(ModelContext)!;
  const { conversation, image, addMessage, addChunk, setImage, activeSession }: MessageContextType = useContext(MessageContext)!;
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { isTtsEnabled, setIsTtsEnabled, isSpeaking, speak, cancel, start } = useTts();

  const hasVisionCapability = currentModel?.show?.capabilities?.includes('vision');

  const stopRequest = (): void => {
    ollama.abort();
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
    start();

    const currentSessionId = activeSession?.id;

    const messagesForApi: Message[] = [
      ...(conversation.current || []),
      {
        role: 'user',
        content: prompt,
        images: image?.data ? [image.data.split(',')[1]] : undefined,
      } as Message,
    ];

    setUserPrompt('');
    addMessage('user', prompt, image, currentSessionId);
    setImage(undefined);
    setLoading(true);
    let sentenceBuffer: string = "";
    const currentSpeechLang = mapIsoToBcp47(localStorage.getItem('speechLang') || 'fr');

    try {
      const stream: AbortableAsyncIterator<ChatResponse> = await ollama.chat({
        model: currentModel!.model,
        messages: messagesForApi,
        stream: true,
      });

      addMessage('assistant', '', undefined, currentSessionId);
      for await (const part of stream) {
        const chunk: string = part.message.content;
        addChunk(chunk, currentSessionId);
        sentenceBuffer += chunk;

        const sentenceEndIndex: number = sentenceBuffer.search(/[.!?]/);

        if (sentenceEndIndex !== -1) {
          const sentence: string = sentenceBuffer.substring(0, sentenceEndIndex + 1);
          speak(sentence, currentSpeechLang);
          sentenceBuffer = sentenceBuffer.substring(sentenceEndIndex + 1);
        }
      }

      if (sentenceBuffer.trim()) {
        speak(sentenceBuffer, currentSpeechLang);
      }

    } catch (error) {
      const errorMessage: string = (error as Error).name === 'AbortError'
        ? t('errors.request_aborted')
        : `${t('errors.prefix')}${(error as Error).message || t('errors.unknown')}`;
      addMessage('custom', errorMessage, undefined, currentSessionId);
    } finally {
      setLoading(false);
    }
  };

  const handleTranscript = (transcript: string): void => {
    const newPrompt: string = userPrompt ? `${userPrompt} ${transcript}` : transcript;
    setUserPrompt(newPrompt);
    sendRequest(newPrompt);
  };

  return (
    <div className="questionContainer">
      <Menu shadow="md">
        <Menu.Target>
          <ActionIcon variant="subtle" title={t('menu.options')}>
            <MoreVertical color="white" />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <div className="menu-items-horizontal">
            <AudioRecorder onTranscript={handleTranscript} />
            <ActionIcon
              variant="subtle"
              onClick={handleTtsButtonClick}
              title={isTtsEnabled ? (isSpeaking ? t('audio.stop_reading') : t('audio.disable_reading')) : t('audio.enable_reading')}>
              {isTtsEnabled ? <Volume2 color="white" /> : <VolumeX color="white" />}
            </ActionIcon>
            {hasVisionCapability && <ImagePicker />}
          </div>
        </Menu.Dropdown>
      </Menu>

      {image && <Chip
        icon={<X size={16} color="white" />}
        onClick={() => setImage(undefined)}
        checked={true}>
        {image.name}
      </Chip>}
      <Textarea
        className="questionArea"
        placeholder={t('chat.placeholder')}
        value={userPrompt}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setUserPrompt(event.currentTarget.value)}
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendRequest(userPrompt);
          }
        }}
        maxRows={10}
        autosize
      />
      <ActionIcon
        variant="subtle"
        disabled={!currentModel?.model}
        onClick={() => loading ? stopRequest() : sendRequest(userPrompt)}>
        {loading ? <Loader className="spin-animation" color="white" /> : <Play color="white" />}
      </ActionIcon>
    </div>
  );
};
