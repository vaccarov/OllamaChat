import { useEffect, useState } from 'react';

const isBrowser: boolean = typeof window !== 'undefined';

function usePersistentState<T>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (!isBrowser) return initialState;
    try {
      const storageValue: string | null = localStorage.getItem(key);
      if (storageValue) return JSON.parse(storageValue);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    return initialState;
  });

  useEffect(() => {
    if (isBrowser) {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;
