import React, { useEffect, useRef } from 'react';
import { Modal as AntModal, Button, Space } from 'antd';
import type { ModalProps as AntModalProps } from 'antd';
import { ExclamationCircleOutlined, CloseOutlined } from '@ant-design/icons';

export interface ConfirmModalProps extends Omit<AntModalProps, 'onOk' | 'onCancel'> {
  // Visibility
  visible: boolean;
  onClose: () => void;

  // Content
  title: string;
  message: React.ReactNode;
  consequenceText?: React.ReactNode;

  // Actions
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;

  // Styling
  danger?: boolean;
  icon?: React.ReactNode;

  // Accessibility
  returnFocusRef?: React.RefObject<HTMLElement>;
}

/**
 * ConfirmModal Component
 * 
 * A modal dialog for confirmations with:
 * - Risk-oriented title
 * - Summary and consequence text
 * - Primary confirm button (explicit verb)
 * - Secondary cancel button
 * - Escape key closes dialog
 * - Focus trap within modal
 * - Returns focus to trigger element on close
 * 
 * Meets PRD requirements:
 * - Modal Confirmation Contract for destructive/sensitive actions
 * - Accessibility: Escape, focus trap, focus return (W3C standards)
 * - Clear consequence text for user understanding
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  title,
  message,
  consequenceText,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  icon,
  returnFocusRef,
  ...modalProps
}) => {
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (visible) {
      previousFocusRef.current = (document.activeElement as HTMLElement) || null;
    }
  }, [visible]);

  // Handle modal close with focus return
  const handleClose = () => {
    onClose();

    // Return focus to the element that opened the modal
    setTimeout(() => {
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      } else if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }, 100);
  };

  // Handle confirm action
  const handleConfirm = async () => {
    if (!onConfirm) {
      handleClose();
      return;
    }

    try {
      setConfirmLoading(true);
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setConfirmLoading(false);
    }
  };

  // Default icon based on danger prop
  const defaultIcon = danger ? (
    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
  ) : (
    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
  );

  return (
    <AntModal
      open={visible}
      onCancel={handleClose}
      title={
        <Space size="small">
          {icon || defaultIcon}
          <span>{title}</span>
        </Space>
      }
      closeIcon={<CloseOutlined aria-label="Close modal" />}
      footer={
        <Space size="middle">
          <Button onClick={handleClose} disabled={confirmLoading}>
            {cancelText}
          </Button>
          <Button
            type="primary"
            danger={danger}
            onClick={handleConfirm}
            loading={confirmLoading}
            aria-label={`${confirmText} action`}
          >
            {confirmText}
          </Button>
        </Space>
      }
      centered
      keyboard={true} // Enable Escape key
      maskClosable={false} // Prevent accidental close
      destroyOnClose
      {...modalProps}
    >
      <div className="modal-content">
        <div id="modal-description" className="modal-message">
          {message}
        </div>
        {consequenceText && (
          <div className="modal-consequence" role="note" aria-label="Consequence information">
            {consequenceText}
          </div>
        )}
      </div>
    </AntModal>
  );
};

// CSS for the modal (to be added to global.css)
export const modalStyles = `
.modal-content {
  padding: var(--spacing-md) 0;
}

.modal-message {
  font-size: 14px;
  line-height: 1.5715;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.modal-consequence {
  padding: var(--spacing-sm) var(--spacing-md);
  background: #fff7e6;
  border-left: 3px solid var(--warning-color);
  border-radius: var(--border-radius);
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: var(--spacing-md);
}

.modal-consequence.danger {
  background: #fff2f0;
  border-left-color: var(--error-color);
}

/* Ensure modal is keyboard accessible */
.ant-modal-wrap {
  outline: none;
}

.ant-modal-content:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
`;
