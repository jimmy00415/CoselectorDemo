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
import { translateStatus, translateText } from '../../utils/i18n';

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
        text: '已逾期',
        icon: <ExclamationCircleOutlined />,
        pulse: true,
      };
    } else if (daysRemaining <= 2) {
      return {
        color: 'red',
        text: `紧急 - 剩余 ${daysRemaining} 天`,
        icon: <ClockCircleOutlined />,
        pulse: false,
      };
    } else if (daysRemaining <= 7) {
      return {
        color: 'orange',
        text: `尽快处理 - 剩余 ${daysRemaining} 天`,
        icon: <ClockCircleOutlined />,
        pulse: false,
      };
    } else {
      return {
        color: 'green',
        text: '正常',
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
                争议案件 #{disputeCase.id.substring(0, 8)}
              </Title>
              <Tag color={getStatusColor(disputeCase.status)}>{translateStatus(disputeCase.status)}</Tag>
            </Space>
            <Space split={<Divider type="vertical" />}>
              <Text type="secondary">
                <strong>类型：</strong> {translateText(disputeCase.type) || '交易争议'}
              </Text>
              <Text type="secondary">
                <strong>打开：</strong> {formatDate(disputeCase.openedAt)}
              </Text>
              {disputeCase.resolvedAt && (
                <Text type="secondary">
                  <strong>解决：</strong> {formatDate(disputeCase.resolvedAt)}
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
                  截止时间：{formatDate(disputeCase.deadlineAt)}
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
            title="已上传证据"
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
            title="消息"
            value={disputeCase.messageCount || 0}
            prefix={<MessageOutlined />}
          />
        </Col>

        <Col span={8}>
          <Statistic
            title="时间线事件"
            value={disputeCase.timeline.length}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
      </Row>

      {daysRemaining <= 0 && disputeCase.status !== DisputeStatus.RESOLVED && (
        <div style={{ marginTop: 16 }}>
          <Tag color="red" icon={<ExclamationCircleOutlined />} style={{ width: '100%', padding: '8px 16px', fontSize: 14 }}>
            截止时间已过。请立即提交回复，以免案件自动关闭。
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
