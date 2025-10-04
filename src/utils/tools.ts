import { ChatSession } from '@/types';

export const formatSize = (bytes: number): string => {
  const units: string[] = ['octets', 'Ko', 'Mo', 'Go', 'To'];
  let i: number = 0;
  let size: number = bytes;

  // Calculer la taille en fonction des unités
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }

  // Retourner la taille formatée avec 2 décimales
  return `${size.toFixed(2)} ${units[i]}`;
};

export const mapIsoToBcp47 = (isoCode: string): string => {
  switch (isoCode) {
    case 'en':
      return 'en-GB';
    case 'fr':
      return 'fr-FR';
    case 'zh':
      return 'zh-CN';
    case 'ja':
      return 'ja-JP';
    case 'es':
      return 'es-ES';
    case 'de':
      return 'de-DE';
    case 'it':
      return 'it-IT';
    default:
      return 'fr-FR';
  }
};

export const getVisualLineCount = (textarea: HTMLTextAreaElement, text: string): number => {
  if (text === '') return 1;
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!context) return text.split('\n').length; // If context fails, just count lines
  const style: CSSStyleDeclaration = window.getComputedStyle(textarea);
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const padding: number = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const textAreaWidth: number = textarea.clientWidth - padding;
  if (textAreaWidth <= 0) return text.split('\n').length;
  const lines: string[] = text.split('\n');
  let visualLines: number = 0;
  for (const line of lines) {
    if (line === '') {
      visualLines++;
      continue;
    }
    let currentLineText: string = '';
    const words: string[] = line.split(' ');
    for (let i: number = 0; i < words.length; i++) {
      const word: string = words[i]!;
      const testLine: string = currentLineText + (currentLineText ? ' ' : '') + word;
      const metrics: TextMetrics = context.measureText(testLine);
      if (metrics.width > textAreaWidth && currentLineText !== '') {
        visualLines++;
        currentLineText = word;
      } else {
        currentLineText = testLine;
      }
    }
    visualLines++;
  }
  return visualLines;
};

export const getLineNumber = (textarea: HTMLTextAreaElement): number => {
  const textBeforeCursor: string = textarea.value.substring(0, textarea.selectionStart);
  return getVisualLineCount(textarea, textBeforeCursor);
};

export const getTotalLines = (textarea: HTMLTextAreaElement): number => {
  return getVisualLineCount(textarea, textarea.value);
};

export const sortSessionsByDate = (sessions: ChatSession[]): ChatSession[] =>
  [...sessions].sort((a: ChatSession, b: ChatSession) => {
    const dateA: number = new Date(a.messages[a.messages.length - 1]?.date || 0).getTime();
    const dateB: number = new Date(b.messages[b.messages.length - 1]?.date || 0).getTime();
    return dateB - dateA;
  });

export const removeTrailingSlash = (url: string): string => {
  if (typeof url === 'string' && url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url;
};
