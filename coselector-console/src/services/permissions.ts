import { UserRole } from '../types/enums';

/**
 * Permission types for role-based access control
 */
export enum Permission {
  // Assets
  ASSET_VIEW = 'ASSET_VIEW',
  ASSET_CREATE = 'ASSET_CREATE',
  ASSET_EDIT = 'ASSET_EDIT',
  ASSET_UPDATE = 'ASSET_UPDATE',
  ASSET_DISABLE = 'ASSET_DISABLE',
  ASSET_DELETE = 'ASSET_DELETE',
  
  // Content
  CONTENT_VIEW = 'CONTENT_VIEW',
  CONTENT_CREATE = 'CONTENT_CREATE',
  CONTENT_EDIT = 'CONTENT_EDIT',
  CONTENT_DELETE = 'CONTENT_DELETE',
  CONTENT_BIND_ASSET = 'CONTENT_BIND_ASSET',
  
  // Leads
  LEAD_VIEW = 'LEAD_VIEW',
  LEAD_CREATE = 'LEAD_CREATE',
  LEAD_EDIT = 'LEAD_EDIT',
  LEAD_SUBMIT = 'LEAD_SUBMIT',
  LEAD_ASSIGN_OWNER = 'LEAD_ASSIGN_OWNER', // OPS only
  LEAD_CHANGE_STATUS = 'LEAD_CHANGE_STATUS', // OPS only
  LEAD_REQUEST_INFO = 'LEAD_REQUEST_INFO', // OPS only
  
  // Transactions/Earnings
  TRANSACTION_VIEW = 'TRANSACTION_VIEW',
  TRANSACTION_VIEW_DETAILS = 'TRANSACTION_VIEW_DETAILS',
  
  // Payouts
  PAYOUT_VIEW = 'PAYOUT_VIEW',
  PAYOUT_REQUEST = 'PAYOUT_REQUEST',
  PAYOUT_APPROVE = 'PAYOUT_APPROVE', // FINANCE only
  PAYOUT_EXECUTE = 'PAYOUT_EXECUTE', // FINANCE only
  PAYOUT_CANCEL = 'PAYOUT_CANCEL', // FINANCE only
  
  // Disputes
  DISPUTE_VIEW = 'DISPUTE_VIEW',
  DISPUTE_CREATE = 'DISPUTE_CREATE',
  DISPUTE_UPLOAD_EVIDENCE = 'DISPUTE_UPLOAD_EVIDENCE',
  DISPUTE_RESOLVE = 'DISPUTE_RESOLVE', // OPS only
  
  // Statements
  STATEMENT_VIEW = 'STATEMENT_VIEW',
  STATEMENT_EXPORT = 'STATEMENT_EXPORT',
  
  // Profile
  PROFILE_VIEW = 'PROFILE_VIEW',
  PROFILE_EDIT = 'PROFILE_EDIT',
  PROFILE_KYC_SUBMIT = 'PROFILE_KYC_SUBMIT',
  
  // Notifications
  NOTIFICATION_VIEW = 'NOTIFICATION_VIEW',
  NOTIFICATION_MARK_READ = 'NOTIFICATION_MARK_READ',
  
  // Admin/Dev
  DEV_TOOLS_ACCESS = 'DEV_TOOLS_ACCESS', // For prototype simulation features
}

/**
 * Role-to-permissions mapping
 * Defines what each role can do in the system
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // CO_SELECTOR: Full access to their own features, cannot access internal controls
  [UserRole.CO_SELECTOR]: [
    // Assets
    Permission.ASSET_VIEW,
    Permission.ASSET_CREATE,
    Permission.ASSET_EDIT,
    Permission.ASSET_UPDATE,
    Permission.ASSET_DISABLE,
    Permission.ASSET_DELETE,
    
    // Content
    Permission.CONTENT_VIEW,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.CONTENT_DELETE,
    Permission.CONTENT_BIND_ASSET,
    
    // Leads (can create/edit own leads, but cannot manage review process)
    Permission.LEAD_VIEW,
    Permission.LEAD_CREATE,
    Permission.LEAD_EDIT,
    Permission.LEAD_SUBMIT,
    
    // Transactions
    Permission.TRANSACTION_VIEW,
    Permission.TRANSACTION_VIEW_DETAILS,
    
    // Payouts (can request, but cannot approve/execute)
    Permission.PAYOUT_VIEW,
    Permission.PAYOUT_REQUEST,
    
    // Disputes
    Permission.DISPUTE_VIEW,
    Permission.DISPUTE_CREATE,
    Permission.DISPUTE_UPLOAD_EVIDENCE,
    
    // Statements
    Permission.STATEMENT_VIEW,
    Permission.STATEMENT_EXPORT,
    
    // Profile
    Permission.PROFILE_VIEW,
    Permission.PROFILE_EDIT,
    Permission.PROFILE_KYC_SUBMIT,
    
    // Notifications
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_MARK_READ,
  ],
  
  // OPS_BD: Internal role for reviewing leads and managing operational processes
  [UserRole.OPS_BD]: [
    // Assets (view only for context)
    Permission.ASSET_VIEW,
    
    // Content (view only for context)
    Permission.CONTENT_VIEW,
    
    // Leads (full review and assignment capabilities)
    Permission.LEAD_VIEW,
    Permission.LEAD_ASSIGN_OWNER,
    Permission.LEAD_CHANGE_STATUS,
    Permission.LEAD_REQUEST_INFO,
    
    // Transactions (view for context)
    Permission.TRANSACTION_VIEW,
    Permission.TRANSACTION_VIEW_DETAILS,
    
    // Payouts (view only)
    Permission.PAYOUT_VIEW,
    
    // Disputes (can resolve)
    Permission.DISPUTE_VIEW,
    Permission.DISPUTE_RESOLVE,
    
    // Statements (view only)
    Permission.STATEMENT_VIEW,
    
    // Notifications
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_MARK_READ,
    
    // Dev Tools
    Permission.DEV_TOOLS_ACCESS,
  ],
  
  // FINANCE: Internal role for managing payouts and financial operations
  [UserRole.FINANCE]: [
    // Assets (view only for context)
    Permission.ASSET_VIEW,
    
    // Content (view only for context)
    Permission.CONTENT_VIEW,
    
    // Leads (view only for context)
    Permission.LEAD_VIEW,
    
    // Transactions (full access for auditing)
    Permission.TRANSACTION_VIEW,
    Permission.TRANSACTION_VIEW_DETAILS,
    
    // Payouts (full management capabilities)
    Permission.PAYOUT_VIEW,
    Permission.PAYOUT_APPROVE,
    Permission.PAYOUT_EXECUTE,
    Permission.PAYOUT_CANCEL,
    
    // Disputes (view only)
    Permission.DISPUTE_VIEW,
    
    // Statements (full access)
    Permission.STATEMENT_VIEW,
    Permission.STATEMENT_EXPORT,
    
    // Notifications
    Permission.NOTIFICATION_VIEW,
    Permission.NOTIFICATION_MARK_READ,
    
    // Dev Tools
    Permission.DEV_TOOLS_ACCESS,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Permission denial reasons for user-friendly error messages
 */
