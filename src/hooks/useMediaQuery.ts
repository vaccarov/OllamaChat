'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(): boolean {
  const mediaQuery: string = `(max-width: 768px)`;
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQueryList: MediaQueryList = window.matchMedia(mediaQuery);
    setMatches(mediaQueryList.matches);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [mediaQuery]);

  return matches;
}
