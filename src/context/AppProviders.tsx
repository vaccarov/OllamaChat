import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { themeColors } from '@/utils/theme.ts';
import { OllamaProvider } from "./OllamaContext";
import { ModelProvider } from './ModelContext';
import { MessageProvider } from './MessageContext';

document.documentElement.style.setProperty('--maincolor', themeColors.main);
document.documentElement.style.setProperty('--backcolor', themeColors.back);

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MantineProvider defaultColorScheme="dark"
      theme={{
        components: {
          ActionIcon: {
            defaultProps: {
              variant: "subtle",
              color: themeColors.main,
            },
          },
        },
      }}>
      <OllamaProvider>
        <MessageProvider>
          <ModelProvider>
            {children}
          </ModelProvider>
        </MessageProvider>
      </OllamaProvider>
    </MantineProvider>
  );
};
