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
  ADMIN_REVIEW_QUEUE: '/admin/review-queue',
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
    label: '首页',
    path: ROUTES.HOME,
    icon: 'HomeOutlined',
  },
  {
    key: 'links',
    label: '链接',
    path: ROUTES.LINKS,
    icon: 'LinkOutlined',
  },
  {
    key: 'content',
    label: '内容',
    path: ROUTES.CONTENT,
    icon: 'FileTextOutlined',
  },
  {
    key: 'leads',
    label: '共选',
    path: ROUTES.LEADS,
    icon: 'TeamOutlined',
  },
  {
    key: 'admin',
    label: '管理',
    path: ROUTES.ADMIN_REVIEW_QUEUE,
    icon: 'ControlOutlined',
  },
  {
    key: 'earnings',
    label: '收益',
    path: ROUTES.EARNINGS,
    icon: 'DollarOutlined',
  },
  {
    key: 'inbox',
    label: '收件箱',
    path: ROUTES.INBOX,
    icon: 'InboxOutlined',
  },
  {
    key: 'profile',
    label: '资料与合规',
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
  '微信',
  '小红书',
  'Instagram',
  'TikTok',
  '微博',
  '抖音',
  '电子邮件',
  '自定义',
];

// Lead categories
export const LEAD_CATEGORIES = [
  '餐饮',
  '服饰',
  '美妆',
  '电子产品',
  '家居生活',
  '健康养生',
  '旅游',
  '娱乐',
  '教育',
  '专业服务',
  '其他',
];

// Chinese regions
export const REGIONS = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '重庆',
  '武汉',
  '南京',
  '苏州',
  '厦门',
  '其他',
];

// Glossary terms
export const GLOSSARY_TERMS = [
  {
    term: '追踪资产',
    definition: '可分享的追踪实体（短链接/二维码/邀请码）。',
  },
  {
    term: '内容项',
    definition:
      '一条内容的管理记录（平台、标题、链接、发布日期），可选绑定追踪资产。',
  },
  {
    term: '线索',
    definition:
      '共选者提交的结构化商户/服务商机会，用于平台审核和入驻。',
  },
  {
    term: '线索负责人',
    definition:
      '负责审核和推进线索的内部运营/BD 处理人（对共选者显示为“已分配负责人”）。',
  },
  {
    term: '利益冲突声明（COI）',
    definition:
      '提交人声明不存在影响资格的利益冲突，或已完成披露。',
  },
  {
    term: '锁定期/锁定日期',
    definition:
      '待结佣金可被冲正或修改的窗口期；到达锁定日期后变为已锁定。',
  },
  {
    term: '冲正/已冲正',
    definition:
      '由于退款、争议、欺诈、作废等原因产生的负向调整。待锁定收益可在锁定日前被冲正。',
  },
  {
    term: '争议',
    definition:
      '需要提交证据并遵守响应期限的案件；争议生命周期通常持续数周。',
  },
  {
    term: 'RBAC',
    definition: '基于角色的访问控制（权限按角色授予）。',
  },
];

// KYC verification steps
export const KYC_STEPS = [
  {
    key: 'identity',
    title: '身份基础信息',
    description: '填写你的基础身份信息',
  },
  {
    key: 'documents',
    title: '证件上传',
    description: '上传所需身份文件',
  },
  {
    key: 'review',
    title: '已提交审核',
    description: '你的提交正在审核中',
  },
  {
    key: 'complete',
    title: '已通过',
    description: '你的 KYC 验证已完成',
  },
];

// Response deadline days for disputes (typical range 7-21 days)
export const DISPUTE_RESPONSE_DEADLINE_DAYS = 14;

// Payout method types
export const PAYOUT_METHOD_TYPES = ['银行账户', '支付宝', '微信支付'];

// Rule version (for commission calculation)
export const CURRENT_RULE_VERSION = 'v1.0';
