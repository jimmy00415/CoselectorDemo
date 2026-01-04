import dayjs from 'dayjs';

/**
 * Format currency value
 */
export const formatCurrency = (value: number, currency: string = 'CNY'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

/**
 * Format datetime to readable string
 */
export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

/**
 * Check if date is within range
 */
export const isDateInRange = (
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  const d = dayjs(date);
  return d.isAfter(dayjs(startDate)) && d.isBefore(dayjs(endDate));
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Calculate conversion rate
 */
export const calculateConversionRate = (
  numerator: number,
  denominator: number
): number => {
  if (denominator === 0) return 0;
  return (numerator / denominator) * 100;
};

/**
 * Export data to CSV
 */
export const exportToCSV = (
  data: Record<string, any>[],
  filename: string = 'export.csv'
): void => {
  if (data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value ?? '');
          return stringValue.includes(',')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if value is empty
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Calculate date range preset
 */
export const getDateRangePreset = (
  preset: 'thisMonth' | 'last30Days' | 'last7Days' | 'today'
): [string, string] => {
  const now = dayjs();
  
  switch (preset) {
    case 'today':
      return [now.startOf('day').toISOString(), now.endOf('day').toISOString()];
    case 'last7Days':
      return [now.subtract(7, 'day').startOf('day').toISOString(), now.endOf('day').toISOString()];
    case 'last30Days':
      return [now.subtract(30, 'day').startOf('day').toISOString(), now.endOf('day').toISOString()];
    case 'thisMonth':
      return [now.startOf('month').toISOString(), now.endOf('month').toISOString()];
    default:
      return [now.startOf('month').toISOString(), now.endOf('month').toISOString()];
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone number (Chinese format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    ACTIVE: 'green',
    INACTIVE: 'default',
    DISABLED: 'default',
    PENDING: 'orange',
    LOCKED: 'blue',
    PAYABLE: 'green',
    PAID: 'green',
    REVERSED: 'red',
    APPROVED: 'green',
    REJECTED: 'red',
    UNDER_REVIEW: 'blue',
    SUBMITTED: 'blue',
    DRAFT: 'default',
    OPEN: 'orange',
    RESOLVED: 'green',
    FAILED: 'red',
  };
  
  return statusColors[status] || 'default';
};

/**
 * Get status text
 */
export const getStatusText = (status: string): string => {
  const statusTexts: Record<string, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    DISABLED: 'Disabled',
    PENDING: 'Pending',
    LOCKED: 'Locked',
    PAYABLE: 'Payable',
    PAID: 'Paid',
    REVERSED: 'Reversed',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    UNDER_REVIEW: 'Under Review',
    SUBMITTED: 'Submitted',
    DRAFT: 'Draft',
    INFO_REQUESTED: 'Info Requested',
    RESUBMITTED: 'Resubmitted',
    OPEN: 'Open',
    WAITING_FOR_RESPONSE: 'Waiting for Response',
    RESOLVED: 'Resolved',
    FAILED: 'Failed',
    REQUESTED: 'Requested',
  };
  
  return statusTexts[status] || status;
};