export const PERMISSION_DENIAL_MESSAGES: Record<Permission, string> = {
  // Assets
  [Permission.ASSET_VIEW]: 'You do not have permission to view assets',
  [Permission.ASSET_CREATE]: 'You do not have permission to create assets',
  [Permission.ASSET_EDIT]: 'You do not have permission to edit assets',
  [Permission.ASSET_UPDATE]: 'You do not have permission to update assets',
  [Permission.ASSET_DISABLE]: 'You do not have permission to disable assets',
  [Permission.ASSET_DELETE]: 'You do not have permission to delete assets',
  
  // Content
  [Permission.CONTENT_VIEW]: 'You do not have permission to view content',
  [Permission.CONTENT_CREATE]: 'You do not have permission to create content',
  [Permission.CONTENT_EDIT]: 'You do not have permission to edit content',
  [Permission.CONTENT_DELETE]: 'You do not have permission to delete content',
  [Permission.CONTENT_BIND_ASSET]: 'You do not have permission to bind assets to content',
  
  // Leads
  [Permission.LEAD_VIEW]: 'You do not have permission to view leads',
  [Permission.LEAD_CREATE]: 'You do not have permission to create leads',
  [Permission.LEAD_EDIT]: 'You do not have permission to edit leads',
  [Permission.LEAD_SUBMIT]: 'You do not have permission to submit leads',
  [Permission.LEAD_ASSIGN_OWNER]: 'Internal only - Owner assignment is restricted to Operations team',
  [Permission.LEAD_CHANGE_STATUS]: 'Internal only - Status changes are restricted to Operations team',
  [Permission.LEAD_REQUEST_INFO]: 'Internal only - Info requests are restricted to Operations team',
  
  // Transactions
  [Permission.TRANSACTION_VIEW]: 'You do not have permission to view transactions',
  [Permission.TRANSACTION_VIEW_DETAILS]: 'You do not have permission to view transaction details',
  
  // Payouts
  [Permission.PAYOUT_VIEW]: 'You do not have permission to view payouts',
  [Permission.PAYOUT_REQUEST]: 'You do not have permission to request payouts',
  [Permission.PAYOUT_APPROVE]: 'Internal only - Payout approval is restricted to Finance team',
  [Permission.PAYOUT_EXECUTE]: 'Internal only - Payout execution is restricted to Finance team',
  [Permission.PAYOUT_CANCEL]: 'Internal only - Payout cancellation is restricted to Finance team',
  
  // Disputes
  [Permission.DISPUTE_VIEW]: 'You do not have permission to view disputes',
  [Permission.DISPUTE_CREATE]: 'You do not have permission to create disputes',
  [Permission.DISPUTE_UPLOAD_EVIDENCE]: 'You do not have permission to upload evidence',
  [Permission.DISPUTE_RESOLVE]: 'Internal only - Dispute resolution is restricted to Operations team',
  
  // Statements
  [Permission.STATEMENT_VIEW]: 'You do not have permission to view statements',
  [Permission.STATEMENT_EXPORT]: 'You do not have permission to export statements',
  
  // Profile
  [Permission.PROFILE_VIEW]: 'You do not have permission to view profile',
  [Permission.PROFILE_EDIT]: 'You do not have permission to edit profile',
  [Permission.PROFILE_KYC_SUBMIT]: 'You do not have permission to submit KYC',
  
  // Notifications
  [Permission.NOTIFICATION_VIEW]: 'You do not have permission to view notifications',
  [Permission.NOTIFICATION_MARK_READ]: 'You do not have permission to mark notifications as read',
  
  // Admin
  [Permission.DEV_TOOLS_ACCESS]: 'Internal only - Dev tools are restricted to internal users',
};

/**
 * Get user-friendly permission denial message
 */
export function getPermissionDenialMessage(permission: Permission): string {
  return PERMISSION_DENIAL_MESSAGES[permission] || 'You do not have permission to perform this action';
}
