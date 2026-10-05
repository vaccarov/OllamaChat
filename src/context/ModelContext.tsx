'use client';

import type { ComboboxData } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEBOUNCE_SERVER_URL_MS } from '@/constants/list';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { ModelContext } from '@/context/ModelContextDefinition';
import { listModels } from '@/services/llm';
import { checkChatServer } from '@/services/transcribe';
import { ApiStatus, type LlmModel, type LlmProvider } from '@/types';

const normalizeUrl = (url: string): string => {
  if (!url) return '';
  return url.endsWith('/') ? url : `${url}/`;
};

export const ModelProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const [models, setModels] = useState<LlmModel[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<ComboboxData>([]);
  const [currentModel, setCurrentModel] = useState<LlmModel | undefined>();
  const [llmProvider, setLlmProvider] = useState<LlmProvider>('openai');
  const [savedModelName, setSavedModelName] = useLocalStorage<string | null>({
    key: STORAGE_KEYS.selectedModel,
    defaultValue: null,
  });
  // Only the raw value the user typed is persisted; the URL every request uses is derived from it.
  const [chatServerUrlInput, setChatServerUrlInput] = useLocalStorage<string>({
    key: STORAGE_KEYS.chatServerUrl,
    defaultValue: process.env.NEXT_PUBLIC_OLLAMA_URL ?? '',
  });
  const chatServerUrl: string = useMemo(
    () => normalizeUrl(chatServerUrlInput),
    [chatServerUrlInput]
  );
  const [chatServerStatus, setChatServerStatus] = useState<ApiStatus>(ApiStatus.UNKNOWN);

  const [serverUrlInput, setServerUrlInput] = useLocalStorage<string>({
    key: STORAGE_KEYS.serverUrl,
    defaultValue: process.env.NEXT_PUBLIC_SERVER_URL ?? '',
  });
  const serverUrl: string = useMemo(() => normalizeUrl(serverUrlInput), [serverUrlInput]);
  const [serverStatus, setServerStatus] = useState<ApiStatus>(ApiStatus.UNKNOWN);
  const isServerOnline: boolean = useMemo(() => serverStatus === ApiStatus.VALID, [serverStatus]);

  const refreshModels = useCallback(async (): Promise<void> => {
    if (!chatServerUrl) {
      setModels([]);
      setChatServerStatus(ApiStatus.UNKNOWN);
      return;
    }

    setChatServerStatus(ApiStatus.CHECKING);
    const { models: fetched, provider }: { models: LlmModel[]; provider: LlmProvider } =
      await listModels(chatServerUrl);
    setLlmProvider(provider);
    if (fetched.length > 0) {
      setChatServerStatus(ApiStatus.VALID);
      setEmbeddingModels(
        fetched
          .filter((m: LlmModel) => m.show.capabilities?.includes('embedding'))
          .map((m: LlmModel) => ({ value: m.model, label: m.model }))
      );
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
      checkChatServer(serverUrl).then((r: { success: boolean }) =>
        setServerStatus(r.success ? ApiStatus.VALID : ApiStatus.INVALID)
      );
    }, DEBOUNCE_SERVER_URL_MS);
    return () => clearTimeout(t);
  }, [serverUrl]);

  useEffect(() => {
    if (models.length > 0) {
      const savedModel: LlmModel | undefined = models.find(
        (m: LlmModel) => m.model === savedModelName
      );
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
        llmProvider,
        chatServerUrlInput,
        setChatServerUrlInput,
        chatServerStatus,
        serverUrl,
        serverUrlInput,
        setServerUrlInput,
        serverStatus,
        isServerOnline,
      }}>
      {children}
    </ModelContext.Provider>
  );
};
