import React from 'react';
import { Space, Button, Dropdown, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface BulkAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionBarProps {
  // Primary action
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  };

  // Secondary actions
  secondaryActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
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
  // Convert bulk actions to menu items
  const bulkActionMenuItems: MenuProps['items'] = bulkActions.map((action) => ({
    key: action.key,
    label: action.label,
    icon: action.icon,
    onClick: action.onClick,
    danger: action.danger,
    disabled: action.disabled,
  }));

  // Render bulk actions section
  const renderBulkActions = () => {
    if (selectedCount === 0) return null;

    return (
      <div className="action-bar-bulk">
        <Space size="middle" align="center">
          <Text strong>
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
          </Text>
          {bulkActions.length > 0 && (
            <>
              {bulkActions.slice(0, 2).map((action) => (
                <Button
                  key={action.key}
                  icon={action.icon}
                  onClick={action.onClick}
                  danger={action.danger}
                  disabled={action.disabled}
                  aria-label={action.label}
                >
                  {action.label}
                </Button>
              ))}
              {bulkActions.length > 2 && (
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
            {secondaryActions.map((action, index) => (
              <Button
                key={index}
                icon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                aria-label={action.label}
              >
                {action.label}
              </Button>
            ))}
            {primaryAction && (
              <Button
                type="primary"
                icon={primaryAction.icon}
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                aria-label={primaryAction.label}
              >
                {primaryAction.label}
              </Button>
            )}
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
