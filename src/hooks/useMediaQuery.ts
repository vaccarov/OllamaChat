'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQueryList: MediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);
    const listener = (event: MediaQueryListEvent): void => setMatches(event.matches);
    mediaQueryList.addEventListener('change', listener);
    return (): void => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
