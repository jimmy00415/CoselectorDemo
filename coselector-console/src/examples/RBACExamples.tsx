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
import { translateText } from '../utils';

/**
 * Example 1: Using PermissionGuard to conditionally render components
 */
export const Example1_PermissionGuard: React.FC = () => {
  return (
    <div>
      <h3>权限守卫示例</h3>
      
      {/* Hide mode: Component is completely hidden if permission denied */}
      <PermissionGuard permission={Permission.LEAD_ASSIGN_OWNER} mode="hide">
        <Button type="primary">分配负责人（仅运营）</Button>
      </PermissionGuard>

      {/* Disable mode: Component is shown but disabled with tooltip */}
      <PermissionGuard permission={Permission.PAYOUT_APPROVE} mode="disable">
        <Button type="primary">批准提现</Button>
      </PermissionGuard>

      {/* Alert mode: Shows alert message instead of component */}
      <PermissionGuard permission={Permission.DISPUTE_RESOLVE} mode="alert">
        <Button type="primary">解决争议</Button>
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
        批准提现
      </RestrictedButton>

      <RestrictedButton
        permission={Permission.LEAD_CHANGE_STATUS}
        type="default"
        onClick={() => console.log('Status changed')}
      >
        变更状态
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
          分配给 BD 团队
        </a>
      </RestrictedAction>

      <RestrictedAction
        permission={Permission.PAYOUT_EXECUTE}
        tooltip="只有财务团队可以执行提现"
      >
        <Button type="link">执行付款</Button>
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
      <h3>权限 Hook 示例</h3>
      
      {/* Check single permission */}
      {can(Permission.LEAD_ASSIGN_OWNER) && (
        <Button>分配负责人</Button>
      )}

      {/* Check if user cannot perform action */}
      {cannot(Permission.PAYOUT_APPROVE) && (
        <p>你不能批准提现。请联系财务团队。</p>
      )}

      {/* Check multiple permissions (any) */}
      {canAny([Permission.PAYOUT_APPROVE, Permission.PAYOUT_EXECUTE]) && (
        <Button type="primary">管理提现</Button>
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
        <span>负责人分配</span>
        <InternalOnlyBadge show={!can(Permission.LEAD_ASSIGN_OWNER)} />
      </div>

      {/* Show badge as tooltip icon */}
      <div>
        <span>提现批准</span>
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
      <h3>视图预设切换器</h3>
      <ViewPresetSwitcher />
      
      <Divider />
      
      <p>当前视图预设：<strong>{translateText(viewPreset)}</strong></p>
      <p>提示：视图预设仅是界面筛选，不影响权限。</p>
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
      <h3>角色切换器（仅开发）</h3>
      <RoleSwitcher />
      
      <Divider />
      
      <p>当前角色：<strong>{translateText(role)}</strong></p>
      <p style={{ color: 'orange' }}>
        此组件在生产环境中应由“开发工具”开关控制。
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
      <h2>线索审核表单</h2>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Regular fields - all users can see */}
        <div>
          <label>商家名称：</label>
          <input type="text" disabled value="示例商家" style={{ marginLeft: 8 }} />
        </div>

        <div>
          <label>状态：</label>
          <input type="text" disabled value="审核中" style={{ marginLeft: 8 }} />
        </div>

        {/* Internal-only field with permission guard */}
        <PermissionGuard permission={Permission.LEAD_ASSIGN_OWNER} mode="disable">
          <div>
            <label>分配负责人：</label>
            <InternalOnlyBadge show={!can(Permission.LEAD_ASSIGN_OWNER)} />
            <select style={{ marginLeft: 8 }} disabled={!can(Permission.LEAD_ASSIGN_OWNER)}>
              <option>选择 BD 负责人</option>
              <option>BD 团队 A</option>
              <option>BD 团队 B</option>
            </select>
          </div>
        </PermissionGuard>

        <Divider />

        {/* Action buttons with different permission requirements */}
        <Space>
          {/* Available to all users */}
          <Button type="default">查看详情</Button>

          {/* Internal only - restricted buttons */}
          <RestrictedButton
            permission={Permission.LEAD_REQUEST_INFO}
            type="default"
          >
            请求补充信息
          </RestrictedButton>

          <RestrictedButton
            permission={Permission.LEAD_CHANGE_STATUS}
            type="primary"
          >
            通过线索
          </RestrictedButton>

          <RestrictedButton
            permission={Permission.LEAD_CHANGE_STATUS}
            type="primary"
            danger
          >
            拒绝线索
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
        <h2>提现批准模块</h2>
        <p>整个模块仅财务团队可访问。</p>
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
      alert('仅限内部 - 提现批准仅限财务团队');
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
      <Button onClick={handleSubmitPayout}>申请提现</Button>
      <Button onClick={handleApprovePayout} type="primary">批准提现</Button>
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
