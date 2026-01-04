import React from 'react';
import { Empty, Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    type?: 'primary' | 'default';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * EmptyState Component
 * 
 * A component for displaying empty states with:
 * - Custom icon
 * - Title and description
 * - Primary and secondary actions
 * 
 * Meets PRD requirements:
 * - Empty states with clear CTAs
 * - Getting started guidance for new users
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <InboxOutlined />,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <Empty
        image={<div className="empty-state-icon">{icon}</div>}
        description={
          <div>
            <div className="empty-state-title">{title}</div>
            {description && (
              <div className="empty-state-description">{description}</div>
            )}
          </div>
        }
      >
        {(action || secondaryAction) && (
          <div style={{ marginTop: 16 }}>
            {action && (
              <Button
                type={action.type || 'primary'}
                onClick={action.onClick}
                aria-label={action.label}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                style={{ marginLeft: 8 }}
                onClick={secondaryAction.onClick}
                aria-label={secondaryAction.label}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </Empty>
    </div>
  );
};
