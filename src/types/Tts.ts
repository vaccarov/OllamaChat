import React from 'react';

export interface UseTtsReturn {
  isTtsEnabled: boolean;
  setIsTtsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isSpeaking: boolean;
  speak: (text: string, lang: string) => void;
  cancel: () => void;
}
