'use client';

import { MessageProvider } from '@/context/MessageContext';
import { ModelProvider } from '@/context/ModelContext';
import '@/i18n';
import { MantineProvider } from '@mantine/core';
import React from 'react';

export const AppProviders = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  return (
    <MantineProvider
      defaultColorScheme="dark"
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
      <ModelProvider>
        <MessageProvider>
          {children}
        </MessageProvider>
      </ModelProvider>
    </MantineProvider>
  );
};