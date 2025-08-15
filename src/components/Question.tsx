import ImagePicker from "@/components/ImagePicker";
import AudioRecorder from "@/components/Record";
import { MessageContext } from "@/context/MessageContextDefinition";
import { ModelContext } from "@/context/ModelContextDefinition";
import { useOllama } from "@/hooks/useOllama";
import { useTts } from "@/hooks/useTts";
import { OllamaModel } from "@/types";
import { ChatRole } from "@/types/ChatRoleDefinition";
import { MessageContextType } from "@/types/MessageContextDefinition";
import { mapIsoToBcp47 } from "@/utils/tools";
import { ActionIcon, Chip, Menu, Textarea } from "@mantine/core";
import { AbortableAsyncIterator, ChatResponse, Message } from "ollama";
import React, { useContext, useState } from "react";
import { Loader, MoreVertical, Play, Volume2, VolumeX, X } from "react-feather";
import { useTranslation } from "react-i18next";
import "./Question.css";

export const Question: React.FC = (): React.ReactElement => {
  const { t } = useTranslation();
  const ollama = useOllama();
  const { currentModel }: { currentModel: OllamaModel | undefined } = useContext(ModelContext)!;
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
    addMessage(ChatRole.user, prompt, image, currentSessionId);
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

      addMessage(ChatRole.assistant, '', undefined, currentSessionId);
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
      addMessage(ChatRole.custom, errorMessage, undefined, currentSessionId);
    } finally {
      setLoading(false);
    }
  };

  const handleTranscript = (transcript: string, error: boolean): void => {
    const newPrompt: string = userPrompt ? `${userPrompt} ${transcript}` : transcript;
    if (error) {
      addMessage(ChatRole.custom, newPrompt);
      return;
    }
    setUserPrompt(newPrompt);
    sendRequest(newPrompt);
  };

  return (
    <div className="questionContainer">
      <Menu shadow="md">
        <Menu.Target>
          <ActionIcon title={t('menu.options')}>
            <MoreVertical />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <div className="questionMenu">
            <AudioRecorder onTranscript={handleTranscript} />
            <ActionIcon
              onClick={handleTtsButtonClick}
              title={isTtsEnabled ? (isSpeaking ? t('audio.stop_reading') : t('audio.disable_reading')) : t('audio.enable_reading')}>
              {isTtsEnabled ? <Volume2 /> : <VolumeX />}
            </ActionIcon>
            {hasVisionCapability && <ImagePicker />}
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
            disabled={!currentModel?.model || !userPrompt && !loading}
            onClick={() => loading ? stopRequest() : sendRequest(userPrompt)}>
            {loading ? <Loader className="spin-animation" /> : <Play />}
          </ActionIcon>
        }
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setUserPrompt(event.currentTarget.value)}
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendRequest(userPrompt);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const lastMessage: string = conversation.current.filter((c: Message) => c.role === ChatRole.user).pop()?.content || '';
            setUserPrompt(lastMessage);
          }
        }}
        maxRows={10}
        autosize
      />
    </div>
  );
};
