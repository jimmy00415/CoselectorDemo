import { Drawer, Collapse, Descriptions, Tag, Space, Typography, Alert, Divider } from 'antd';
import { 
  LinkOutlined, 
  DollarOutlined, 
  LockOutlined, 
  WarningOutlined 
} from '@ant-design/icons';
import { Transaction } from '../../types';
import { EarningsState, TransactionSource, ReversalReason } from '../../types/enums';
import { formatDate, formatCurrency } from '../../utils';
import { stateColors } from './config';

/**
 * TransactionTraceDrawer Component
 * Per PRD §7.5.3: Right-side drawer with accordion sections showing:
 * - Attribution Evidence (touchpoint, asset, channel)
 * - Commission Breakdown (base, rate, adjustments)
 * - Locking Policy (lock_end_at, policy label)
 * - Reversal Reason (if reversed)
 * 
 * Critical: Graceful fallback if referenced data (asset, lead) is unavailable
 */

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface TransactionTraceDrawerProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

// Mock data for demonstration - in production, would fetch related entities
const getAssetName = (assetId: string): string => {
  // In production: fetch from mockApi.assets.getById(assetId)
  return `Asset ${assetId.substring(0, 8)}`;
};

const getReversalReasonLabel = (reason?: ReversalReason): string => {
  if (!reason) return 'Unknown';
  
  const labels: Record<ReversalReason, string> = {
    [ReversalReason.REFUND]: 'Customer Refund',
    [ReversalReason.DISPUTE]: 'Dispute',
    [ReversalReason.DISPUTE_CHARGEBACK]: 'Dispute/Chargeback',
    [ReversalReason.FRAUD]: 'Fraud',
    [ReversalReason.FRAUD_HOLD]: 'Fraud Hold',
    [ReversalReason.ORDER_VOID_CANCEL]: 'Order Void/Cancel',
    [ReversalReason.SYSTEM_REATTRIBUTED]: 'System Reattributed',
  };
  
  return labels[reason] || reason;
};

