'use client';

import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import { RagContext } from '@/context/RagContextDefinition';
import { useTts } from '@/hooks/useTts';
import { ragChat } from '@/services/document';
import { streamChat } from '@/services/ollama';
import { ChatRole } from '@/types/ChatRoleDefinition';
import { RagChatResponse } from '@/types/document';
import { ImageToSend } from '@/types/ImageToSend';
import { MessageContextType } from '@/types/MessageContextDefinition';
import { mapIsoToBcp47 } from '@/utils/tools';
import { ActionIcon } from '@mantine/core';
import { Message } from 'ollama';
import { ReactElement, useContext, useRef, useState } from 'react';
import { ChevronsDown, ChevronsUp } from 'react-feather';
import { useTranslation } from 'react-i18next';
import './Question.css';
import { QuestionActions } from './QuestionActions';
import { QuestionInput } from './QuestionInput';

export const Question: React.FC = (): ReactElement | null => {
  const { t } = useTranslation();
  const { chatServerUrl, currentModel, ollamaServerUrl } = useContext(ModelContext)!;
  const { conversation, addMessage, addChunk, activeSession, speechLang, isThinkingEnabled }: MessageContextType = useContext(MessageContext)!;
  const { includeAllDocuments, selectedRagModel } = useContext(RagContext)!;
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [image, setImage] = useState<ImageToSend | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [actionsVisible, setActionsVisible] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { speak, cancel } = useTts();
  const stopRequest = (): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    cancel();
    setLoading(false);
  };

  const sendRequest = async (prompt: string): Promise<void> => {
    if (!prompt && !image) return;

    const currentSessionId: string | undefined = activeSession?.id;
    if (!currentSessionId) return;

    setLoading(true);
    let finalPrompt: string = prompt;

    if (selectedRagModel) {
      addMessage(ChatRole.custom, t('question.retrieving_context'));
      try {
        const chatId: string | undefined = includeAllDocuments ? undefined : activeSession?.id;
        const ragResponse: RagChatResponse = await ragChat(chatServerUrl, prompt, selectedRagModel, chatId);
        finalPrompt = ragResponse.prompt;
      } catch (error) {
        console.error('Error during RAG search:', error);
        addMessage(ChatRole.custom, `${t('question.rag_error_prefix')}${(error as Error).message}`);
        setLoading(false);
        return;
      }
    }

    const messagesForApi: Message[] = [
      ...(conversation.current || []),
      {
        role: 'user',
        content: finalPrompt,
        images: image?.data ? [image.data.split(',')[1]] : undefined,
      } as Message,
    ];

    setUserPrompt('');
    addMessage(ChatRole.user, prompt, image, currentSessionId);
    setImage(undefined);

    let sentenceBuffer: string = '';
    const currentSpeechLang: string = mapIsoToBcp47(speechLang);

    addMessage(ChatRole.assistant, '', undefined, currentSessionId);
    abortControllerRef.current = streamChat(
      ollamaServerUrl,
      {
        model: currentModel!.model,
        messages: messagesForApi,
      },
      {
        onChunk: ({ message }: { message: Message }) => {
          addChunk(message, currentSessionId);
          if (!message.content) return;
          sentenceBuffer += message.content;
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
      },
      isThinkingEnabled
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

  return (
    <div className='questionContainer'>
      <ActionIcon
        className='actionIcon'
        onClick={() => setActionsVisible(!actionsVisible)}>
        {actionsVisible ? <ChevronsDown /> : <ChevronsUp />}
      </ActionIcon>
      <QuestionActions
        image={image}
        visible={actionsVisible}
        onImageSelect={setImage}
        onTranscript={handleTranscript}
        setLoading={setLoading}
      />
      <QuestionInput
        userPrompt={userPrompt}
        setUserPrompt={setUserPrompt}
        onSend={() => sendRequest(userPrompt)}
        onStop={stopRequest}
        loading={loading}
        disabled={!(currentModel?.model && userPrompt) && !loading}
      />
    </div>
  );
};
