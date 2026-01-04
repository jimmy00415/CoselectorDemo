import React from 'react';
import {
  Drawer,
  Descriptions,
  Timeline,
  Tag,
  Space,
  Divider,
  Alert,
  Button,
  List,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { Payout } from '../../types';
import { PayoutStatus } from '../../types/enums';
import { formatDate, formatCurrency } from '../../utils/format';

const { Title, Text } = Typography;

interface PayoutDetailsDrawerProps {
  visible: boolean;
  payout: Payout | null;
  onClose: () => void;
  onViewTransaction: (transactionId: string) => void;
}

export const PayoutDetailsDrawer: React.FC<PayoutDetailsDrawerProps> = ({
  visible,
  payout,
  onClose,
  onViewTransaction,
}) => {
  if (!payout) return null;

  const getStatusConfig = (status: PayoutStatus) => {
    const configs: Record<
      PayoutStatus,
      { color: string; icon: React.ReactNode; label: string }
    > = {
      [PayoutStatus.REQUESTED]: {
        color: 'orange',
        icon: <ClockCircleOutlined />,
        label: 'Requested',
      },
      [PayoutStatus.APPROVED]: {
        color: 'blue',
        icon: <CheckCircleOutlined />,
        label: 'Approved',
      },
      [PayoutStatus.PAID]: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        label: 'Paid',
      },
      [PayoutStatus.FAILED]: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        label: 'Failed',
      },
      [PayoutStatus.REJECTED]: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        label: 'Rejected',
      },
      [PayoutStatus.CANCELLED]: {
        color: 'default',
        icon: <StopOutlined />,
        label: 'Cancelled',
      },
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(payout.status);

  // Get failure reason from timeline if status is FAILED
  const failureEvent = payout.timeline.find(
    (event) => event.eventType === 'Status changed to FAILED'
  );
  const failureReason = failureEvent?.description || 'Unknown reason';

  return (
    <Drawer
      title={
        <Space>
          <DollarOutlined />
          Payout Details
        </Space>
      }
      placement="right"
      width={500}
      onClose={onClose}
      open={visible}
    >
      {/* Status Alert */}
      {payout.status === PayoutStatus.FAILED && (
        <Alert
          type="error"
          message="Payment Failed"
          description={failureReason}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {payout.status === PayoutStatus.REJECTED && (
        <Alert
          type="warning"
          message="Payout Rejected"
          description={failureEvent?.description || 'See timeline for details'}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {payout.status === PayoutStatus.CANCELLED && (
        <Alert
          type="info"
          message="Payout Cancelled"
          description="This payout request was cancelled by the user."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Basic Info */}
      <Descriptions title="Payout Information" column={1} bordered size="small">
        <Descriptions.Item label="Payout ID">{payout.id}</Descriptions.Item>
        <Descriptions.Item label="Amount">
          <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
            {formatCurrency(payout.amount)}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={statusConfig.color} icon={statusConfig.icon}>
            {statusConfig.label}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Requested At">{formatDate(payout.requestedAt)}</Descriptions.Item>
        <Descriptions.Item label="Approved At">
          {payout.approvedAt ? formatDate(payout.approvedAt) : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Paid At">
          {payout.paidAt ? formatDate(payout.paidAt) : '-'}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* Bank Account Details */}
      <Title level={5}>Destination Account</Title>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Bank Name">{payout.bankAccount.bankName}</Descriptions.Item>
        <Descriptions.Item label="Account Holder">
          {payout.bankAccount.accountHolder}
        </Descriptions.Item>
        <Descriptions.Item label="Account Number">
          {payout.bankAccount.accountNumber}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* Included Transactions */}
      <Title level={5}>
        <Space>
          <FileTextOutlined />
          Included Transactions ({payout.transactionIds.length})
        </Space>
      </Title>
      <List
        size="small"
        bordered
        dataSource={payout.transactionIds}
        renderItem={(transactionId) => (
          <List.Item
            actions={[
              <Button
                type="link"
                size="small"
                onClick={() => onViewTransaction(transactionId)}
                key="view"
              >
                View
              </Button>,
            ]}
          >
            <Text code>{transactionId}</Text>
          </List.Item>
        )}
        style={{ maxHeight: '200px', overflowY: 'auto' }}
      />

      <Divider />

      {/* Timeline */}
      <Title level={5}>Status History</Title>
      <Timeline
        items={payout.timeline.map((event) => ({
          color:
            event.eventType.includes('PAID') || event.eventType.includes('Approved')
              ? 'green'
              : event.eventType.includes('FAILED') || event.eventType.includes('Rejected')
              ? 'red'
              : 'blue',
          children: (
            <Space direction="vertical" size={0}>
              <Text strong>{event.eventType}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatDate(event.occurredAt)}
              </Text>
              <Text>{event.description}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                by {event.actorName} ({event.actorType})
              </Text>
            </Space>
          ),
        }))}
      />
    </Drawer>
  );
};
