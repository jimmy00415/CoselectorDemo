/**
 * RBAC Usage Examples
 * 
 * This file demonstrates how to use the RBAC system throughout the application.
 * These patterns should be followed consistently across all modules.
 */

import React from 'react';
import { Button, Space, Divider } from 'antd';
import { 
  PermissionGuard, 
  RestrictedButton, 
  RestrictedAction,
  InternalOnlyBadge,
  ViewPresetSwitcher,
  RoleSwitcher,
} from '../components';
import { Permission } from '../services/permissions';
import { usePermission } from '../hooks/usePermission';
import { useAuth } from '../contexts/AuthContext';

/**
 * Example 1: Using PermissionGuard to conditionally render components
 */
export const Example1_PermissionGuard: React.FC = () => {
  return (
    <div>
      <h3>Permission Guard Examples</h3>
      
      {/* Hide mode: Component is completely hidden if permission denied */}
      <PermissionGuard permission={Permission.LEAD_ASSIGN_OWNER} mode="hide">
        <Button type="primary">Assign Owner (OPS only)</Button>
      </PermissionGuard>

      {/* Disable mode: Component is shown but disabled with tooltip */}
      <PermissionGuard permission={Permission.PAYOUT_APPROVE} mode="disable">
        <Button type="primary">Approve Payout</Button>
      </PermissionGuard>

      {/* Alert mode: Shows alert message instead of component */}
      <PermissionGuard permission={Permission.DISPUTE_RESOLVE} mode="alert">
        <Button type="primary">Resolve Dispute</Button>
      </PermissionGuard>
    </div>
  );
};

/**
 * Example 2: Using RestrictedButton for simple button permissions
 */
export const Example2_RestrictedButton: React.FC = () => {
  const handleApprove = () => {
    console.log('Payout approved');
  };

  return (
    <Space>
      {/* Button automatically shows lock icon and tooltip when permission denied */}
      <RestrictedButton
        permission={Permission.PAYOUT_APPROVE}
        type="primary"
        onClick={handleApprove}
      >
        Approve Payout
      </RestrictedButton>

      <RestrictedButton
        permission={Permission.LEAD_CHANGE_STATUS}
        type="default"
        onClick={() => console.log('Status changed')}
      >
        Change Status
      </RestrictedButton>
    </Space>
  );
};

/**
 * Example 3: Using RestrictedAction for any interactive element
 */
export const Example3_RestrictedAction: React.FC = () => {
  return (
    <Space direction="vertical">
      {/* Wrap any interactive element */}
      <RestrictedAction permission={Permission.LEAD_ASSIGN_OWNER}>
        <a href="#" onClick={(e) => { e.preventDefault(); console.log('Clicked'); }}>
          Assign to BD Team
        </a>
      </RestrictedAction>

      <RestrictedAction
        permission={Permission.PAYOUT_EXECUTE}
        tooltip="Only Finance team can execute payouts"
      >
        <Button type="link">Execute Payment</Button>
      </RestrictedAction>
    </Space>
  );
};

/**
 * Example 4: Using usePermission hook for conditional logic
 */
export const Example4_UsePermissionHook: React.FC = () => {
  const { can, cannot, canAny, denialMessage } = usePermission();

  return (
    <div>
      <h3>Permission Hook Examples</h3>
      
      {/* Check single permission */}
      {can(Permission.LEAD_ASSIGN_OWNER) && (
        <Button>Assign Owner</Button>
      )}

      {/* Check if user cannot perform action */}
      {cannot(Permission.PAYOUT_APPROVE) && (
        <p>You cannot approve payouts. Please contact Finance team.</p>
      )}

      {/* Check multiple permissions (any) */}
      {canAny([Permission.PAYOUT_APPROVE, Permission.PAYOUT_EXECUTE]) && (
        <Button type="primary">Manage Payouts</Button>
      )}

      {/* Get denial message for display */}
      {cannot(Permission.DISPUTE_RESOLVE) && (
        <p style={{ color: 'red' }}>
          {denialMessage(Permission.DISPUTE_RESOLVE)}
        </p>
      )}
    </div>
  );
};

/**
 * Example 5: Using InternalOnlyBadge to indicate restricted features
 */
export const Example5_InternalOnlyBadge: React.FC = () => {
  const { can } = usePermission();

  return (
    <Space direction="vertical">
      {/* Show badge inline */}
      <div>
        <span>Owner Assignment</span>
        <InternalOnlyBadge show={!can(Permission.LEAD_ASSIGN_OWNER)} />
      </div>

      {/* Show badge as tooltip icon */}
      <div>
        <span>Payout Approval</span>
        <InternalOnlyBadge 
          show={!can(Permission.PAYOUT_APPROVE)} 
          placement="tooltip" 
        />
      </div>
    </Space>
  );
};

/**
 * Example 6: Using ViewPresetSwitcher for UI lens switching
 */
