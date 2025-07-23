import { themeColors } from '@/utils/theme.ts';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { MessageProvider } from './MessageContext';
import { ModelProvider } from './ModelContext';
import { OllamaProvider } from "./OllamaContext";

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
        <ModelProvider>
          <MessageProvider>
            {children}
          </MessageProvider>
        </ModelProvider>
      </OllamaProvider>
    </MantineProvider>
  );
};
