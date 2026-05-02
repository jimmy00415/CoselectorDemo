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
  [Permission.ASSET_VIEW]: '你没有查看资产的权限',
  [Permission.ASSET_CREATE]: '你没有创建资产的权限',
  [Permission.ASSET_EDIT]: '你没有编辑资产的权限',
  [Permission.ASSET_UPDATE]: '你没有更新资产的权限',
  [Permission.ASSET_DISABLE]: '你没有停用资产的权限',
  [Permission.ASSET_DELETE]: '你没有删除资产的权限',
  
  // Content
  [Permission.CONTENT_VIEW]: '你没有查看内容的权限',
  [Permission.CONTENT_CREATE]: '你没有创建内容的权限',
  [Permission.CONTENT_EDIT]: '你没有编辑内容的权限',
  [Permission.CONTENT_DELETE]: '你没有删除内容的权限',
  [Permission.CONTENT_BIND_ASSET]: '你没有将资产绑定到内容的权限',
  
  // Leads
  [Permission.LEAD_VIEW]: '你没有查看线索的权限',
  [Permission.LEAD_CREATE]: '你没有创建线索的权限',
  [Permission.LEAD_EDIT]: '你没有编辑线索的权限',
  [Permission.LEAD_SUBMIT]: '你没有提交线索的权限',
  [Permission.LEAD_ASSIGN_OWNER]: '仅内部用户可用：负责人分配仅限运营团队',
  [Permission.LEAD_CHANGE_STATUS]: '仅内部用户可用：状态变更仅限运营团队',
  [Permission.LEAD_REQUEST_INFO]: '仅内部用户可用：补充信息请求仅限运营团队',
  
  // Transactions
  [Permission.TRANSACTION_VIEW]: '你没有查看交易的权限',
  [Permission.TRANSACTION_VIEW_DETAILS]: '你没有查看交易详情的权限',
  
  // Payouts
  [Permission.PAYOUT_VIEW]: '你没有查看提现的权限',
  [Permission.PAYOUT_REQUEST]: '你没有申请提现的权限',
  [Permission.PAYOUT_APPROVE]: '仅内部用户可用：提现审批仅限财务团队',
  [Permission.PAYOUT_EXECUTE]: '仅内部用户可用：提现执行仅限财务团队',
  [Permission.PAYOUT_CANCEL]: '仅内部用户可用：提现取消仅限财务团队',
  
  // Disputes
  [Permission.DISPUTE_VIEW]: '你没有查看争议的权限',
  [Permission.DISPUTE_CREATE]: '你没有创建争议的权限',
  [Permission.DISPUTE_UPLOAD_EVIDENCE]: '你没有上传证据的权限',
  [Permission.DISPUTE_RESOLVE]: '仅内部用户可用：争议处理仅限运营团队',
  
  // Statements
  [Permission.STATEMENT_VIEW]: '你没有查看对账单的权限',
  [Permission.STATEMENT_EXPORT]: '你没有导出对账单的权限',
  
  // Profile
  [Permission.PROFILE_VIEW]: '你没有查看资料的权限',
  [Permission.PROFILE_EDIT]: '你没有编辑资料的权限',
  [Permission.PROFILE_KYC_SUBMIT]: '你没有提交 KYC 的权限',
  
  // Notifications
  [Permission.NOTIFICATION_VIEW]: '你没有查看通知的权限',
  [Permission.NOTIFICATION_MARK_READ]: '你没有将通知标为已读的权限',
  
  // Admin
  [Permission.DEV_TOOLS_ACCESS]: '仅内部用户可用：开发工具仅限内部用户',
};

/**
 * Get user-friendly permission denial message
 */
export function getPermissionDenialMessage(permission: Permission): string {
  return PERMISSION_DENIAL_MESSAGES[permission] || '你没有执行此操作的权限';
}
