import { Modal, Tabs } from '@mantine/core';
import { TFunction } from 'i18next';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { DataSettings } from './DataSettings';
import { LanguageSettings } from './LanguageSettings';
import { ServerSettings } from './ServerSettings';

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SettingsModal({ opened, onClose }: SettingsModalProps): ReactElement {
  const { t }: { t: TFunction } = useTranslation();

  return (
    <Modal opened={opened} onClose={onClose} title={t('settings.title')} size='xl'>
      <Tabs defaultValue='servers'>
        <Tabs.List>
          <Tabs.Tab value='servers'>{t('settings.tabs.servers')}</Tabs.Tab>
          <Tabs.Tab value='language'>{t('settings.tabs.language')}</Tabs.Tab>
          <Tabs.Tab value='data'>{t('settings.tabs.data')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='servers' pt='md'>
          <ServerSettings />
        </Tabs.Panel>

        <Tabs.Panel value='language' pt='md'>
          <LanguageSettings />
        </Tabs.Panel>

        <Tabs.Panel value='data' pt='md'>
          <DataSettings />
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}