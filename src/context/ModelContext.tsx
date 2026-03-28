'use client';

import { DEBOUNCE_SERVER_URL_MS } from '@/constants/list';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { ModelContext } from '@/context/ModelContextDefinition';
import usePersistentState from '@/hooks/usePersistentState';
import { listModels } from '@/services/llm';
import { checkChatServer } from '@/services/transcribe';
import { LlmModel } from '@/types';
import { ApiStatus } from '@/types/api';
import { ComboboxData } from '@mantine/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const normalizeUrl = (url: string): string => {
  if (!url) return '';
  let normalized = url.trim().replace(/\/$/, '');
  return `${normalized}/`;
};

const URL_REGEX = /\/api\/?$|\/api\/v1\/?$/;

export const ModelProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const [models, setModels] = useState<LlmModel[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<ComboboxData>([]);
  const [currentModel, setCurrentModel] = useState<LlmModel | undefined>();
  const [savedModelName, setSavedModelName] = usePersistentState<string | null>(STORAGE_KEYS.selectedModel, null);
  // chatServerUrl is the LLM server (Ollama/LM Studio)
  const [chatServerUrl, setChatServerUrl] = usePersistentState<string>(STORAGE_KEYS.chatServerUrl, normalizeUrl(process.env.NEXT_PUBLIC_OLLAMA_URL ?? ''));
  const [chatServerUrlInput, setChatServerUrlInput] = usePersistentState<string>(STORAGE_KEYS.chatServerUrlInput, chatServerUrl);
  const [chatServerStatus, setChatServerStatus] = useState<ApiStatus>(ApiStatus.UNKNOWN);
  const [serverType, setServerType] = useState<'ollama' | 'lmstudio'>('ollama');
  const isChatServerOnline: boolean = useMemo(() => chatServerStatus === ApiStatus.VALID, [chatServerStatus]);

  // serverUrl is the Backend server (Transcription/Images)
  const [serverUrl, setServerUrl] = usePersistentState<string>(STORAGE_KEYS.serverUrl, normalizeUrl(process.env.NEXT_PUBLIC_SERVER_URL ?? ''));
  const [serverUrlInput, setServerUrlInput] = usePersistentState<string>(STORAGE_KEYS.serverUrlInput, serverUrl);
  const [serverStatus, setServerStatus] = useState<ApiStatus>(ApiStatus.UNKNOWN);
  const isServerOnline: boolean = useMemo(() => serverStatus === ApiStatus.VALID, [serverStatus]);

  useEffect(() => {
    if (URL_REGEX.test(chatServerUrlInput)) {
      setChatServerUrl(normalizeUrl(chatServerUrlInput));
    }
  }, [chatServerUrlInput, setChatServerUrl]);

  useEffect(() => {
    if (URL_REGEX.test(serverUrlInput)) {
      setServerUrl(normalizeUrl(serverUrlInput));
    }
  }, [serverUrlInput, setServerUrl]);

  const refreshModels = useCallback(async (): Promise<void> => {
    if (!chatServerUrl) {
      setModels([]);
      setChatServerStatus(ApiStatus.UNKNOWN);
      return;
    }

    setChatServerStatus(ApiStatus.CHECKING);
    const result = await listModels(chatServerUrl);
    if (result.models.length > 0) {
      setChatServerStatus(ApiStatus.VALID);
      setServerType(result.type);
      const fetchedModels = result.models;
      setEmbeddingModels(
        fetchedModels
          .filter((m: LlmModel) => m.show.capabilities?.includes('embedding'))
          .map((m: LlmModel) => ({
            value: m.model,
            label: m.model,
          }))
      );
      setModels(fetchedModels.filter((m: LlmModel) => !m.show.capabilities?.includes('embedding')));
    } else {
      setChatServerStatus(ApiStatus.INVALID);
      setModels([]);
    }
  }, [chatServerUrl]);

  useEffect(() => {
    const handler: NodeJS.Timeout = setTimeout(() => {
      refreshModels();
    }, DEBOUNCE_SERVER_URL_MS);
    return () => clearTimeout(handler);
  }, [refreshModels]);

  useEffect(() => {
    if (serverUrl) {
      setServerStatus(ApiStatus.CHECKING);
      const handler: NodeJS.Timeout = setTimeout(() => {
        checkChatServer(serverUrl).then((result: { success: boolean }) => {
          setServerStatus(result.success ? ApiStatus.VALID : ApiStatus.INVALID);
        });
      }, DEBOUNCE_SERVER_URL_MS);
      return () => clearTimeout(handler);
    }
  }, [serverUrl]);

  useEffect(() => {
    if (models.length > 0) {
      const savedModel: LlmModel | undefined = models.find((m: LlmModel) => m.model === savedModelName);
      setCurrentModel(savedModel || models[0]);
    }
  }, [models, savedModelName]);

  const setModel = (model: string): void => {
    const selectedModel: LlmModel | undefined = models.find((m: LlmModel) => m.model === model);
    if (selectedModel) {
      setCurrentModel(selectedModel);
      setSavedModelName(selectedModel.model);
    }
  };

  return (
    <ModelContext.Provider
      value={{
        setModel,
        models,
        embeddingModels,
        currentModel,
        refreshModels,
        chatServerUrl,
        chatServerUrlInput,
        setChatServerUrlInput,
        chatServerStatus,
        isChatServerOnline,
        serverUrl,
        serverUrlInput,
        setServerUrlInput,
        serverStatus,
        serverType,
        isServerOnline,
      }}>
      {children}
    </ModelContext.Provider>
  );
};
