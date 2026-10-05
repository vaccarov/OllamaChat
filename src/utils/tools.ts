import type { ChatSession } from '@/types';

export const sortSessionsByDate = (sessions: ChatSession[]): ChatSession[] =>
  sessions.toSorted((a: ChatSession, b: ChatSession) => {
    const dateA: number = new Date(a.messages[a.messages.length - 1]?.date || 0).getTime();
    const dateB: number = new Date(b.messages[b.messages.length - 1]?.date || 0).getTime();
    return dateB - dateA;
  });

/** Saves a blob or data URL, then releases it. */
export const downloadFile = (filename: string, href: string): void => {
  const link: HTMLAnchorElement = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (href.startsWith('blob:')) URL.revokeObjectURL(href);
};
