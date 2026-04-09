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
  const normalized = url.trim().replace(/\/$/, '');
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

  const syncUrl = useCallback((input: string, setUrl: (u: string) => void) => {
    if (URL_REGEX.test(input)) setUrl(normalizeUrl(input));
  }, []);

  useEffect(() => syncUrl(chatServerUrlInput, setChatServerUrl), [chatServerUrlInput, setChatServerUrl, syncUrl]);
  useEffect(() => syncUrl(serverUrlInput, setServerUrl), [serverUrlInput, setServerUrl, syncUrl]);

  const refreshModels = useCallback(async (): Promise<void> => {
    if (!chatServerUrl) {
      setModels([]);
      setChatServerStatus(ApiStatus.UNKNOWN);
      return;
    }

    setChatServerStatus(ApiStatus.CHECKING);
    const { models: fetched, type } = await listModels(chatServerUrl);
    if (fetched.length > 0) {
      setChatServerStatus(ApiStatus.VALID);
      setServerType(type);
      setEmbeddingModels(fetched.filter((m: LlmModel) => m.show.capabilities?.includes('embedding')).map((m: LlmModel) => ({ value: m.model, label: m.model })));
      setModels(fetched.filter((m: LlmModel) => !m.show.capabilities?.includes('embedding')));
    } else {
      setChatServerStatus(ApiStatus.INVALID);
      setModels([]);
    }
  }, [chatServerUrl]);

  useEffect(() => {
    const t: NodeJS.Timeout = setTimeout(refreshModels, DEBOUNCE_SERVER_URL_MS);
    return () => clearTimeout(t);
  }, [refreshModels]);

  useEffect(() => {
    if (!serverUrl) return;
    setServerStatus(ApiStatus.CHECKING);
    const t: NodeJS.Timeout = setTimeout(() => {
      checkChatServer(serverUrl).then((r: { success: boolean }) => setServerStatus(r.success ? ApiStatus.VALID : ApiStatus.INVALID));
    }, DEBOUNCE_SERVER_URL_MS);
    return () => clearTimeout(t);
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
