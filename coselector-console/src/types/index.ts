import {
  AssetType,
  AssetStatus,
  ContentPlatform,
  LeadStatus,
  EarningsState,
  PayoutStatus,
  DisputeStatus,
  NotificationType,
  KYCStatus,
  ReversalReason,
  LeadReviewReason,
  ActorType,
  MilestoneStatus,
  TransactionSource,
} from './enums';

// Base entity with timestamps
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Timeline event for audit trails
export interface TimelineEvent {
  id: string;
  actorType: ActorType;
  actorName: string;
  occurredAt: string;
  eventType: string;
  description: string;
  reasonCode?: string;
  metadata?: Record<string, any>;
}

// Tracking Asset
export interface TrackingAsset {
  id: string;
  type: AssetType;
  name: string;
  assetValue: string; // The actual link/QR code/invite code value
  channelTag: string;
  status: AssetStatus;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  clickCount: number;
  conversionCount: number;
  boundContentIds: string[]; // content item IDs
}

// Content Item
export interface ContentItem {
  id: string;
  title: string;
  platform: ContentPlatform;
  url?: string;
  publishDate?: string;
  notes?: string;
  boundAssetIds?: string[]; // asset IDs
  viewCount?: number;
  clickCount: number;
  conversionCount: number;
  estimatedEarnings?: number;
  createdAt: string;
}

// Lead Contact
export interface LeadContact {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
}

// Lead
export interface Lead {
  id: string;
  merchantName: string;
  category: string;
  city: string;
  region: string;
  status: LeadStatus;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  website?: string;
  estimatedMonthlyVolume?: string;
  notes?: string;
  submittedAt?: string;
  lastUpdatedAt: string;
  assignedOwner?: string;
  timeline: TimelineEvent[];
}

// Lead Milestone
export interface LeadMilestone {
  id: string;
  name: string;
  status: MilestoneStatus;
  achievedDate?: string;
  estimatedReward: number;
  lockDate?: string;
  evidenceRef?: string;
}

// Transaction
export interface Transaction {
  id: string;
  date: string;
  source: TransactionSource;
  referenceId: string;
  amount: number;
  state: EarningsState;
  lockEndAt: string; // When the pending period ends and transaction locks
  ruleVersion: string;
  commissionRate: number;
  assetId: string;
  channelTag: string;
  createdAt: string;
  timeline: TimelineEvent[];
}

// Payout
export interface Payout {
  id: string;
  amount: number;
  status: PayoutStatus;
  requestedAt: string;
  approvedAt?: string;
  paidAt?: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  transactionIds: string[]; // transaction IDs
  timeline: TimelineEvent[];
}

// Statement period
export interface Statement {
  id: string;
  period: string;
  openingBalance: number;
  earnings: number;
  reversals: number;
  payouts: number;
  closingBalance: number;
  createdAt: string;
}

// Notification
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

// Dispute Case
export interface DisputeCase {
  id: string;
  transactionId: string;
  type?: string; // Dispute type (e.g., 'Transaction Dispute', 'Commission Discrepancy')
  status: DisputeStatus;
  reason: string;
  description: string;
  openedAt: string;
  resolvedAt?: string;
  deadlineAt?: string; // Response deadline
  evidence: string[]; // file URLs
  requiredEvidenceCount?: number; // Number of required evidence items
  messageCount?: number; // Number of messages in thread
  resolution?: string; // Resolution details
  resolutionStatus?: 'ACCEPTED' | 'APPEAL_PENDING' | 'AUTO_CLOSED'; // User's response to resolution
  appealReason?: string; // Reason for appeal if applicable
  timeline: TimelineEvent[];
}

// Evidence Item
export interface EvidenceItem {
  id: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  uploadedAt?: string;
  fileUrl?: string;
}

// User Profile
export interface UserProfile {
  id: string;
  role: import('./enums').UserRole;
  displayName: string;
  email: string;
  phone: string;
  kycStatus: KYCStatus;
  kycSubmittedAt?: string;
  kycApprovedAt?: string;
  kycRejectionReason?: string;
  kycData?: {
    fullName: string;
    idNumber: string;
    idType: 'ID_CARD' | 'PASSPORT' | 'DRIVER_LICENSE';
    dateOfBirth: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branchName?: string;
    swiftCode?: string;
    verified?: boolean;
    verifiedAt?: string;
  };
  accountFrozen?: boolean;
  accountUnderReview?: boolean;
  coiDisclosure?: {
    hasConflict: boolean;
    conflictDescription?: string;
    declaredAt: string;
    resolvedAt?: string;
    resolutionNote?: string;
  };
  notificationPreferences?: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    criticalNotifications: {
      kycRejected: boolean;
      accountFrozen: boolean;
      disputeDeadline: boolean;
      payoutFailed: boolean;
    };
    importantNotifications: {
      transactionLocked: boolean;
      payoutApproved: boolean;
      leadApproved: boolean;
      leadRejected: boolean;
    };
    informationalNotifications: {
      policyUpdates: boolean;
      rulebookVersion: boolean;
      monthlyStatement: boolean;
    };
  };
  createdAt: string;
  lastLoginAt?: string;
}

// Payout Method
export interface PayoutMethod {
  type: string;
  accountNumber: string;
  bankName?: string;
  verifiedAt?: string;
}

// Tax Info
export interface TaxInfo {
  taxId?: string;
  country?: string;
  address?: string;
}

// Eligibility Status
export interface EligibilityStatus {
  eligible: boolean;
  blockedReasons: BlockedReason[];
}

// Blocked Reason
export interface BlockedReason {
  reason: string;
  description: string;
  fixAction: string;
  deepLink?: string;
}

// KPI Card Data
export interface KPICard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  route?: string;
  filters?: Record<string, any>;
}

// Funnel Data
export interface FunnelData {
  clicks: number;
  registrations: number;
  firstPurchases: number;
  repeatPurchases: number;
  conversionRates: {
    clickToRegister: number;
    registerToFirstPurchase: number;
    firstToRepeat: number;
  };
}

// Date Range
export interface DateRange {
  start: string;
  end: string;
  preset?: 'thisMonth' | 'last30Days' | 'custom';
}

// Filter State
export interface FilterState {
  [key: string]: any;
}

// Table Pagination
export interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
}

// Chart Data Point
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}
