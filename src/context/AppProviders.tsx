import { MessageProvider } from '@/context/MessageContext';
import { ModelProvider } from '@/context/ModelContext';
import { OllamaProvider } from "@/context/OllamaContext";
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
              color: 'white',
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
