import { ModelContext } from '@/context/ModelContextDefinition';
import { ModelContextDefinition } from '@/types';
import { ApiStatus } from '@/types/api';
import { removeTrailingSlash } from '@/utils/tools';
import { Anchor, Code, List, Text, TextInput, Title } from '@mantine/core';
import { TFunction } from 'i18next';
import { ChangeEvent, ReactElement, useContext } from 'react';
import { CheckCircle, Loader, XCircle } from 'react-feather';
import { Trans, useTranslation } from 'react-i18next';
import './SettingsModal.css';

export function ServerSettings(): ReactElement {
  const { t }: { t: TFunction } = useTranslation();
  const modelContext: ModelContextDefinition | undefined = useContext(ModelContext);
  if (!modelContext) throw new Error('ServerSettings must be used within a ModelProvider');
  const { ollamaServerUrl, setOllamaServerUrl, chatServerUrl, setChatServerUrl, ollamaServerStatus, transcribeServerStatus }: ModelContextDefinition = modelContext;

  return (
    <div className='settingsContainer'>
      <TextInput
        label={t('settings.ollama_url')}
        value={ollamaServerUrl}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setOllamaServerUrl(removeTrailingSlash(event.currentTarget.value))}
        rightSection={<StatusIcon status={ollamaServerStatus} />}
      />
      <TextInput
        label={t('settings.transcribe_url')}
        value={chatServerUrl}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setChatServerUrl(removeTrailingSlash(event.currentTarget.value))}
        rightSection={<StatusIcon status={transcribeServerStatus} />}
      />
      <div style={{ marginTop: 'var(--mantine-spacing-lg)' }}>
        <Title order={4}>{t('settings.urls.title')}</Title>
        <Text
          component='div'
          mt='sm'>
          <Trans
            i18nKey='settings.urls.intro1'
            components={{ 1: <Code />, 2: <Code />, 3: <Code /> }}
          />
        </Text>
        <Text mt='xs'>{t('settings.urls.intro2')}</Text>
        <List
          withPadding
          mt='sm'>
          <List.Item>
            <Trans
              i18nKey='settings.urls.solution1'
              components={{ 1: <Code /> }}
            />
          </List.Item>
          <List.Item>
            <Trans
              i18nKey='settings.urls.solution2'
              components={{ 1: <Code />, 2: <Code /> }}
            />
          </List.Item>
        </List>
        <Title
          order={5}
          mt='md'>
          {t('settings.urls.step1Title')}
        </Title>
        <Text
          component='div'
          mt='xs'>
          <Trans
            i18nKey='settings.urls.step1Text'
            components={{
              1: (
                <Anchor
                  href='https://tailscale.com/download'
                  target='_blank'
                  rel='noopener noreferrer'
                />
              ),
              2: <Code />,
              3: <Code />,
            }}
          />
        </Text>
        <Title
          order={5}
          mt='md'>
          {t('settings.urls.step2Title')}
        </Title>
        <Text
          component='div'
          mt='xs'>
          <Trans
            i18nKey='settings.urls.step2Text'
            components={{
              1: (
                <Anchor
                  href='https://caddyserver.com/docs/install'
                  target='_blank'
                  rel='noopener noreferrer'
                />
              ),
              2: <Code />,
            }}
          />
        </Text>
        <Code
          block
          mt='xs'>
          {`YOUR_PRIVATE_URL.ts.net {
  tls internal
  handle_path /ollama* {
    reverse_proxy localhost:11434
  }
  handle_path /audio* {
    reverse_proxy localhost:8000
  }
}`}
        </Code>
        <Text
          component='div'
          mt='xs'>
          <Trans
            i18nKey='settings.urls.step2Subtext'
            components={{ 1: <Code />, 2: <Code /> }}
          />
        </Text>
        <Title
          order={5}
          mt='md'>
          {t('settings.urls.step3Title')}
        </Title>
        <Text
          component='div'
          mt='xs'>
          <Trans
            i18nKey='settings.urls.step3Text'
            components={{ 1: <Code /> }}
          />
        </Text>
        <Anchor
          href='https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server'
          target='_blank'
          rel='noopener noreferrer'
          size='sm'
          mt='xs'>
          {t('settings.urls.step3Link')}
        </Anchor>
        <List
          withPadding
          mt='sm'>
          <List.Item>
            <Trans
              i18nKey='settings.urls.step3Var1'
              components={{ 1: <Code />, 2: <Code /> }}
            />
          </List.Item>
          <List.Item>
            <Trans
              i18nKey='settings.urls.step3Var2'
              values={{ url: window.location.href }}
              components={{ 1: <Code /> }}
            />
          </List.Item>
        </List>
        <Title
          order={5}
          mt='md'>
          <Trans
            i18nKey='settings.urls.step4Title'
            components={{ 1: <Code /> }}
          />
        </Title>
        <List
          withPadding
          mt='sm'>
          <List.Item>
            <Trans
              i18nKey='settings.urls.step4Url1'
              components={{ 1: <Code />, 2: <Code /> }}
            />
          </List.Item>
          <List.Item>
            <Trans
              i18nKey='settings.urls.step4Url2'
              components={{ 1: <Code />, 2: <Code /> }}
            />
          </List.Item>
        </List>
      </div>
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
