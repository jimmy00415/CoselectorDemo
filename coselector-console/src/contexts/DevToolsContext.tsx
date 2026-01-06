import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Developer Tools Context
 * 
 * Design Principles:
 * - Isolated state management (doesn't pollute app state)
 * - Environment guards (only available in development)
 * - Persistent settings (localStorage)
 * - Type-safe API
 * - Performance optimized (lazy loading, memoization)
 */

interface DevToolsState {
  isEnabled: boolean;
  isPanelOpen: boolean;
  autoRefresh: boolean;
  mockDataEnabled: boolean;
  keyboardShortcuts: boolean;
}

interface DevToolsContextValue {
  // State
  state: DevToolsState;
  
  // Panel Control
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  
  // Settings
  setAutoRefresh: (enabled: boolean) => void;
  setMockDataEnabled: (enabled: boolean) => void;
  setKeyboardShortcuts: (enabled: boolean) => void;
  
  // Utilities
  isDevMode: boolean;
  resetSettings: () => void;
}

const DevToolsContext = createContext<DevToolsContextValue | null>(null);

const DEV_TOOLS_STORAGE_KEY = 'coselector_dev_tools_state';
const DEV_MODE_KEY = 'coselector_dev_mode';

// Environment check
const isDevEnvironment = (): boolean => {
  // Check multiple indicators
  const isDev = 
    process.env.NODE_ENV === 'development' ||
    localStorage.getItem(DEV_MODE_KEY) === 'true' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('127.0.0.1');
  
  return isDev;
};

const defaultState: DevToolsState = {
  isEnabled: false,
  isPanelOpen: false,
  autoRefresh: false,
  mockDataEnabled: true,
  keyboardShortcuts: true
};

/**
 * Load persisted dev tools state from localStorage
 */
const loadPersistedState = (): DevToolsState => {
  try {
    const stored = localStorage.getItem(DEV_TOOLS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultState, ...parsed };
    }
  } catch (error) {
    console.error('[DevTools] Failed to load persisted state:', error);
  }
  return defaultState;
};

/**
 * Persist dev tools state to localStorage
 */
const persistState = (state: DevToolsState): void => {
  try {
    localStorage.setItem(DEV_TOOLS_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[DevTools] Failed to persist state:', error);
  }
};

interface DevToolsProviderProps {
  children: React.ReactNode;
  forceEnable?: boolean; // For testing/demo purposes
}

export const DevToolsProvider: React.FC<DevToolsProviderProps> = ({ 
  children, 
  forceEnable = false 
}) => {
  const isDevMode = forceEnable || isDevEnvironment();
  const [state, setState] = useState<DevToolsState>(() => {
    if (!isDevMode) return defaultState;
    return { ...loadPersistedState(), isEnabled: true };
  });

  // Persist state changes
  useEffect(() => {
    if (isDevMode && state.isEnabled) {
      persistState(state);
    }
  }, [state, isDevMode]);

  // Panel Control
  const openPanel = useCallback(() => {
    if (!isDevMode) return;
    setState(prev => ({ ...prev, isPanelOpen: true }));
  }, [isDevMode]);

  const closePanel = useCallback(() => {
    setState(prev => ({ ...prev, isPanelOpen: false }));
  }, []);

  const togglePanel = useCallback(() => {
    if (!isDevMode) return;
    setState(prev => ({ ...prev, isPanelOpen: !prev.isPanelOpen }));
  }, [isDevMode]);

  // Settings
  const setAutoRefresh = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, autoRefresh: enabled }));
  }, []);

  const setMockDataEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, mockDataEnabled: enabled }));
  }, []);

  const setKeyboardShortcuts = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, keyboardShortcuts: enabled }));
  }, []);

  const resetSettings = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(DEV_TOOLS_STORAGE_KEY);
  }, []);

  // Keyboard shortcut listener (Ctrl+Shift+D or Cmd+Shift+D)
  useEffect(() => {
    if (!isDevMode || !state.keyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (modifier && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        togglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevMode, state.keyboardShortcuts, togglePanel]);

  // Log dev tools initialization
  useEffect(() => {
    if (isDevMode && state.isEnabled) {
      // eslint-disable-next-line no-console
      console.log(
        '%c[DevTools] Enabled',
        'background: #1890ff; color: white; padding: 2px 6px; border-radius: 3px;',
        '\nKeyboard shortcut: Ctrl+Shift+D (Cmd+Shift+D on Mac)'
      );
    }
  }, [isDevMode, state.isEnabled]);

  const contextValue: DevToolsContextValue = {
    state,
    openPanel,
    closePanel,
    togglePanel,
    setAutoRefresh,
    setMockDataEnabled,
    setKeyboardShortcuts,
    isDevMode,
    resetSettings
  };

  // Don't provide context if not in dev mode (security guard)
  if (!isDevMode) {
    return <>{children}</>;
  }

  return (
    <DevToolsContext.Provider value={contextValue}>
      {children}
    </DevToolsContext.Provider>
  );
};

/**
 * Hook to access DevTools context
 * 
 * Usage:
 * ```tsx
 * const devTools = useDevTools();
 * if (devTools) {
 *   devTools.openPanel();
 * }
 * ```
 */
export const useDevTools = (): DevToolsContextValue | null => {
  return useContext(DevToolsContext);
};

/**
 * HOC to enable dev mode programmatically
 */
export const enableDevMode = (): void => {
  localStorage.setItem(DEV_MODE_KEY, 'true');
  window.location.reload();
};

/**
 * HOC to disable dev mode
 */
export const disableDevMode = (): void => {
  localStorage.removeItem(DEV_MODE_KEY);
  localStorage.removeItem(DEV_TOOLS_STORAGE_KEY);
  window.location.reload();
};
