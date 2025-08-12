import { MessageProvider } from '@/context/MessageContext';
import { ModelProvider } from '@/context/ModelContext';
import { OllamaProvider } from "@/context/OllamaContext";
import { themeColors } from '@/constants/theme';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

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
