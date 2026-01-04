import {
  TrackingAsset,
  ContentItem,
  Lead,
  Transaction,
  Payout,
  Notification,
  DisputeCase,
  UserProfile,
} from '../types';
import {
  LeadStatus,
  EarningsState,
  PayoutStatus,
  DisputeStatus,
  ActorType,
} from '../types/enums';
import { storage } from '../utils/storage';
import { generateSeedData } from './seedData';
import {
  LeadStateMachine,
  EarningsStateMachine,
  PayoutStateMachine,
  DisputeStateMachine,
  LeadTransitionContext,
  EarningsTransitionContext,
  PayoutTransitionContext,
  DisputeTransitionContext,
} from './stateMachines';

/**
 * Mock API Service for Co-selector Console
 * 
 * Provides CRUD operations for all entities with:
 * - Async simulation (realistic delays)
 * - LocalStorage persistence
 * - State machine integration
 * - Error handling
 * - Data freshness tracking
 * 
 * This will be replaced with real API calls in production
 */

// Simulate network delay
const MOCK_DELAY_MS = 300;
const delay = (ms: number = MOCK_DELAY_MS) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Storage keys
const STORAGE_KEYS = {
  ASSETS: 'assets',
  CONTENT: 'content',
  LEADS: 'leads',
  TRANSACTIONS: 'transactions',
  PAYOUTS: 'payouts',
  DISPUTES: 'disputes',
  NOTIFICATIONS: 'notifications',
  USER_PROFILE: 'userProfile',
  LAST_SYNC: 'lastSync',
};

/**
 * Initialize data - loads from localStorage or generates seed data
 */
