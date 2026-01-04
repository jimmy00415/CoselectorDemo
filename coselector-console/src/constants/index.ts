import { UserRole, ViewPreset } from '../types/enums';

// Route paths
export const ROUTES = {
  HOME: '/',
  LINKS: '/links',
  LINK_DETAIL: '/links/:id',
  CONTENT: '/content',
  CONTENT_DETAIL: '/content/:id',
  LEADS: '/leads',
  LEAD_DETAIL: '/leads/:id',
  EARNINGS: '/earnings',
  EARNINGS_TRANSACTIONS: '/earnings/transactions',
  EARNINGS_PAYOUTS: '/earnings/payouts',
  EARNINGS_STATEMENTS: '/earnings/statements',
  INBOX: '/inbox',
  PROFILE: '/profile',
  PROFILE_KYC: '/profile/kyc',
  PROFILE_PAYOUT: '/profile/payout',
  PROFILE_TAX: '/profile/tax',
  PROFILE_COMPLIANCE: '/profile/compliance',
  PROFILE_RULEBOOK: '/profile/rulebook',
  HELP: '/help',
  GLOSSARY: '/glossary',
} as const;

// Navigation menu items
export const NAV_ITEMS = [
  {
    key: 'home',
    label: 'Home',
    path: ROUTES.HOME,
    icon: 'HomeOutlined',
  },
  {
    key: 'links',
    label: 'Links',
    path: ROUTES.LINKS,
    icon: 'LinkOutlined',
  },
  {
    key: 'content',
    label: 'Content',
    path: ROUTES.CONTENT,
    icon: 'FileTextOutlined',
  },
  {
    key: 'leads',
    label: 'Co-selection',
    path: ROUTES.LEADS,
    icon: 'TeamOutlined',
  },
  {
    key: 'earnings',
    label: 'Earnings',
    path: ROUTES.EARNINGS,
    icon: 'DollarOutlined',
  },
  {
    key: 'inbox',
    label: 'Inbox',
    path: ROUTES.INBOX,
    icon: 'InboxOutlined',
  },
  {
    key: 'profile',
    label: 'Profile & Compliance',
    path: ROUTES.PROFILE,
    icon: 'UserOutlined',
  },
];

// Date range presets
export const DATE_RANGE_PRESETS = {
  THIS_MONTH: 'thisMonth',
  LAST_30_DAYS: 'last30Days',
  CUSTOM: 'custom',
} as const;

// Table page size options
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Default page size
export const DEFAULT_PAGE_SIZE = 20;

// Local storage keys
export const STORAGE_KEYS = {
  USER_ROLE: 'coselector_user_role',
  VIEW_PRESET: 'coselector_view_preset',
  DATE_RANGE: 'coselector_date_range',
  ASSETS: 'coselector_assets',
  CONTENT_ITEMS: 'coselector_content_items',
  LEADS: 'coselector_leads',
  TRANSACTIONS: 'coselector_transactions',
  PAYOUTS: 'coselector_payouts',
  NOTIFICATIONS: 'coselector_notifications',
  DISPUTES: 'coselector_disputes',
  USER_PROFILE: 'coselector_user_profile',
  DEV_MODE: 'coselector_dev_mode',
} as const;

// Default user role
export const DEFAULT_USER_ROLE = UserRole.CO_SELECTOR;

// Default view preset
export const DEFAULT_VIEW_PRESET = ViewPreset.OWNER;

// Attribution window (in days)
export const ATTRIBUTION_WINDOW_DAYS = 30;

// Minimum payout threshold
export const MIN_PAYOUT_THRESHOLD = 100;

// Data freshness threshold (in minutes)
export const DATA_FRESHNESS_THRESHOLD = 15;

// Channel tags (predefined)
export const CHANNEL_TAGS = [
  'WeChat',
  'XHS',
  'Instagram',
  'TikTok',
  'Weibo',
  'Douyin',
  'Email',
  'Custom',
];

// Lead categories
export const LEAD_CATEGORIES = [
  'Food & Beverage',
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Electronics',
  'Home & Living',
  'Health & Wellness',
  'Travel & Tourism',
  'Entertainment',
  'Education',
  'Professional Services',
  'Other',
];

// Chinese regions
export const REGIONS = [
  'Beijing',
  'Shanghai',
  'Guangzhou',
  'Shenzhen',
  'Hangzhou',
  'Chengdu',
  'Chongqing',
  'Wuhan',
  'Nanjing',
  'Suzhou',
  'Xiamen',
  'Other',
];

// Glossary terms
export const GLOSSARY_TERMS = [
  {
    term: 'Tracking Asset',
    definition: 'Shareable tracking entity (Short link / QR / Invite code).',
  },
  {
    term: 'Content Item',
    definition:
      'A managed record of a piece of content (platform, title, URL, publish date), optionally bound to assets.',
  },
  {
    term: 'Lead',
    definition:
      'A structured merchant/service provider opportunity submitted by co-selector for platform review/onboarding.',
  },
  {
    term: 'Lead Owner',
    definition:
      'The internal Ops/BD handler responsible for reviewing/advancing the lead (visible as "Assigned Owner" to co-selector).',
  },
  {
    term: 'COI (Conflict of Interest)',
    definition:
      'A declaration that the submitter has no disqualifying conflict (or has disclosed it).',
  },
  {
    term: 'Locking Period / Locking Date',
    definition:
      'Window where a pending commission can be reversed/modified; after lock date it becomes locked.',
  },
  {
    term: 'Reversal / Reversed',
    definition:
      'Negative adjustment due to refund/dispute/fraud/void, etc. For "pending" earnings, reversal can happen before lock date.',
  },
  {
    term: 'Dispute',
    definition:
      'A case requiring evidence and response deadlines; dispute lifecycles often take weeks.',
  },
  {
    term: 'RBAC',
    definition: 'Role-Based Access Control (permissions granted by role).',
  },
];

// KYC verification steps
export const KYC_STEPS = [
  {
    key: 'identity',
    title: 'Identity Basics',
    description: 'Provide your basic identity information',
  },
  {
    key: 'documents',
    title: 'Document Upload',
    description: 'Upload required identity documents',
  },
  {
    key: 'review',
    title: 'Review Submitted',
    description: 'Your submission is under review',
  },
  {
    key: 'complete',
    title: 'Approved',
    description: 'Your KYC verification is complete',
  },
];

// Response deadline days for disputes (typical range 7-21 days)
export const DISPUTE_RESPONSE_DEADLINE_DAYS = 14;

// Payout method types
export const PAYOUT_METHOD_TYPES = ['Bank Account', 'Alipay', 'WeChat Pay'];

// Rule version (for commission calculation)
export const CURRENT_RULE_VERSION = 'v1.0';
