import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Query Parameter Value Types
 */
export type QueryParamValue = string | string[] | number | boolean | null | undefined;

/**
 * Query Parameter Configuration
 */
export interface QueryParamConfig {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'date';
  defaultValue?: any;
}

/**
 * useQueryParams Hook
 * 
 * Per Sprint 1 §3.3: Deep Link Rules (URL Share)
 * 
 * Manages URL query parameters for filter state synchronization.
 * Ensures that filter state is:
 * - Reflected in URL (?status=submitted&owner=unassigned)
 * - Shareable (copy link reproduces view)
 * - Persistent (page reload preserves filters)
 * - Browser-friendly (back/forward navigation works)
 * 
 * Key Features:
 * - Type-safe parameter parsing (string, number, boolean, array, date)
 * - Handles empty/null/undefined values correctly
 * - Array support for multi-select filters (status=draft&status=submitted)
 * - Automatic encoding/decoding
 * - No unnecessary re-renders
 * 
 * Edge Cases Handled:
 * - Empty strings → removed from URL
 * - Null/undefined → removed from URL
 * - Empty arrays → removed from URL
 * - Invalid values → fallback to default
 * - Duplicate keys → merged into array
 * - Special characters → properly encoded
 * 
 * Usage:
 * ```tsx
 * const { queryParams, setQueryParam, setMultipleQueryParams, clearQueryParams } = useQueryParams({
 *   status: { key: 'status', type: 'array', defaultValue: [] },
 *   owner: { key: 'owner', type: 'string' },
 *   date_from: { key: 'date_from', type: 'date' },
 * });
 * 
 * // Get value
 * const statusFilter = queryParams.status; // ['SUBMITTED', 'UNDER_REVIEW']
 * 
 * // Set single value
 * setQueryParam('owner', 'john@example.com');
 * 
 * // Set multiple values (batch update)
 * setMultipleQueryParams({ status: ['DRAFT'], owner: null }); // owner removed
 * 
 * // Clear all
 * clearQueryParams();
 * ```
 */