export async function initializeData(): Promise<void> {
  await delay(500);

  // Check if data exists in localStorage
  const existingData = storage.get<any>(STORAGE_KEYS.ASSETS);
  
  if (!existingData) {
    console.log('馃攧 No existing data found, generating seed data...');
    const seedData = generateSeedData();
    
    // Save to localStorage
    storage.set(STORAGE_KEYS.ASSETS, seedData.assets);
    storage.set(STORAGE_KEYS.CONTENT, seedData.contentItems);
    storage.set(STORAGE_KEYS.LEADS, seedData.leads);
    storage.set(STORAGE_KEYS.TRANSACTIONS, seedData.transactions);
    storage.set(STORAGE_KEYS.PAYOUTS, seedData.payouts);
    storage.set(STORAGE_KEYS.DISPUTES, seedData.disputeCases);
    storage.set(STORAGE_KEYS.NOTIFICATIONS, seedData.notifications);
    storage.set(STORAGE_KEYS.USER_PROFILE, seedData.userProfile);
    storage.set(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    
    console.log('鉁?Seed data saved to localStorage');
  } else {
    console.log('鉁?Data loaded from localStorage');
  }
}

/**
 * Get data freshness timestamp
 */
export function getLastSyncTime(): string | null {
  return storage.get<string>(STORAGE_KEYS.LAST_SYNC);
}

/**
 * Update last sync timestamp
 */
function updateLastSyncTime(): void {
  storage.set(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
}

// ============================================================================
// ASSETS API
// ============================================================================

export async function getAssets(): Promise<TrackingAsset[]> {
  await delay();
  return storage.get<TrackingAsset[]>(STORAGE_KEYS.ASSETS) || [];
}

export async function getAssetById(id: string): Promise<TrackingAsset | null> {
  await delay();
  const assets = await getAssets();
  return assets.find(a => a.id === id) || null;
}

export async function createAsset(asset: Omit<TrackingAsset, 'id' | 'createdAt'>): Promise<TrackingAsset> {
  await delay();
  const assets = await getAssets();
  
  const newAsset: TrackingAsset = {
    ...asset,
    id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    clickCount: 0,
    conversionCount: 0,
  };
  
  assets.push(newAsset);
  storage.set(STORAGE_KEYS.ASSETS, assets);
  updateLastSyncTime();
  
  return newAsset;
}

export async function updateAsset(id: string, updates: Partial<TrackingAsset>): Promise<TrackingAsset> {
  await delay();
  const assets = await getAssets();
  const index = assets.findIndex(a => a.id === id);
  
  if (index === -1) {
    throw new Error(`Asset not found: ${id}`);
  }
  
  assets[index] = { ...assets[index], ...updates };
  storage.set(STORAGE_KEYS.ASSETS, assets);
  updateLastSyncTime();
  
  return assets[index];
}

export async function deleteAsset(id: string): Promise<void> {
  await delay();
  const assets = await getAssets();
  const filtered = assets.filter(a => a.id !== id);
  storage.set(STORAGE_KEYS.ASSETS, filtered);
  updateLastSyncTime();
}

// ============================================================================
// CONTENT API
// ============================================================================

export async function getContentItems(): Promise<ContentItem[]> {
  await delay();
  return storage.get<ContentItem[]>(STORAGE_KEYS.CONTENT) || [];
}

export async function getContentItemById(id: string): Promise<ContentItem | null> {
  await delay();
  const items = await getContentItems();
  return items.find(c => c.id === id) || null;
}

export async function createContentItem(item: Omit<ContentItem, 'id' | 'createdAt'>): Promise<ContentItem> {
  await delay();
  const items = await getContentItems();
  
  const newItem: ContentItem = {
    ...item,
    id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  
  items.push(newItem);
  storage.set(STORAGE_KEYS.CONTENT, items);
  updateLastSyncTime();
  
  return newItem;
}

export async function updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
  await delay();
  const items = await getContentItems();
  const index = items.findIndex(c => c.id === id);
  
  if (index === -1) {
    throw new Error(`Content item not found: ${id}`);
  }
  
  items[index] = { ...items[index], ...updates };
  storage.set(STORAGE_KEYS.CONTENT, items);
  updateLastSyncTime();
  
  return items[index];
}

export async function deleteContentItem(id: string): Promise<void> {
  await delay();
  const items = await getContentItems();
  const filtered = items.filter(c => c.id !== id);
  
  if (filtered.length === items.length) {
    throw new Error(`Content item not found: ${id}`);
  }
  
  storage.set(STORAGE_KEYS.CONTENT, filtered);
  updateLastSyncTime();
}

// ============================================================================
// LEADS API
// ============================================================================

export async function getLeads(): Promise<Lead[]> {
  await delay();
  return storage.get<Lead[]>(STORAGE_KEYS.LEADS) || [];
}

export async function getLeadById(id: string): Promise<Lead | null> {
  await delay();
  const leads = await getLeads();
  return leads.find(l => l.id === id) || null;
}

export async function createLead(lead: Omit<Lead, 'id' | 'timeline'>): Promise<Lead> {
  await delay();
  const leads = await getLeads();
  
  const newLead: Lead = {
    ...lead,
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timeline: [{
      id: `event_${Date.now()}`,
      actorType: ActorType.CO_SELECTOR,
      actorName: 'Current User',
      occurredAt: new Date().toISOString(),
      eventType: 'Created',
      description: 'Lead created',
    }],
  };
  
  leads.push(newLead);
  storage.set(STORAGE_KEYS.LEADS, leads);
  updateLastSyncTime();
  
  return newLead;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  await delay();
  const leads = await getLeads();
  const index = leads.findIndex(l => l.id === id);
  
  if (index === -1) {
    throw new Error(`Lead not found: ${id}`);
  }
  
  leads[index] = { ...leads[index], ...updates };
  storage.set(STORAGE_KEYS.LEADS, leads);
  updateLastSyncTime();
  
  return leads[index];
}

/**
 * Transition lead to new status using state machine
 */
export async function transitionLeadStatus(
  id: string,
  context: Omit<LeadTransitionContext, 'currentStatus'>,
  targetStatus: LeadStatus
): Promise<Lead> {
  await delay();
  const leads = await getLeads();
  const lead = leads.find(l => l.id === id);
  
  if (!lead) {
    throw new Error(`Lead not found: ${id}`);
  }
  
  // Use state machine to validate and perform transition
  const result = LeadStateMachine.transition(
    { ...context, currentStatus: lead.status },
    targetStatus
  );
  
  if (!result.isValid) {
    throw new Error(result.error);
  }
  
  // Update lead with new status and timeline event
  lead.status = result.newStatus;
  lead.timeline = [...lead.timeline, result.event];
  lead.lastUpdatedAt = new Date().toISOString();
  
  const index = leads.findIndex(l => l.id === id);
  leads[index] = lead;
  storage.set(STORAGE_KEYS.LEADS, leads);
  updateLastSyncTime();
  
  return lead;
}

/**
 * Delete a lead
 */
export async function deleteLead(id: string): Promise<void> {
  await delay();
  const leads = await getLeads();
  const filtered = leads.filter(l => l.id !== id);
  storage.set(STORAGE_KEYS.LEADS, filtered);
  updateLastSyncTime();
  console.log(`馃棏锔?Lead deleted: ${id}`);
}

// ============================================================================
// TRANSACTIONS API
// ============================================================================

export async function getTransactions(): Promise<Transaction[]> {
  await delay();
  return storage.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  await delay();
  const transactions = await getTransactions();
  return transactions.find(t => t.id === id) || null;
}

/**
 * Transition transaction to new state using state machine
 */
export async function transitionTransactionState(
  id: string,
  context: Omit<EarningsTransitionContext, 'currentState'>,
  targetState: EarningsState
): Promise<Transaction> {
  await delay();
  const transactions = await getTransactions();
  const transaction = transactions.find(t => t.id === id);
  
  if (!transaction) {
    throw new Error(`Transaction not found: ${id}`);
  }
  
  // Use state machine to validate and perform transition
  const result = EarningsStateMachine.transition(
    {
      ...context,
      currentState: transaction.state,
      transactionAmount: transaction.amount,
    },
    targetState
  );
  
  if (!result.isValid) {
    throw new Error(result.error);
  }
  
  // Update transaction with new state and timeline event
  transaction.state = result.newState;
  transaction.timeline = [...transaction.timeline, result.event];
  
  // If reversal entry is needed, create it
  if (result.reversalEntry) {
    const reversalTransaction: Transaction = {
      ...transaction,
      id: `txn_reversal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: result.reversalEntry.amount,
      state: EarningsState.REVERSED,
      createdAt: new Date().toISOString(),
      timeline: [result.event],
    };
    transactions.push(reversalTransaction);
  }
  
  const index = transactions.findIndex(t => t.id === id);
  transactions[index] = transaction;
  storage.set(STORAGE_KEYS.TRANSACTIONS, transactions);
  updateLastSyncTime();
  
  return transaction;
}

/**
 * Get transactions by state
 */
export async function getTransactionsByState(state: EarningsState): Promise<Transaction[]> {
  await delay();
  const transactions = await getTransactions();
  return transactions.filter(t => t.state === state);
}

/**
 * Get balance summary by state
 */
export async function getBalanceSummary(): Promise<Record<EarningsState, number>> {
  await delay();
  const transactions = await getTransactions();
  
  const summary: Record<EarningsState, number> = {
    [EarningsState.PENDING]: 0,
    [EarningsState.LOCKED]: 0,
    [EarningsState.PAYABLE]: 0,
    [EarningsState.PAID]: 0,
    [EarningsState.REVERSED]: 0,
  };
  
  transactions.forEach(t => {
    summary[t.state] += t.amount;
  });
  
  return summary;
}

// ============================================================================
// PAYOUTS API
// ============================================================================

export async function getPayouts(): Promise<Payout[]> {
  await delay();
  return storage.get<Payout[]>(STORAGE_KEYS.PAYOUTS) || [];
}

export async function getPayoutById(id: string): Promise<Payout | null> {
  await delay();
  const payouts = await getPayouts();
  return payouts.find(p => p.id === id) || null;
}

export async function createPayout(payout: Omit<Payout, 'id' | 'timeline'>): Promise<Payout> {
  await delay();
  const payouts = await getPayouts();
  
  const newPayout: Payout = {
    ...payout,
    id: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timeline: [{
      id: `event_${Date.now()}`,
      actorType: ActorType.CO_SELECTOR,
      actorName: 'Current User',
      occurredAt: new Date().toISOString(),
      eventType: 'Requested',
      description: `Payout requested: 楼${payout.amount.toFixed(2)}`,
    }],
  };
  
  payouts.push(newPayout);
  storage.set(STORAGE_KEYS.PAYOUTS, payouts);
  updateLastSyncTime();
  
  return newPayout;
}

/**
 * Transition payout to new status using state machine
 */
export async function transitionPayoutStatus(
  id: string,
  context: Omit<PayoutTransitionContext, 'currentStatus'>,
  targetStatus: PayoutStatus
): Promise<Payout> {
  await delay();
  const payouts = await getPayouts();
  const payout = payouts.find(p => p.id === id);
  
  if (!payout) {
    throw new Error(`Payout not found: ${id}`);
  }
  
  // Use state machine to validate and perform transition
  const result = PayoutStateMachine.transition(
    {
      ...context,
      currentStatus: payout.status,
      payoutAmount: payout.amount,
    },
    targetStatus
  );
  
  if (!result.isValid) {
    throw new Error(result.error);
  }
  
  // Update payout with new status and timeline event
  payout.status = result.newStatus;
  payout.timeline = [...payout.timeline, result.event];
  
  // Update approval/paid timestamps
  if (targetStatus === PayoutStatus.APPROVED) {
    payout.approvedAt = new Date().toISOString();
  }
  if (targetStatus === PayoutStatus.PAID) {
    payout.paidAt = new Date().toISOString();
  }
  
  const index = payouts.findIndex(p => p.id === id);
  payouts[index] = payout;
  storage.set(STORAGE_KEYS.PAYOUTS, payouts);
  updateLastSyncTime();
  
  return payout;
}

// ============================================================================
// DISPUTES API
// ============================================================================

export async function getDisputeCases(): Promise<DisputeCase[]> {
  await delay();
  return storage.get<DisputeCase[]>(STORAGE_KEYS.DISPUTES) || [];
}

export async function getDisputeCaseById(id: string): Promise<DisputeCase | null> {
  await delay();
  const cases = await getDisputeCases();
  return cases.find(c => c.id === id) || null;
}

export async function createDisputeCase(disputeCase: Omit<DisputeCase, 'id' | 'timeline'>): Promise<DisputeCase> {
  await delay();
  const cases = await getDisputeCases();
  
  const newCase: DisputeCase = {
    ...disputeCase,
    id: `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timeline: [{
      id: `event_${Date.now()}`,
      actorType: ActorType.CO_SELECTOR,
      actorName: 'Current User',
      occurredAt: new Date().toISOString(),
      eventType: 'Opened',
      description: `Dispute opened: ${disputeCase.reason}`,
    }],
  };
  
  cases.push(newCase);
  storage.set(STORAGE_KEYS.DISPUTES, cases);
  updateLastSyncTime();
  
  return newCase;
}

/**
 * Transition dispute to new status using state machine
 */
export async function transitionDisputeStatus(
  id: string,
  context: Omit<DisputeTransitionContext, 'currentStatus'>,
  targetStatus: DisputeStatus
): Promise<DisputeCase> {
  await delay();
  const cases = await getDisputeCases();
  const disputeCase = cases.find(c => c.id === id);
  
  if (!disputeCase) {
    throw new Error(`Dispute case not found: ${id}`);
  }
  
  // Use state machine to validate and perform transition
  const result = DisputeStateMachine.transition(
    { ...context, currentStatus: disputeCase.status },
    targetStatus
  );
  
  if (!result.isValid) {
    throw new Error(result.error);
  }
  
  // Update dispute with new status and timeline event
  disputeCase.status = result.newStatus;
  disputeCase.timeline = [...disputeCase.timeline, result.event];
  
  // Update resolved timestamp
  if (targetStatus === DisputeStatus.RESOLVED) {
    disputeCase.resolvedAt = new Date().toISOString();
  }
  
  const index = cases.findIndex(c => c.id === id);
  cases[index] = disputeCase;
  storage.set(STORAGE_KEYS.DISPUTES, cases);
  updateLastSyncTime();
  
  return disputeCase;
}

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export async function getNotifications(): Promise<Notification[]> {
  await delay();
  return storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await delay();
  const notifications = await getNotifications();
  const notification = notifications.find(n => n.id === id);
  
  if (notification) {
    notification.read = true;
    storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    updateLastSyncTime();
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await delay();
  const notifications = await getNotifications();
  notifications.forEach(n => n.read = true);
  storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
  updateLastSyncTime();
}

export async function getUnreadNotificationCount(): Promise<number> {
  await delay();
  const notifications = await getNotifications();
  return notifications.filter(n => !n.read).length;
}

// ============================================================================
// USER PROFILE API
// ============================================================================

export async function getUserProfile(): Promise<UserProfile | null> {
  await delay();
  return storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  await delay();
  const profile = await getUserProfile();
  
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const updatedProfile = { ...profile, ...updates };
  storage.set(STORAGE_KEYS.USER_PROFILE, updatedProfile);
  updateLastSyncTime();
  
  return updatedProfile;
}

// ============================================================================
// DATA MANAGEMENT
// ============================================================================

/**
 * Clear all data (useful for testing)
 */
export async function clearAllData(): Promise<void> {
  await delay();
  Object.values(STORAGE_KEYS).forEach(key => {
    storage.remove(key);
  });
  console.log('馃棏锔?All data cleared');
}

/**
 * Reset to seed data
 */
export async function resetToSeedData(): Promise<void> {
  await clearAllData();
  await initializeData();
  console.log('馃攧 Data reset to seed data');
}

/**
 * Mock API object export for convenient import
 */
export const mockApi = {
  // Initialization
  initializeData,
  getLastSyncTime,
  
  // Assets
  assets: {
    getAll: getAssets,
    getById: getAssetById,
    create: createAsset,
    update: updateAsset,
    delete: deleteAsset,
  },
  
  // Content
  content: {
    getAll: getContentItems,
    getById: getContentItemById,
    create: createContentItem,
    update: updateContentItem,
    delete: deleteContentItem,
  },
  
  // Leads
  leads: {
    getAll: getLeads,
    getById: getLeadById,
    create: createLead,
    update: updateLead,
    delete: deleteLead,
    transitionStatus: transitionLeadStatus,
  },
  
  // Transactions
  transactions: {
    getAll: getTransactions,
    getById: getTransactionById,
    getByState: getTransactionsByState,
    transitionState: transitionTransactionState,
  },
  
  // Payouts
  payouts: {
    getAll: getPayouts,
    getById: getPayoutById,
    create: createPayout,
    transitionStatus: transitionPayoutStatus,
  },
  
  // Disputes
  disputes: {
    getAll: getDisputeCases,
    getById: getDisputeCaseById,
    create: createDisputeCase,
    updateStatus: transitionDisputeStatus,
  },
  
  // Notifications
  notifications: {
    getAll: getNotifications,
    markAsRead: markNotificationAsRead,
  },
  
  // User Profile
  userProfile: {
    get: getUserProfile,
    update: updateUserProfile,
  },
  
  // Data management
  clearAllData,
  resetToSeedData,
};


