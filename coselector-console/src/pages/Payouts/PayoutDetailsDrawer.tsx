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
import { translateActorName, translateEventType, translateStatus, translateText } from '../../utils/i18n';

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
        label: '已申请',
      },
      [PayoutStatus.APPROVED]: {
        color: 'blue',
        icon: <CheckCircleOutlined />,
        label: '已通过',
      },
      [PayoutStatus.PAID]: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        label: '已支付',
      },
      [PayoutStatus.FAILED]: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        label: '失败',
      },
      [PayoutStatus.REJECTED]: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        label: '已拒绝',
      },
      [PayoutStatus.CANCELLED]: {
        color: 'default',
        icon: <StopOutlined />,
        label: '已取消',
      },
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(payout.status);

  // Get failure reason from timeline if status is FAILED
  const failureEvent = payout.timeline.find(
    (event) => event.eventType === 'Status changed to FAILED'
  );
  const failureReason = failureEvent?.description || '未知原因';

  return (
    <Drawer
      title={
        <Space>
          <DollarOutlined />
          提现详情
        </Space>
      }
      placement="right"
      size="large"
      onClose={onClose}
      open={visible}
    >
      {/* Status Alert */}
      {payout.status === PayoutStatus.FAILED && (
        <Alert
          type="error"
          message="付款失败"
          description={translateText(failureReason)}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {payout.status === PayoutStatus.REJECTED && (
        <Alert
          type="warning"
          message="提现已拒绝"
          description={translateText(failureEvent?.description) || '请查看时间线了解详情'}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {payout.status === PayoutStatus.CANCELLED && (
        <Alert
          type="info"
          message="提现已取消"
          description="此提现申请已由用户取消。"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Basic Info */}
      <Descriptions title="提现信息" column={1} bordered size="small">
        <Descriptions.Item label="提现 ID">{payout.id}</Descriptions.Item>
        <Descriptions.Item label="金额">
          <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
            {formatCurrency(payout.amount)}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={statusConfig.color} icon={statusConfig.icon}>
            {statusConfig.label}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="申请时间">{formatDate(payout.requestedAt)}</Descriptions.Item>
        <Descriptions.Item label="通过时间">
          {payout.approvedAt ? formatDate(payout.approvedAt) : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="支付时间">
          {payout.paidAt ? formatDate(payout.paidAt) : '-'}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* Bank Account Details */}
      <Title level={5}>收款账户</Title>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="银行名称">{payout.bankAccount.bankName}</Descriptions.Item>
        <Descriptions.Item label="账户名">
          {payout.bankAccount.accountHolder}
        </Descriptions.Item>
        <Descriptions.Item label="账号">
          {payout.bankAccount.accountNumber}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* Included Transactions */}
      <Title level={5}>
        <Space>
          <FileTextOutlined />
          包含交易（{payout.transactionIds.length}）
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
                查看
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
      <Title level={5}>状态历史</Title>
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
              <Text strong>{translateEventType(event.eventType)}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {formatDate(event.occurredAt)}
              </Text>
              <Text>{translateText(event.description)}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                由 {translateActorName(event.actorName)}（{translateActorName(event.actorType)}）操作
              </Text>
            </Space>
          ),
        }))}
      />
    </Drawer>
  );
};
