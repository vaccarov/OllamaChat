import { useState, useEffect, useCallback } from 'react';

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

  const handleStorageChange = useCallback((event: StorageEvent): void => {
    if (event.key === key && event.newValue) {
      try {
        setState(JSON.parse(event.newValue));
      } catch (error) {
        console.error(`Error parsing storage value for key "${key}":`, error);
      }
    }
  }, [key]);

  useEffect(() => {
    if (isBrowser) {
      // Handle multi tab sync
      window.addEventListener('storage', handleStorageChange);
      return (): void => window.removeEventListener('storage', handleStorageChange);
    }
  }, [handleStorageChange]);

  return [state, setState];
}

export default usePersistentState;
