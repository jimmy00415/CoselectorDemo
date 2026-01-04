import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionDenialMessage,
} from '../services/permissions';

/**
 * Hook to check permissions for the current user
 */
export function usePermission() {
  const { role } = useAuth();

  return useMemo(
    () => ({
      /**
       * Check if user has a specific permission
       */
      can: (permission: Permission): boolean => {
        return hasPermission(role, permission);
      },

      /**
       * Check if user has any of the specified permissions
       */
      canAny: (permissions: Permission[]): boolean => {
        return hasAnyPermission(role, permissions);
      },

      /**
       * Check if user has all of the specified permissions
       */
      canAll: (permissions: Permission[]): boolean => {
        return hasAllPermissions(role, permissions);
      },

      /**
       * Check if user does NOT have a permission
       */
      cannot: (permission: Permission): boolean => {
        return !hasPermission(role, permission);
      },

      /**
       * Get denial message for a permission
       */
      denialMessage: (permission: Permission): string => {
        return getPermissionDenialMessage(permission);
      },
    }),
    [role]
  );
}

/**
 * Hook to require a permission - throws error if user doesn't have it
 */
export function useRequirePermission(permission: Permission): void {
  const { can, denialMessage } = usePermission();

  if (!can(permission)) {
    throw new Error(denialMessage(permission));
  }
}

/**
 * Hook to check if user has any of the required permissions
 */
export function useRequireAnyPermission(permissions: Permission[]): void {
  const { canAny } = usePermission();

  if (!canAny(permissions)) {
    throw new Error('You do not have permission to access this resource');
  }
}

/**
 * Hook to check if user has all of the required permissions
 */
export function useRequireAllPermissions(permissions: Permission[]): void {
  const { canAll } = usePermission();

  if (!canAll(permissions)) {
    throw new Error('You do not have all required permissions to access this resource');
  }
}
