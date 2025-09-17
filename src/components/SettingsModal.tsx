import { STORAGE_KEYS } from '@/constants/storageKeys';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import usePersistentState from '@/hooks/usePersistentState';
import { checkOllamaServer, checkTranscribeServer } from '@/services/api';
import { MessageContextType, ModelContextDefinition } from '@/types';
import { ApiStatus } from '@/types/api';
import { Button, Modal, Tabs, TextInput } from '@mantine/core';
import { TFunction } from 'i18next';
import { ChangeEvent, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle, Download, Loader, Upload, XCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './SettingsModal.css';

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SettingsModal({ opened, onClose }: SettingsModalProps): ReactElement {
  const { t }: { t: TFunction } = useTranslation();
  const messageContext: MessageContextType | undefined = useContext(MessageContext);
  const modelContext: ModelContextDefinition | undefined = useContext(ModelContext);
  const fileInputRef: React.RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
  const [ollamaServerStatus, setOllamaServerStatus] = useState<ApiStatus>(ApiStatus.UNKNOWN);
  const [transcribeServerStatus, setTranscribeServerStatus] = useState<ApiStatus>(ApiStatus.UNKNOWN);
  const [ollamaServerUrl, setOllamaServerUrl] = usePersistentState<string>(
    STORAGE_KEYS.ollamaServerUrl,
    `${process.env.NEXT_PUBLIC_HOST}:${process.env.NEXT_PUBLIC_OLLAMA_PORT}`
  );
  const [transcribeServerUrl, setTranscribeServerUrl] = usePersistentState<string>(
    STORAGE_KEYS.transcribeServerUrl,
    `${process.env.NEXT_PUBLIC_SERVER_HOST}:${process.env.NEXT_PUBLIC_SERVER_PORT}`
  );
  if (!messageContext || !modelContext) {
    throw new Error('SettingsModal must be used within all providers');
  }
  const { exportSessions, importSessions } = messageContext;

  useEffect(() => {
    if (opened && ollamaServerUrl) {
      setOllamaServerStatus(ApiStatus.CHECKING);
      const handler: NodeJS.Timeout = setTimeout(() => {
        checkOllamaServer(ollamaServerUrl).then((result: { success: boolean }) => {
          if (result.success) {
            setOllamaServerStatus(ApiStatus.VALID);
            modelContext.refreshModels();
          } else {
            setOllamaServerStatus(ApiStatus.INVALID);
          }
        });
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [opened, ollamaServerUrl, modelContext.refreshModels]);

  useEffect(() => {
    if (opened && transcribeServerUrl) {
      setTranscribeServerStatus(ApiStatus.CHECKING);
      const handler: NodeJS.Timeout = setTimeout(() => {
        checkTranscribeServer(transcribeServerUrl).then((result: { success: boolean }) => {
          setTranscribeServerStatus(result.success ? ApiStatus.VALID : ApiStatus.INVALID);
        });
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [opened, transcribeServerUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file: File | undefined = event.target.files?.[0];
    if (file) {
      const reader: FileReader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        const content: string | ArrayBuffer | null | undefined = e.target?.result;
        if (typeof content === 'string' && importSessions) {
          importSessions(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderStatusIcon = (serverStatus: ApiStatus): ReactElement | null => {
    switch (serverStatus) {
      case ApiStatus.VALID:
        return <CheckCircle color="green" />;
      case ApiStatus.INVALID:
        return <XCircle color="red" />;
      case ApiStatus.CHECKING:
        return <Loader className="spin-animation" />;
      default:
        return null;
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={t('settings.title')} size="lg">
      <Tabs defaultValue="servers">
        <Tabs.List>
          <Tabs.Tab value="servers">{t('settings.tabs.servers')}</Tabs.Tab>
          <Tabs.Tab value="language">{t('settings.tabs.language')}</Tabs.Tab>
          <Tabs.Tab value="data">{t('settings.tabs.data')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="servers" pt="md">
          <TextInput
            label={t('settings.ollama_url')}
            value={ollamaServerUrl}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setOllamaServerUrl(event.currentTarget.value)}
            rightSection={renderStatusIcon(ollamaServerStatus)}
          />
          <TextInput
            label={t('settings.transcribe_url')}
            value={transcribeServerUrl}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setTranscribeServerUrl(event.currentTarget.value)}
            rightSection={renderStatusIcon(transcribeServerStatus)}
            mt="md"
          />
        </Tabs.Panel>

        <Tabs.Panel value="language" pt="md">
          <LanguageSwitcher />
        </Tabs.Panel>

        <Tabs.Panel value="data" pt="md">
          <div className="importExport">
            <Button
              onClick={() => exportSessions && exportSessions()}
              variant="light"
              leftSection={<Download size={16} />}>
              {t('chat.export')}
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="light"
              leftSection={<Upload size={16} />}>
              {t('chat.import')}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className='hidden'
              accept=".json"
              onChange={handleFileChange}
            />
          </div>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}