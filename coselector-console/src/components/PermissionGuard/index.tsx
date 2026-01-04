import React from 'react';
import { Alert, Tooltip, Button } from 'antd';
import { LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Permission } from '../../services/permissions';
import { usePermission } from '../../hooks/usePermission';
import './styles.css';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showMessage?: boolean;
  mode?: 'hide' | 'disable' | 'alert';
}

/**
 * PermissionGuard Component
 * 
 * Enforces permission-based UI rendering with three modes:
 * - hide: Completely hides the content if permission is denied
 * - disable: Shows content but disables interaction with tooltip
 * - alert: Shows an alert message instead of content
 * 
 * According to PRD §4.2:
 * "Prototype must visually enforce: controls are disabled (tooltip: 'Internal only')"
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null,
  showMessage = true,
  mode = 'hide',
}) => {
  const { can, denialMessage } = usePermission();

  const hasPermission = can(permission);
  const message = denialMessage(permission);

  // If user has permission, render children normally
  if (hasPermission) {
    return <>{children}</>;
  }

  // Handle different modes when permission is denied
  switch (mode) {
    case 'hide':
      return <>{fallback}</>;

    case 'disable':
      return (
        <Tooltip title={message} placement="top">
          <div className="permission-guard-disabled">
            {React.cloneElement(children as React.ReactElement<any>, {
              disabled: true,
              style: {
                cursor: 'not-allowed',
                opacity: 0.6,
                ...((children as React.ReactElement<any>).props?.style || {}),
              },
            })}
          </div>
        </Tooltip>
      );

    case 'alert':
      return showMessage ? (
        <Alert
          message="Access Restricted"
          description={message}
          type="warning"
          icon={<LockOutlined />}
          showIcon
          className="permission-guard-alert"
        />
      ) : (
        <>{fallback}</>
      );

    default:
      return <>{fallback}</>;
  }
};

interface RestrictedButtonProps {
  permission: Permission;
  children: React.ReactNode;
  onClick?: () => void;
  [key: string]: any;
}

/**
 * RestrictedButton Component
 * 
 * Button that is automatically disabled with tooltip if user lacks permission
 * Follows PRD pattern: "disabled (tooltip: 'Internal only')"
 */
export const RestrictedButton: React.FC<RestrictedButtonProps> = ({
  permission,
  children,
  onClick,
  ...buttonProps
}) => {
  const { can, denialMessage } = usePermission();

  const hasPermission = can(permission);
  const message = denialMessage(permission);

  if (!hasPermission) {
    return (
      <Tooltip title={message} placement="top">
        <Button {...buttonProps} disabled icon={<LockOutlined />}>
          {children}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button {...buttonProps} onClick={onClick}>
      {children}
    </Button>
  );
};

interface RestrictedActionProps {
  permission: Permission;
  children: React.ReactElement;
  tooltip?: string;
}

/**
 * RestrictedAction Component
 * 
 * Wraps any interactive element and disables it with tooltip if permission denied
 */
export const RestrictedAction: React.FC<RestrictedActionProps> = ({
  permission,
  children,
  tooltip,
}) => {
  const { can, denialMessage } = usePermission();

  const hasPermission = can(permission);
  const message = tooltip || denialMessage(permission);

  if (!hasPermission) {
    return (
      <Tooltip title={message} placement="top">
        <span className="permission-guard-restricted-action">
          {React.cloneElement(children as React.ReactElement<any>, {
            disabled: true,
            onClick: undefined,
            style: {
              cursor: 'not-allowed',
              opacity: 0.5,
              ...((children as React.ReactElement<any>).props?.style || {}),
            },
          })}
        </span>
      </Tooltip>
    );
  }

  return children;
};

interface InternalOnlyBadgeProps {
  show?: boolean;
  placement?: 'inline' | 'tooltip';
}

/**
 * InternalOnlyBadge Component
 * 
 * Shows "Internal Only" indicator for restricted features
 */
export const InternalOnlyBadge: React.FC<InternalOnlyBadgeProps> = ({
  show = true,
  placement = 'inline',
}) => {
  if (!show) return null;

  if (placement === 'tooltip') {
    return (
      <Tooltip title="This feature is restricted to internal users only">
        <InfoCircleOutlined className="internal-only-icon" />
      </Tooltip>
    );
  }

  return (
    <span className="internal-only-badge">
      <LockOutlined />
      <span>Internal Only</span>
    </span>
  );
};

export default PermissionGuard;
