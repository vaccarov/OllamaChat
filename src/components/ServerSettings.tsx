import { Anchor, Group, Text, TextInput } from '@mantine/core';
import type { TFunction } from 'i18next';
import { type ChangeEvent, type ReactElement, useContext } from 'react';
import { CheckCircle, Loader, XCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ModelContext } from '@/context/ModelContextDefinition';
import { ApiStatus, type ModelContextDefinition } from '@/types';
import './SettingsModal.css';

export function ServerSettings(): ReactElement {
  const { t }: { t: TFunction } = useTranslation();
  const modelContext: ModelContextDefinition | undefined = useContext(ModelContext);
  if (!modelContext) throw new Error('ServerSettings must be used within a ModelProvider');
  const {
    chatServerUrlInput,
    setChatServerUrlInput,
    chatServerStatus,
    serverUrlInput,
    setServerUrlInput,
    serverStatus,
  }: ModelContextDefinition = modelContext;

  return (
    <div className='settingsContainer'>
      <TextInput
        label={t('settings.llm_url')}
        placeholder='http://localhost:11434 or http://localhost:1234/v1'
        value={chatServerUrlInput}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setChatServerUrlInput(event.currentTarget.value)
        }
        rightSection={<StatusIcon status={chatServerStatus} />}
      />
      <TextInput
        label={
          <Group justify='space-between'>
            <Text>{t('settings.server_url')}</Text>
            <Anchor
              href='https://github.com/vaccarov/ChatServer'
              target='_blank'
              rel='noopener noreferrer'
              size='sm'>
              🔗
            </Anchor>
          </Group>
        }
        value={serverUrlInput}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setServerUrlInput(event.currentTarget.value)
        }
        rightSection={<StatusIcon status={serverStatus} />}
      />
    </div>
  );
}

const StatusIcon = ({ status }: { status: ApiStatus }): ReactElement | null => {
  switch (status) {
    case ApiStatus.VALID:
      return <CheckCircle color='green' />;
    case ApiStatus.INVALID:
      return <XCircle color='red' />;
    case ApiStatus.CHECKING:
      return <Loader className='spin-animation' />;
    default:
      return null;
  }
};
