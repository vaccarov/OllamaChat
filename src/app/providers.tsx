'use client';

import { theme } from '@/constants/theme';
import { MessageProvider } from '@/context/MessageContext';
import { ModalProvider } from '@/context/ModalContext';
import { ModelProvider } from '@/context/ModelContext';
import { RagProvider } from '@/context/RagProvider';
import '@/i18n';
import { MantineProvider } from '@mantine/core';
import React, { useEffect, useState } from 'react';

export const AppProviders = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => setIsLoaded(true), []);

  return !isLoaded ? (
    <></>
  ) : (
    <MantineProvider
      defaultColorScheme='dark'
      theme={theme}>
      <ModelProvider>
        <MessageProvider>
          <RagProvider>
            <ModalProvider>{children}</ModalProvider>
          </RagProvider>
        </MessageProvider>
      </ModelProvider>
    </MantineProvider>
  );
};
