import { APP_LANGS, SPEECH_LANGS } from '@/constants/langs';
import { MessageContext } from '@/context/MessageContextDefinition';
import { MessageContextType } from '@/types';
import { Select } from '@mantine/core';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import './SettingsModal.css';

export const LanguageSettings = () => {
  const { i18n, t } = useTranslation();
  const { speechLang, setSpeechLang }: MessageContextType = useContext(MessageContext)!;

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className='settingsContainer'>
      <Select
        label={t('common.app_language')}
        className='languagePicker'
        data={APP_LANGS}
        defaultValue={i18n.language}
        onChange={(value: string | null) => value && changeLanguage(value)}
      />
      <Select
        label={t('common.speech_language')}
        className='languagePicker'
        data={SPEECH_LANGS}
        defaultValue={speechLang}
        onChange={(value: string | null) => value && setSpeechLang(value)}
      />
    </div>
  );
};
