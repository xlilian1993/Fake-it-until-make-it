'use client';

import { useState, useCallback, useEffect } from 'react';

// LocalStorage 读写封装
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStored(JSON.parse(item));
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStored(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      } catch {
        // ignore
      }
      return newValue;
    });
  }, [key]);

  return [stored, setValue] as const;
}
