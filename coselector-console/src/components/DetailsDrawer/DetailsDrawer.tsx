import React, { useEffect, useRef, useCallback } from 'react';
import { Drawer, Collapse, Space, Divider } from 'antd';
import type { DrawerProps } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

export interface DrawerSection {
  key: string;
  title: string;
  content: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  extra?: React.ReactNode;
}

interface DetailsDrawerProps extends Omit<DrawerProps, 'onClose'> {
  // Core props
  visible: boolean;
  onClose: () => void;
  title: string;

  // Content
  sections: DrawerSection[];
  
  // Header actions
  headerActions?: React.ReactNode;

  // Footer actions
  footerActions?: React.ReactNode;

  // Accessibility
  ariaLabel?: string;
  returnFocusRef?: React.RefObject<HTMLElement>;
}

/**
 * DetailsDrawer Component
 * 
 * A right-side drawer for displaying detailed information with:
 * - Accordion sections for progressive disclosure
 * - Focus management for accessibility
 * - Escape key to close
 * - Focus trap within drawer
 * - Returns focus to trigger element on close
 * 
 * Meets PRD requirements:
 * - Details Drawer (right-side) for "trace / evidence / detail"
 * - Sections (accordion inside drawer) for progressive disclosure
 * - Accessibility: Escape closes, focus trap, focus return
 */
export const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  visible,
  onClose,
  title,
  sections,
  headerActions,
  footerActions,
  width = 720,
  placement = 'right',
  ariaLabel: _ariaLabel,
  returnFocusRef,
  ...drawerProps
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element when drawer opens
  useEffect(() => {
    if (visible) {
      previousFocusRef.current = (document.activeElement as HTMLElement) || null;
    }
  }, [visible]);

  // Handle drawer close with focus return
  const handleClose = useCallback(() => {
    onClose();

    // Return focus to the element that opened the drawer
    setTimeout(() => {
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      } else if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }, 100);
  }, [onClose, returnFocusRef]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (visible && event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [visible, handleClose]);

  // Focus trap: keep focus within drawer when open
  useEffect(() => {
    if (!visible || !drawerRef.current) return;

    const drawerElement = drawerRef.current;
    const focusableElements = drawerElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus first element when drawer opens
    setTimeout(() => firstFocusable?.focus(), 100);

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [visible]);

  // Render drawer header with custom actions
  const renderHeader = () => (
    <div className="drawer-header-custom">
      <div className="drawer-header-title">
        <h3>{title}</h3>
      </div>
      {headerActions && (
        <>
          <Divider type="vertical" />
          <Space size="small">{headerActions}</Space>
        </>
      )}
    </div>
  );

  // Render sections with collapsible panels
  const renderSections = () => {
    const collapsibleSections = sections.filter((s) => s.collapsible !== false);
    const staticSections = sections.filter((s) => s.collapsible === false);

    return (
      <>
        {/* Static sections (non-collapsible) */}
        {staticSections.map((section) => (
          <div key={section.key} className="drawer-section">
            <div className="drawer-section-header">
              <h4 className="drawer-section-title">{section.title}</h4>
              {section.extra && <div className="drawer-section-extra">{section.extra}</div>}
            </div>
            <div className="drawer-section-content">{section.content}</div>
          </div>
        ))}

        {/* Collapsible sections */}
        {collapsibleSections.length > 0 && (
          <Collapse
            defaultActiveKey={collapsibleSections
              .filter((s) => s.defaultOpen !== false)
              .map((s) => s.key)}
            ghost
            expandIconPosition="end"
          >
            {collapsibleSections.map((section) => (
              <Panel
                key={section.key}
                header={section.title}
                extra={section.extra}
              >
                {section.content}
              </Panel>
            ))}
          </Collapse>
        )}
      </>
    );
  };

  // Render footer with actions
  const renderFooter = () => {
    if (!footerActions) return null;

    return (
      <div className="drawer-footer">
        <Space size="middle">{footerActions}</Space>
      </div>
    );
  };

  return (
    <Drawer
      open={visible}
      onClose={handleClose}
      title={renderHeader()}
      width={width}
      placement={placement}
      footer={renderFooter()}
      closeIcon={<CloseOutlined aria-label="Close drawer" />}
      destroyOnClose
      keyboard={true} // Enable Escape key
      maskClosable={true}
      className="details-drawer"
      {...drawerProps}
    >
      <div className="drawer-body-content">{renderSections()}</div>
    </Drawer>
  );
};

// CSS for the drawer (to be added to global.css)
export const drawerStyles = `
.drawer-header-custom {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.drawer-header-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.drawer-section {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.drawer-section:last-child {
  border-bottom: none;
}

.drawer-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.drawer-section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.drawer-section-content {
  color: var(--text-primary);
}

.drawer-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background: var(--bg-container);
  display: flex;
  justify-content: flex-end;
}

.details-drawer .ant-drawer-body {
  padding: 0;
}

.drawer-body-content {
  padding: var(--spacing-md) 0;
}
`;
