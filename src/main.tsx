import App from '@/App.tsx';
import { AppProviders } from '@/context/AppProviders.tsx';
import { themeColors } from '@/constants/theme.ts';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n.ts';
import './index.css';

const setColors = () => {
  document.documentElement.style.setProperty('--maincolor', themeColors.main);
  document.documentElement.style.setProperty('--backcolor', themeColors.back);
  document.documentElement.style.setProperty('--customBubble', themeColors.customBubble);
  document.documentElement.style.setProperty('--userBubble', themeColors.userBubble);
  document.documentElement.style.setProperty('--assistantBubble', themeColors.assistantBubble);
}

setColors();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)