export function useQueryParams<T extends Record<string, QueryParamConfig>>(
  config: T
): {
  queryParams: { [K in keyof T]: any };
  setQueryParam: (key: keyof T, value: QueryParamValue) => void;
  setMultipleQueryParams: (params: Partial<{ [K in keyof T]: QueryParamValue }>) => void;
  clearQueryParams: () => void;
  getQueryParamValue: (key: keyof T) => any;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * Parse query parameter value based on type configuration
   */
  const parseValue = useCallback(
    (key: keyof T, rawValue: string | string[] | null): any => {
      const paramConfig = config[key];
      if (!paramConfig) return rawValue;

      // Handle null/undefined
      if (rawValue === null || rawValue === undefined) {
        return paramConfig.defaultValue;
      }

      switch (paramConfig.type) {
        case 'string':
          return Array.isArray(rawValue) ? rawValue[0] : rawValue;

        case 'number': {
          const numValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
          const parsed = Number(numValue);
          return !isNaN(parsed) ? parsed : paramConfig.defaultValue;
        }

        case 'boolean': {
          const boolValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
          if (boolValue === 'true') return true;
          if (boolValue === 'false') return false;
          return paramConfig.defaultValue ?? false;
        }

        case 'array':
          // Handle both single and multiple values
          if (Array.isArray(rawValue)) {
            return rawValue.length > 0 ? rawValue : paramConfig.defaultValue ?? [];
          }
          return rawValue ? [rawValue] : paramConfig.defaultValue ?? [];

        case 'date': {
          const dateValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
          if (!dateValue) return paramConfig.defaultValue;
          const parsed = new Date(dateValue);
          return !isNaN(parsed.getTime()) ? dateValue : paramConfig.defaultValue;
        }

        default:
          return rawValue;
      }
    },
    [config]
  );

  /**
   * Get all query parameters as typed object
   */
  const queryParams = useMemo(() => {
    const params: any = {};

    Object.keys(config).forEach((key) => {
      const paramConfig = config[key];
      const rawValue = searchParams.getAll(paramConfig.key);

      // If no value in URL, use default
      if (rawValue.length === 0) {
        params[key] = paramConfig.defaultValue;
      } else if (rawValue.length === 1) {
        // Single value
        params[key] = parseValue(key, rawValue[0]);
      } else {
        // Multiple values (array)
        params[key] = parseValue(key, rawValue);
      }
    });

    return params as { [K in keyof T]: any };
  }, [searchParams, config, parseValue]);

  /**
   * Get single query parameter value
   */
  const getQueryParamValue = useCallback(
    (key: keyof T): any => {
      return queryParams[key];
    },
    [queryParams]
  );

  /**
   * Serialize value for URL
   * Returns null if value should be removed from URL
   */
  const serializeValue = useCallback((value: QueryParamValue): string[] | null => {
    // Remove empty/null/undefined values
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      const filtered = value.filter((v) => v !== null && v !== undefined && v !== '');
      return filtered.length > 0 ? filtered.map(String) : null;
    }

    // Handle primitives
    return [String(value)];
  }, []);

  /**
   * Set single query parameter
   * Removes parameter if value is null/undefined/empty
   */
  const setQueryParam = useCallback(
    (key: keyof T, value: QueryParamValue) => {
      const paramConfig = config[key];
      if (!paramConfig) {
        console.warn(`[useQueryParams] Unknown parameter key: ${String(key)}`);
        return;
      }

      setSearchParams((prevParams) => {
        const newParams = new URLSearchParams(prevParams);
        const serialized = serializeValue(value);

        // Remove existing values for this key
        newParams.delete(paramConfig.key);

        // Add new values if not null
        if (serialized !== null) {
          serialized.forEach((v) => newParams.append(paramConfig.key, v));
        }

        return newParams;
      });
    },
    [config, setSearchParams, serializeValue]
  );

  /**
   * Set multiple query parameters at once (batch update)
   * More efficient than calling setQueryParam multiple times
   */
  const setMultipleQueryParams = useCallback(
    (params: Partial<{ [K in keyof T]: QueryParamValue }>) => {
      setSearchParams((prevParams) => {
        const newParams = new URLSearchParams(prevParams);

        Object.entries(params).forEach(([key, value]) => {
          const paramConfig = config[key];
          if (!paramConfig) {
            console.warn(`[useQueryParams] Unknown parameter key: ${key}`);
            return;
          }

          const serialized = serializeValue(value as QueryParamValue);

          // Remove existing values
          newParams.delete(paramConfig.key);

          // Add new values if not null
          if (serialized !== null) {
            serialized.forEach((v) => newParams.append(paramConfig.key, v));
          }
        });

        return newParams;
      });
    },
    [config, setSearchParams, serializeValue]
  );

  /**
   * Clear all configured query parameters
   * Preserves non-configured parameters
   */
  const clearQueryParams = useCallback(() => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);

      // Remove only configured parameters
      Object.values(config).forEach((paramConfig) => {
        newParams.delete(paramConfig.key);
      });

      return newParams;
    });
  }, [config, setSearchParams]);

  return {
    queryParams,
    setQueryParam,
    setMultipleQueryParams,
    clearQueryParams,
    getQueryParamValue,
  };
}

/**
 * Helper: Create query params config from filter definitions
 * 
 * Usage:
 * ```tsx
 * const queryConfig = createQueryParamsConfig({
 *   status: { type: 'array', defaultValue: [] },
 *   owner: { type: 'string' },
 *   date_from: { type: 'date' },
 * });
 * ```
 */
export function createQueryParamsConfig<T extends Record<string, { type: string; defaultValue?: any }>>(
  schema: T
): { [K in keyof T]: QueryParamConfig } {
  const config: any = {};

  Object.entries(schema).forEach(([key, value]) => {
    config[key] = {
      key,
      type: value.type,
      defaultValue: value.defaultValue,
    };
  });

  return config;
}
