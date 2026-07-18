'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Bubble, RecommendItem } from '@/types';

interface AppState {
  question: string;
  bubbles: Bubble[];
  recommendCache: RecommendItem[] | null;
  selectedCharacterName: string | null;
  isLoading: boolean;
  loadingText: string;
  error: string | null;
}

interface AppContextValue extends AppState {
  setQuestion: (q: string) => void;
  setBubbles: (b: Bubble[]) => void;
  setRecommendCache: (c: RecommendItem[] | null) => void;
  selectCharacter: (name: string) => void;
  clearSelectedCharacter: () => void;
  setLoading: (loading: boolean, text?: string) => void;
  setError: (e: string | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [question, setQuestion] = useState('');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [recommendCache, setRecommendCache] = useState<RecommendItem[] | null>(null);
  const [selectedCharacterName, setSelectedCharacterName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const setLoading = useCallback((loading: boolean, text?: string) => {
    setIsLoading(loading);
    setLoadingText(text || '');
  }, []);

  const selectCharacter = useCallback((name: string) => {
    setSelectedCharacterName(name);
  }, []);

  const clearSelectedCharacter = useCallback(() => {
    setSelectedCharacterName(null);
  }, []);

  const value: AppContextValue = {
    question,
    bubbles,
    recommendCache,
    selectedCharacterName,
    isLoading,
    loadingText,
    error,
    setQuestion,
    setBubbles,
    setRecommendCache,
    selectCharacter,
    clearSelectedCharacter,
    setLoading,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