export const TransactionTraceDrawer: React.FC<TransactionTraceDrawerProps> = ({
  visible,
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const isReversed = transaction.state === EarningsState.REVERSED;
  const isPending = transaction.state === EarningsState.PENDING;
  const isNegativeAmount = transaction.amount < 0;

  // Calculate commission details
  const commissionableBase = Math.abs(transaction.amount) / (transaction.commissionRate / 100);
  const commissionAmount = transaction.amount;

  return (
    <Drawer
      title={
        <Space>
          <Text strong>Transaction Trace</Text>
          <Tag color={stateColors[transaction.state]}>
            {transaction.state}
          </Tag>
        </Space>
      }
      placement="right"
      width={450}
      open={visible}
      onClose={onClose}
      destroyOnClose
    >
      {/* Header Summary */}
      <div style={{ marginBottom: 24 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Transaction ID">
            <Text copyable={{ text: transaction.id }}>
              {transaction.id.substring(0, 16)}...
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Date">
            {formatDate(transaction.date)}
          </Descriptions.Item>
          <Descriptions.Item label="Amount">
            <Text 
              strong 
              style={{ 
                fontSize: 18,
                color: transaction.amount >= 0 ? '#52c41a' : '#f5222d' 
              }}
            >
              {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Reversal Alert */}
      {isReversed && (
        <Alert
          message="Transaction Reversed"
          description={
            isNegativeAmount
              ? 'This is a reversal adjustment entry (negative amount)'
              : 'Original transaction marked as reversed'
          }
          type="error"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Accordion Sections */}
      <Collapse 
        defaultActiveKey={['attribution', 'commission']} 
        ghost
        expandIconPosition="end"
      >
        {/* Attribution Evidence */}
        <Panel 
          header={
            <Space>
              <LinkOutlined />
              <Text strong>Attribution Evidence</Text>
            </Space>
          } 
          key="attribution"
        >
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Source">
              <Tag>{transaction.source}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Reference ID">
              <Text copyable={{ text: transaction.referenceId }}>
                {transaction.referenceId}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Asset ID">
              <Tooltip title={transaction.assetId}>
                {getAssetName(transaction.assetId)}
              </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label="Channel Tag">
              <Tag color="blue">{transaction.channelTag}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Touchpoint">
              <Text type="secondary">
                Last-click: {formatDate(transaction.createdAt)}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Panel>

        {/* Commission Breakdown */}
        <Panel 
          header={
            <Space>
              <DollarOutlined />
              <Text strong>Commission Breakdown</Text>
            </Space>
          } 
          key="commission"
        >
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Commissionable Base">
              {formatCurrency(commissionableBase)}
            </Descriptions.Item>
            <Descriptions.Item label="Commission Rate">
              {transaction.commissionRate}%
            </Descriptions.Item>
            <Descriptions.Item label="Commission Amount">
              <Text strong style={{ color: '#52c41a' }}>
                {formatCurrency(Math.abs(commissionAmount))}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Rule Version">
              <Tag>v{transaction.ruleVersion}</Tag>
            </Descriptions.Item>
          </Descriptions>

          {transaction.source === TransactionSource.ADJUSTMENT && (
            <Alert
              message="Adjustment Transaction"
              description="This is a manual adjustment or correction entry"
              type="info"
              showIcon
              style={{ marginTop: 12 }}
            />
          )}
        </Panel>

        {/* Locking Policy */}
        {isPending && (
          <Panel 
            header={
              <Space>
                <LockOutlined />
                <Text strong>Locking Policy</Text>
              </Space>
            } 
            key="locking"
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Lock End Date">
                {formatDate(transaction.lockEndAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Policy">
                <Text type="secondary">
                  Pending period - Modifiable/Reversible before lock date
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Days Remaining">
                {Math.ceil((new Date(transaction.lockEndAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '12px 0' }} />

            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>Policy Details:</strong> This transaction is in the pending state and can be reversed 
              or modified until the lock date. After locking, any reversal will create a separate adjustment entry.
            </Text>
          </Panel>
        )}

        {/* Reversal Reason */}
        {isReversed && (
          <Panel 
            header={
              <Space>
                <WarningOutlined />
                <Text strong>Reversal Details</Text>
              </Space>
            } 
            key="reversal"
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Reversal Reason">
                <Tag color="red">
                  {transaction.timeline[transaction.timeline.length - 1]?.reasonCode 
                    ? getReversalReasonLabel(transaction.timeline[transaction.timeline.length - 1].reasonCode as ReversalReason)
                    : 'Not specified'
                  }
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Reversed At">
                {transaction.timeline.length > 0 
                  ? formatDate(transaction.timeline[transaction.timeline.length - 1].occurredAt)
                  : 'Unknown'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Reversed By">
                {transaction.timeline.length > 0 
                  ? transaction.timeline[transaction.timeline.length - 1].actorName
                  : 'System'
                }
              </Descriptions.Item>
            </Descriptions>

            {isNegativeAmount && (
              <Alert
                message="Adjustment Entry"
                description="This is a negative adjustment entry created to reverse a previously locked/payable/paid transaction. The original transaction remains in the system for audit purposes."
                type="warning"
                showIcon
                style={{ marginTop: 12 }}
              />
            )}
          </Panel>
        )}

        {/* Timeline */}
        <Panel 
          header={
            <Space>
              <Text strong>State History</Text>
              <Tag color="default">{transaction.timeline.length} events</Tag>
            </Space>
          } 
          key="timeline"
        >
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {transaction.timeline.map((event, index) => (
              <div 
                key={event.id} 
                style={{ 
                  marginBottom: index < transaction.timeline.length - 1 ? 12 : 0,
                  paddingBottom: index < transaction.timeline.length - 1 ? 12 : 0,
                  borderBottom: index < transaction.timeline.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong>{event.eventType}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDate(event.occurredAt)}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {event.description}
                </Text>
                {event.reasonCode && (
                  <div style={{ marginTop: 4 }}>
                    <Tag color="orange">
                      {event.reasonCode}
                    </Tag>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </Collapse>
    </Drawer>
  );
};

// Add missing import for Tooltip
import { Tooltip } from 'antd';
