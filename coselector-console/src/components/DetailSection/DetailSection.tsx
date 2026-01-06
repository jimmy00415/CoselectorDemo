import React from 'react';
import { Card, Tag, Space, Button, Row, Col, Typography, Divider, Image } from 'antd';
import { EditOutlined, PaperClipOutlined, FileImageOutlined } from '@ant-design/icons';
import { Permission } from '../../services/permissions';
import { usePermission } from '../../hooks/usePermission';
import './styles.css';

const { Title, Text } = Typography;

export interface DetailField {
  label: string;
  value: React.ReactNode;
  span?: number; // Column span (default: 12 for 2-column grid)
  fullWidth?: boolean; // If true, takes full row
}

export interface DetailAttachment {
  id: string;
  name: string;
  url: string;
  type?: 'image' | 'document';
  size?: number;
}

interface DetailSectionProps {
  // Header
  title: string;
  status?: {
    label: string;
    color: 'default' | 'processing' | 'success' | 'error' | 'warning';
  };
  subtitle?: string;

  // Fields
  fields: DetailField[];

  // Attachments/Evidence
  attachments?: DetailAttachment[];
  showAttachments?: boolean;

  // Edit action
  editable?: boolean;
  onEdit?: () => void;
  editPermission?: Permission;
  editTooltip?: string;

  // Styling
  className?: string;
  bordered?: boolean;
}

/**
 * DetailSection Component
 * 
 * Per Sprint 1 §4.4: Consistent Info Block
 * 
 * A standard read-only info block used in Lead Detail and Admin review:
 * - Title + status chip
 * - 2-column grid for key fields
 * - Evidence/attachments area
 * - Inline Edit button (permission-based)
 * 
 * Features:
 * - Responsive 2-column layout
 * - Permission-aware edit button
 * - Attachment preview
 * - Status chip with colors
 * - Flexible field rendering
 */
export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  status,
  subtitle,
  fields,
  attachments = [],
  showAttachments = true,
  editable = false,
  onEdit,
  editPermission,
  editTooltip,
  className = '',
  bordered = true,
}) => {
  const { can, denialMessage } = usePermission();

  const hasEditPermission = !editPermission || can(editPermission);
  const canEdit = editable && onEdit && hasEditPermission;
  const editDisabledMessage = editTooltip || (editPermission ? denialMessage(editPermission) : undefined);

  // Render field value
  const renderFieldValue = (value: React.ReactNode) => {
    if (value === null || value === undefined || value === '') {
      return <Text type="secondary">—</Text>;
    }
    return value;
  };

  return (
    <Card 
      className={`detail-section ${className}`}
      bordered={bordered}
    >
      {/* Header */}
      <div className="detail-section-header">
        <div className="detail-section-title-area">
          <Space align="center">
            <Title level={4} style={{ margin: 0 }}>
              {title}
            </Title>
            {status && (
              <Tag color={status.color}>{status.label}</Tag>
            )}
          </Space>
          {subtitle && (
            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
              {subtitle}
            </Text>
          )}
        </div>
        
        {canEdit && (
          <Button
            icon={<EditOutlined />}
            onClick={onEdit}
            type="link"
          >
            Edit
          </Button>
        )}
        
        {editable && !hasEditPermission && editDisabledMessage && (
          <Button
            icon={<EditOutlined />}
            type="link"
            disabled
            title={editDisabledMessage}
          >
            Edit
          </Button>
        )}
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Fields Grid */}
      <Row gutter={[24, 16]} className="detail-section-fields">
        {fields.map((field, index) => (
          <Col
            key={index}
            xs={24}
            sm={field.fullWidth ? 24 : field.span || 12}
            className="detail-section-field"
          >
            <div className="detail-field-label">
              <Text strong>{field.label}</Text>
            </div>
            <div className="detail-field-value">
              {renderFieldValue(field.value)}
            </div>
          </Col>
        ))}
      </Row>

      {/* Attachments/Evidence */}
      {showAttachments && attachments.length > 0 && (
        <>
          <Divider style={{ margin: '16px 0' }} />
          <div className="detail-section-attachments">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>
                <PaperClipOutlined /> Attachments ({attachments.length})
              </Text>
              <Space wrap size="middle">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="detail-attachment-item">
                    {attachment.type === 'image' ? (
                      <Image
                        src={attachment.url}
                        alt={attachment.name}
                        width={80}
                        height={80}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                        preview={{
                          mask: <FileImageOutlined />,
                        }}
                      />
                    ) : (
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        <Space>
                          <PaperClipOutlined />
                          <Text ellipsis style={{ maxWidth: 200 }}>
                            {attachment.name}
                          </Text>
                        </Space>
                      </a>
                    )}
                  </div>
                ))}
              </Space>
            </Space>
          </div>
        </>
      )}
    </Card>
  );
};
