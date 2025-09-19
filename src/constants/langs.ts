import { ComboboxData } from "@mantine/core";

export const DEFAULT_SPEECH_LANG: string = 'en';
export const DEFAULT_APP_LANG: string = 'en-GB';

export const APP_LANGS: ComboboxData = [
  { value: 'fr-FR', label: '🇫🇷 Français' },
  { value: 'en-GB', label: '🇬🇧 English' },
];

export const SPEECH_LANGS: ComboboxData = [
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'zh', label: '🇨🇳 中文' },
  { value: 'ja', label: '🇯🇵 日本語' },
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'de', label: '🇩🇪 Deutsch' },
  { value: 'it', label: '🇮🇹 Italiano' },
];