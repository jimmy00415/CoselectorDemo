import React from 'react';
import { Space, Button, Dropdown, Typography, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, LockOutlined } from '@ant-design/icons';
import { Permission } from '../../services/permissions';
import { usePermission } from '../../hooks/usePermission';

const { Text } = Typography;

export interface BulkAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  permission?: Permission; // Permission required for this action
  tooltip?: string; // Custom tooltip (default: permission denial message)
  hidden?: boolean; // If true, action is completely hidden
  requireSelection?: boolean; // If true, disabled when no items selected (default: true)
}

interface ActionBarProps {
  // Primary action
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    permission?: Permission; // Permission required
    tooltip?: string; // Custom tooltip
    hidden?: boolean; // If true, button is completely hidden
  };

  // Secondary actions
  secondaryActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    permission?: Permission; // Permission required
    tooltip?: string; // Custom tooltip
    hidden?: boolean; // If true, action is completely hidden
  }>;

  // Bulk actions (shown when items selected)
  bulkActions?: BulkAction[];
  selectedCount?: number;
  onClearSelection?: () => void;

  // Additional content (e.g., filters, search)
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;

  // Styling
  className?: string;
}

/**
 * ActionBar Component
 * 
 * A flexible action bar for table pages with:
 * - Primary action button
 * - Secondary actions
 * - Bulk actions when items are selected
 * - Custom left/right content slots
 * - Responsive design
 * 
 * Meets PRD requirements:
 * - Action Bar above tables (primary actions + bulk actions)
 * - Clear visual hierarchy
 * - Consistent placement across modules
 */
export const ActionBar: React.FC<ActionBarProps> = ({
  primaryAction,
  secondaryActions = [],
  bulkActions = [],
  selectedCount = 0,
  onClearSelection,
  leftContent,
  rightContent,
  className = '',
}) => {
  const { can, denialMessage } = usePermission();
  // Filter bulk actions by permission and hidden flag
  const visibleBulkActions = bulkActions.filter((action) => {
    if (action.hidden) return false;
    if (action.permission && !can(action.permission)) return false;
    return true;
  });

  // Convert bulk actions to menu items
  const bulkActionMenuItems: MenuProps['items'] = visibleBulkActions.map((action) => {
    const hasPermission = !action.permission || can(action.permission);
    const isDisabled = action.disabled || !hasPermission || (action.requireSelection !== false && selectedCount === 0);
    const tooltipMessage = action.tooltip || (action.permission ? denialMessage(action.permission) : undefined);

    return {
      key: action.key,
      label: action.label,
      icon: isDisabled && !hasPermission ? <LockOutlined /> : action.icon,
      onClick: isDisabled ? undefined : action.onClick,
      danger: action.danger,
      disabled: isDisabled,
      title: isDisabled && tooltipMessage ? tooltipMessage : undefined,
    };
  });

  // Render bulk actions section
  const renderBulkActions = () => {
    if (selectedCount === 0) return null;

    return (
      <div className="action-bar-bulk">
        <Space size="middle" align="center">
          <Text strong>
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
          </Text>
          {visibleBulkActions.length > 0 && (
            <>
              {visibleBulkActions.slice(0, 2).map((action) => {
                const hasPermission = !action.permission || can(action.permission);
                const isDisabled = action.disabled || !hasPermission || (action.requireSelection !== false && selectedCount === 0);
                const tooltipMessage = action.tooltip || (action.permission ? denialMessage(action.permission) : undefined);

                const button = (
                  <Button
                    key={action.key}
                    icon={isDisabled && !hasPermission ? <LockOutlined /> : action.icon}
                    onClick={isDisabled ? undefined : action.onClick}
                    danger={action.danger}
                    disabled={isDisabled}
                    aria-label={action.label}
                  >
                    {action.label}
                  </Button>
                );

                return isDisabled && tooltipMessage ? (
                  <Tooltip key={action.key} title={tooltipMessage}>
                    {button}
                  </Tooltip>
                ) : button;
              })}
              {visibleBulkActions.length > 2 && (
                <Dropdown menu={{ items: bulkActionMenuItems.slice(2) }} trigger={['click']}>
                  <Button>
                    More <DownOutlined />
                  </Button>
                </Dropdown>
              )}
            </>
          )}
          {onClearSelection && (
            <Button type="link" onClick={onClearSelection}>
              Clear Selection
            </Button>
          )}
        </Space>
      </div>
    );
  };

  // Render normal actions section
  const renderNormalActions = () => {
    if (selectedCount > 0) return null;

    return (
      <div className="action-bar-normal">
        <div className="action-bar-left">
          {leftContent}
        </div>
        <div className="action-bar-right">
          <Space size="small">
            {rightContent}
            {secondaryActions.filter((action) => !action.hidden && (!action.permission || can(action.permission))).map((action, index) => {
              const hasPermission = !action.permission || can(action.permission);
              const isDisabled = action.disabled || !hasPermission;
              const tooltipMessage = action.tooltip || (action.permission ? denialMessage(action.permission) : undefined);

              const button = (
                <Button
                  key={index}
                  icon={isDisabled && !hasPermission ? <LockOutlined /> : action.icon}
                  onClick={isDisabled ? undefined : action.onClick}
                  disabled={isDisabled}
                  aria-label={action.label}
                >
                  {action.label}
                </Button>
              );

              return isDisabled && tooltipMessage ? (
                <Tooltip key={index} title={tooltipMessage}>
                  {button}
                </Tooltip>
              ) : button;
            })}
            {primaryAction && !primaryAction.hidden && (!primaryAction.permission || can(primaryAction.permission)) && (() => {
              const hasPermission = !primaryAction.permission || can(primaryAction.permission);
              const isDisabled = primaryAction.disabled || !hasPermission;
              const tooltipMessage = primaryAction.tooltip || (primaryAction.permission ? denialMessage(primaryAction.permission) : undefined);

              const button = (
                <Button
                  type="primary"
                  icon={isDisabled && !hasPermission ? <LockOutlined /> : primaryAction.icon}
                  onClick={isDisabled ? undefined : primaryAction.onClick}
                  disabled={isDisabled}
                  aria-label={primaryAction.label}
                >
                  {primaryAction.label}
                </Button>
              );

              return isDisabled && tooltipMessage ? (
                <Tooltip title={tooltipMessage}>
                  {button}
                </Tooltip>
              ) : button;
            })()}
          </Space>
        </div>
      </div>
    );
  };

  return (
    <div className={`action-bar ${className}`}>
      {renderBulkActions()}
      {renderNormalActions()}
    </div>
  );
};

// CSS for the action bar (to be added to global.css)
export const actionBarStyles = `
.action-bar {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.action-bar-normal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.action-bar-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.action-bar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.action-bar-bulk {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: #e6f7ff;
  border-radius: var(--border-radius);
}

/* Responsive */
@media (max-width: 768px) {
  .action-bar-normal {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-bar-left,
  .action-bar-right {
    width: 100%;
    justify-content: flex-start;
  }
  
  .action-bar-right {
    flex-wrap: wrap;
  }
}
`;
