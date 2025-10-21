import type { Metadata } from 'next';
import React from 'react';
import '../globals.css';
import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: 'OllamaChat',
  description: 'A chat application using Ollama models',
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