export const Example6_ViewPresetSwitcher: React.FC = () => {
  const { viewPreset } = useAuth();

  return (
    <div>
      <h3>View Preset Switcher</h3>
      <ViewPresetSwitcher />
      
      <Divider />
      
      <p>Current view preset: <strong>{viewPreset}</strong></p>
      <p>Note: View presets are UI filters only and do not affect permissions.</p>
    </div>
  );
};

/**
 * Example 7: Using RoleSwitcher for dev/testing (prototype only)
 */
export const Example7_RoleSwitcher: React.FC = () => {
  const { role } = useAuth();

  return (
    <div>
      <h3>Role Switcher (Dev Only)</h3>
      <RoleSwitcher />
      
      <Divider />
      
      <p>Current role: <strong>{role}</strong></p>
      <p style={{ color: 'orange' }}>
        ⚠️ This component should be gated behind a "Dev Tools" toggle in production.
      </p>
    </div>
  );
};

/**
 * Example 8: Complete form example with mixed permissions
 */
export const Example8_CompleteForm: React.FC = () => {
  const { can } = usePermission();

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2>Lead Review Form</h2>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Regular fields - all users can see */}
        <div>
          <label>Merchant Name:</label>
          <input type="text" disabled value="Example Merchant" style={{ marginLeft: 8 }} />
        </div>

        <div>
          <label>Status:</label>
          <input type="text" disabled value="Under Review" style={{ marginLeft: 8 }} />
        </div>

        {/* Internal-only field with permission guard */}
        <PermissionGuard permission={Permission.LEAD_ASSIGN_OWNER} mode="disable">
          <div>
            <label>Assigned Owner:</label>
            <InternalOnlyBadge show={!can(Permission.LEAD_ASSIGN_OWNER)} />
            <select style={{ marginLeft: 8 }} disabled={!can(Permission.LEAD_ASSIGN_OWNER)}>
              <option>Select BD Owner</option>
              <option>BD Team A</option>
              <option>BD Team B</option>
            </select>
          </div>
        </PermissionGuard>

        <Divider />

        {/* Action buttons with different permission requirements */}
        <Space>
          {/* Available to all users */}
          <Button type="default">View Details</Button>

          {/* Internal only - restricted buttons */}
          <RestrictedButton
            permission={Permission.LEAD_REQUEST_INFO}
            type="default"
          >
            Request More Info
          </RestrictedButton>

          <RestrictedButton
            permission={Permission.LEAD_CHANGE_STATUS}
            type="primary"
          >
            Approve Lead
          </RestrictedButton>

          <RestrictedButton
            permission={Permission.LEAD_CHANGE_STATUS}
            type="primary"
            danger
          >
            Reject Lead
          </RestrictedButton>
        </Space>
      </Space>
    </div>
  );
};

/**
 * Example 9: Module-level permission check
 */
export const Example9_ModuleLevelGuard: React.FC = () => {
  return (
    <PermissionGuard 
      permission={Permission.PAYOUT_APPROVE}
      mode="alert"
      showMessage={true}
    >
      <div>
        <h2>Payout Approval Module</h2>
        <p>This entire module is only accessible to Finance team.</p>
        {/* Rest of module content */}
      </div>
    </PermissionGuard>
  );
};

/**
 * Example 10: Programmatic permission checks in business logic
 */
export const Example10_ProgrammaticChecks: React.FC = () => {
  const { can, denialMessage } = usePermission();

  const handleSubmitPayout = async () => {
    // Check permission before executing business logic
    if (!can(Permission.PAYOUT_REQUEST)) {
      alert(denialMessage(Permission.PAYOUT_REQUEST));
      return;
    }

    try {
      // Execute business logic
      console.log('Submitting payout request...');
      // await submitPayoutRequest();
    } catch (error) {
      console.error('Failed to submit payout:', error);
    }
  };

  const handleApprovePayout = async () => {
    // Check permission before executing sensitive operation
    if (!can(Permission.PAYOUT_APPROVE)) {
      alert('Internal only - Payout approval is restricted to Finance team');
      return;
    }

    try {
      console.log('Approving payout...');
      // await approvePayout();
    } catch (error) {
      console.error('Failed to approve payout:', error);
    }
  };

  return (
    <Space>
      <Button onClick={handleSubmitPayout}>Request Payout</Button>
      <Button onClick={handleApprovePayout} type="primary">Approve Payout</Button>
    </Space>
  );
};

export default {
  Example1_PermissionGuard,
  Example2_RestrictedButton,
  Example3_RestrictedAction,
  Example4_UsePermissionHook,
  Example5_InternalOnlyBadge,
  Example6_ViewPresetSwitcher,
  Example7_RoleSwitcher,
  Example8_CompleteForm,
  Example9_ModuleLevelGuard,
  Example10_ProgrammaticChecks,
};
