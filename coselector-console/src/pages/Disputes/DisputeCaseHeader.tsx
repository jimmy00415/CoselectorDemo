import React from 'react';
import { Card, Row, Col, Statistic, Tag, Progress, Space, Typography, Divider } from 'antd';
import {
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import type { DisputeCase } from '../../types';
import { DisputeStatus } from '../../types/enums';
import { formatDate } from '../../utils/format';

const { Text, Title } = Typography;

interface DisputeCaseHeaderProps {
  disputeCase: DisputeCase;
}

export const DisputeCaseHeader: React.FC<DisputeCaseHeaderProps> = ({ disputeCase }) => {
  // Calculate days until deadline
  const getDaysUntilDeadline = (): number => {
    if (!disputeCase.deadlineAt) return 999;
    const now = new Date();
    const deadline = new Date(disputeCase.deadlineAt);
    const diffMs = deadline.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysUntilDeadline();

  // Get urgency level
  const getUrgencyConfig = () => {
    if (daysRemaining <= 0) {
      return {
        color: 'red',
        text: 'OVERDUE',
        icon: <ExclamationCircleOutlined />,
        pulse: true,
      };
    } else if (daysRemaining <= 2) {
      return {
        color: 'red',
        text: `URGENT - ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`,
        icon: <ClockCircleOutlined />,
        pulse: false,
      };
    } else if (daysRemaining <= 7) {
      return {
        color: 'orange',
        text: `Action Soon - ${daysRemaining} days left`,
        icon: <ClockCircleOutlined />,
        pulse: false,
      };
    } else {
      return {
        color: 'green',
        text: 'On Track',
        icon: <CheckCircleOutlined />,
        pulse: false,
      };
    }
  };

  const urgency = getUrgencyConfig();

  // Get status color
  const getStatusColor = (status: DisputeStatus): string => {
    switch (status) {
      case DisputeStatus.OPEN:
        return 'blue';
      case DisputeStatus.WAITING:
      case DisputeStatus.WAITING_FOR_RESPONSE:
        return 'orange';
      case DisputeStatus.RESOLVED:
        return 'green';
      default:
        return 'default';
    }
  };

  // Calculate evidence progress
  const evidenceProgress = disputeCase.evidence.length > 0 
    ? (disputeCase.evidence.filter(e => e).length / Math.max(disputeCase.requiredEvidenceCount || 3, disputeCase.evidence.length)) * 100
    : 0;

  return (
    <Card>
      <Row gutter={[24, 16]} align="middle">
        <Col flex="auto">
          <Space direction="vertical" size="small">
            <Space>
              <Title level={4} style={{ margin: 0 }}>
                Dispute Case #{disputeCase.id.substring(0, 8)}
              </Title>
              <Tag color={getStatusColor(disputeCase.status)}>{disputeCase.status}</Tag>
            </Space>
            <Space split={<Divider type="vertical" />}>
              <Text type="secondary">
                <strong>Type:</strong> {disputeCase.type || 'Transaction Dispute'}
              </Text>
              <Text type="secondary">
                <strong>Opened:</strong> {formatDate(disputeCase.openedAt)}
              </Text>
              {disputeCase.resolvedAt && (
                <Text type="secondary">
                  <strong>Resolved:</strong> {formatDate(disputeCase.resolvedAt)}
                </Text>
              )}
            </Space>
          </Space>
        </Col>

        {disputeCase.status !== DisputeStatus.RESOLVED && disputeCase.deadlineAt && (
          <Col>
            <Card size="small" style={{ backgroundColor: urgency.color === 'red' ? '#fff1f0' : urgency.color === 'orange' ? '#fffbe6' : '#f6ffed' }}>
              <Space direction="vertical" size="small" align="center">
                <Tag
                  color={urgency.color}
                  icon={urgency.icon}
                  style={{
                    fontSize: 14,
                    padding: '4px 12px',
                    animation: urgency.pulse ? 'pulse 1.5s infinite' : 'none',
                  }}
                >
                  {urgency.text}
                </Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Deadline: {formatDate(disputeCase.deadlineAt)}
                </Text>
              </Space>
            </Card>
          </Col>
        )}
      </Row>

      <Divider style={{ margin: '16px 0' }} />

      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="Evidence Uploaded"
            value={disputeCase.evidence.filter(e => e).length}
            suffix={`/ ${disputeCase.requiredEvidenceCount || 3}`}
            prefix={<FileTextOutlined />}
          />
          <Progress
            percent={evidenceProgress}
            strokeColor={evidenceProgress === 100 ? '#52c41a' : '#1890ff'}
            showInfo={false}
            style={{ marginTop: 8 }}
          />
        </Col>

        <Col span={8}>
          <Statistic
            title="Messages"
            value={disputeCase.messageCount || 0}
            prefix={<MessageOutlined />}
          />
        </Col>

        <Col span={8}>
          <Statistic
            title="Timeline Events"
            value={disputeCase.timeline.length}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
      </Row>

      {daysRemaining <= 0 && disputeCase.status !== DisputeStatus.RESOLVED && (
        <div style={{ marginTop: 16 }}>
          <Tag color="red" icon={<ExclamationCircleOutlined />} style={{ width: '100%', padding: '8px 16px', fontSize: 14 }}>
            ⚠️ Deadline has passed. Please submit your response immediately to avoid automatic case closure.
          </Tag>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </Card>
  );
};
