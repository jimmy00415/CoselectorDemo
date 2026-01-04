import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserRole } from '../types/enums';
import { UserProfile } from '../types';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';

/**
 * View Preset types for UI lens switching
 * These are UI filters, not permission roles
 */
export enum ViewPreset {
  OWNER = 'OWNER',       // Focus on ownership & asset management
  OPERATOR = 'OPERATOR', // Focus on operations & conversions
  ANALYST = 'ANALYST',   // Focus on analytics & performance
  FINANCE = 'FINANCE',   // Focus on financial flows & payouts
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  role: UserRole;
  viewPreset: ViewPreset;
}

export interface AuthContextValue extends AuthState {
  login: (user: UserProfile) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void; // For prototype simulation
  setViewPreset: (preset: ViewPreset) => void;
  refreshUser: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Get default view preset for a role
 */
function getDefaultViewPreset(role: UserRole): ViewPreset {
  switch (role) {
    case UserRole.CO_SELECTOR:
      return ViewPreset.OWNER;
    case UserRole.OPS_BD:
      return ViewPreset.OPERATOR;
    case UserRole.FINANCE:
      return ViewPreset.FINANCE;
    default:
      return ViewPreset.OWNER;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Try to restore auth state from localStorage
    const savedUser = storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    const savedRole = storage.get<UserRole>(STORAGE_KEYS.USER_ROLE);
    const savedViewPreset = storage.get<ViewPreset>('viewPreset');
    
    if (savedUser && savedRole) {
      return {
        isAuthenticated: true,
        user: savedUser,
        role: savedRole,
        viewPreset: savedViewPreset || getDefaultViewPreset(savedRole),
      };
    }
    
    // Default to CO_SELECTOR for prototype
    return {
      isAuthenticated: true,
      user: savedUser,
      role: UserRole.CO_SELECTOR,
      viewPreset: ViewPreset.OWNER,
    };
  });

  const login = useCallback((user: UserProfile) => {
    const role = user.role || UserRole.CO_SELECTOR;
    const viewPreset = getDefaultViewPreset(role);
    
    setAuthState({
      isAuthenticated: true,
      user,
      role,
      viewPreset,
    });
    
    // Persist to localStorage
    storage.set(STORAGE_KEYS.USER_PROFILE, user);
    storage.set(STORAGE_KEYS.USER_ROLE, role);
    storage.set('viewPreset', viewPreset);
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: UserRole.CO_SELECTOR,
      viewPreset: ViewPreset.OWNER,
    });
    
    // Clear from localStorage
    storage.remove(STORAGE_KEYS.USER_PROFILE);
    storage.remove(STORAGE_KEYS.USER_ROLE);
    storage.remove('viewPreset');
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const viewPreset = getDefaultViewPreset(role);
    
    setAuthState(prev => ({
      ...prev,
      role,
      viewPreset,
    }));
    
    // Persist to localStorage
    storage.set(STORAGE_KEYS.USER_ROLE, role);
    storage.set('viewPreset', viewPreset);
  }, []);

  const setViewPreset = useCallback((preset: ViewPreset) => {
    setAuthState(prev => ({
      ...prev,
      viewPreset: preset,
    }));
    
    // Persist to localStorage
    storage.set('viewPreset', preset);
  }, []);

  const refreshUser = useCallback(async () => {
    // In prototype, just reload from localStorage
    const savedUser = storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    if (savedUser) {
      setAuthState(prev => ({
        ...prev,
        user: savedUser,
      }));
    }
  }, []);

  const updateUser = useCallback((updatedUser: UserProfile) => {
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
    
    // Persist to localStorage
    storage.set(STORAGE_KEYS.USER_PROFILE, updatedUser);
  }, []);

  // Auto-login for prototype if user profile exists
  useEffect(() => {
    if (!authState.user) {
      const savedUser = storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      if (savedUser) {
        login(savedUser);
      }
    }
  }, [authState.user, login]);

  const value: AuthContextValue = {
    ...authState,
    login,
    logout,
    switchRole,
    setViewPreset,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
