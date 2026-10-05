import type React from 'react';

export interface UseTtsReturn {
  isTtsEnabled: boolean;
  setIsTtsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isSpeaking: boolean;
  speak: (text: string) => void;
  cancel: () => void;
}
