import { STORAGE_KEYS } from '../constants';

/**
 * Local Storage utility class for managing persistent data
 */
class LocalStorageService {
  /**
   * Get item from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if key exists in localStorage
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys from localStorage
   */
  keys(): string[] {
    return Object.keys(localStorage);
  }

  /**
   * Get storage size (approximate)
   */
  getSize(): number {
    let size = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage.getItem(key)?.length || 0;
      }
    }
    return size;
  }
}

export const storage = new LocalStorageService();

// Typed storage helpers for specific data
export const storageHelpers = {
  // User role
  getUserRole: () => storage.get<string>(STORAGE_KEYS.USER_ROLE),
  setUserRole: (role: string) => storage.set(STORAGE_KEYS.USER_ROLE, role),

  // View preset
  getViewPreset: () => storage.get<string>(STORAGE_KEYS.VIEW_PRESET),
  setViewPreset: (preset: string) => storage.set(STORAGE_KEYS.VIEW_PRESET, preset),

  // Date range
  getDateRange: () => storage.get<any>(STORAGE_KEYS.DATE_RANGE),
  setDateRange: (range: any) => storage.set(STORAGE_KEYS.DATE_RANGE, range),

  // Assets
  getAssets: () => storage.get<any[]>(STORAGE_KEYS.ASSETS) || [],
  setAssets: (assets: any[]) => storage.set(STORAGE_KEYS.ASSETS, assets),

  // Content items
  getContentItems: () => storage.get<any[]>(STORAGE_KEYS.CONTENT_ITEMS) || [],
  setContentItems: (items: any[]) => storage.set(STORAGE_KEYS.CONTENT_ITEMS, items),

  // Leads
  getLeads: () => storage.get<any[]>(STORAGE_KEYS.LEADS) || [],
  setLeads: (leads: any[]) => storage.set(STORAGE_KEYS.LEADS, leads),

  // Transactions
  getTransactions: () => storage.get<any[]>(STORAGE_KEYS.TRANSACTIONS) || [],
  setTransactions: (transactions: any[]) => storage.set(STORAGE_KEYS.TRANSACTIONS, transactions),

  // Payouts
  getPayouts: () => storage.get<any[]>(STORAGE_KEYS.PAYOUTS) || [],
  setPayouts: (payouts: any[]) => storage.set(STORAGE_KEYS.PAYOUTS, payouts),

  // Notifications
  getNotifications: () => storage.get<any[]>(STORAGE_KEYS.NOTIFICATIONS) || [],
  setNotifications: (notifications: any[]) => storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications),

  // Disputes
  getDisputes: () => storage.get<any[]>(STORAGE_KEYS.DISPUTES) || [],
  setDisputes: (disputes: any[]) => storage.set(STORAGE_KEYS.DISPUTES, disputes),

  // User profile
  getUserProfile: () => storage.get<any>(STORAGE_KEYS.USER_PROFILE),
  setUserProfile: (profile: any) => storage.set(STORAGE_KEYS.USER_PROFILE, profile),

  // Dev mode
  getDevMode: () => storage.get<boolean>(STORAGE_KEYS.DEV_MODE) || false,
  setDevMode: (enabled: boolean) => storage.set(STORAGE_KEYS.DEV_MODE, enabled),
};
