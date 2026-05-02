import { Drawer, Collapse, Descriptions, Tag, Space, Typography, Alert, Divider } from 'antd';
import { 
  LinkOutlined, 
  DollarOutlined, 
  LockOutlined, 
  WarningOutlined 
} from '@ant-design/icons';
import { Transaction, TrackingAsset } from '../../types';
import { EarningsState, TransactionSource, ReversalReason } from '../../types/enums';
import { formatDate, formatCurrency, translateChannel, translateReasonCode, translateStatus, translateText } from '../../utils';
import { calculateCommissionableBase, getCommissionRatePercent, stateColors } from './config';
import { MERCHANT_CATALOG } from '../Content/catalogData';

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

const { Text } = Typography;
const { Panel } = Collapse;

interface TransactionTraceDrawerProps {
  visible: boolean;
  transaction: Transaction | null;
  assets?: TrackingAsset[];
  onClose: () => void;
}

const hashString = (value: string) =>
  value.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);

const getMerchantNameForAsset = (asset: TrackingAsset | undefined, fallbackId: string): string => {
  const matchedMerchant = MERCHANT_CATALOG.find(merchant =>
    asset?.boundContentIds.some(spuId => merchant.products.some(product => product.id === spuId)) ||
    merchant.products.some(product => product.name === asset?.name)
  );

  if (matchedMerchant) {
    return matchedMerchant.name;
  }

  const fallbackMerchant = MERCHANT_CATALOG[hashString(asset?.id || fallbackId) % MERCHANT_CATALOG.length];
  return fallbackMerchant?.name || '商家信息待同步';
};

const getReversalReasonLabel = (reason?: ReversalReason): string => {
  if (!reason) return '未知';
  
  const labels: Record<ReversalReason, string> = {
    [ReversalReason.REFUND]: '客户退款',
    [ReversalReason.DISPUTE]: '争议',
    [ReversalReason.DISPUTE_CHARGEBACK]: '争议/拒付',
    [ReversalReason.FRAUD]: '欺诈',
    [ReversalReason.FRAUD_HOLD]: '欺诈冻结',
    [ReversalReason.ORDER_VOID_CANCEL]: '订单作废/取消',
    [ReversalReason.SYSTEM_REATTRIBUTED]: '系统重新归因',
  };
  
  return labels[reason] || reason;
};

export const TransactionTraceDrawer: React.FC<TransactionTraceDrawerProps> = ({
  visible,
  transaction,
  assets = [],
  onClose,
}) => {
  if (!transaction) return null;

  const linkedAsset = assets.find(asset => asset.id === transaction.assetId);
  const merchantName = getMerchantNameForAsset(linkedAsset, transaction.assetId);
  const orderLink = linkedAsset?.assetValue || transaction.assetId;

  const isReversed = transaction.state === EarningsState.REVERSED;
  const isPending = transaction.state === EarningsState.PENDING;
  const isNegativeAmount = transaction.amount < 0;

  // Calculate commission details
  const commissionableBase = calculateCommissionableBase(transaction.amount, transaction.commissionRate);
  const commissionAmount = transaction.amount;
  const commissionRatePercent = getCommissionRatePercent(transaction.commissionRate);

  return (
    <Drawer
      title={
        <Space>
          <Text strong>交易追踪</Text>
          <Tag color={stateColors[transaction.state]}>
            {translateStatus(transaction.state)}
          </Tag>
        </Space>
      }
      placement="right"
      size="default"
      open={visible}
      onClose={onClose}
      destroyOnHidden
    >
      {/* Header Summary */}
      <div style={{ marginBottom: 24 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="交易 ID">
            <Text copyable={{ text: transaction.id }}>
              {transaction.id.substring(0, 16)}...
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="日期">
            {formatDate(transaction.date)}
          </Descriptions.Item>
          <Descriptions.Item label="金额">
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
          title="交易已冲正"
          description={
            isNegativeAmount
              ? '这是一条冲正调整记录（负金额）'
              : '原始交易已标记为已冲正'
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
              <Text strong>归因证据</Text>
            </Space>
          } 
          key="attribution"
        >
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="商家名称">
              <Text strong>{merchantName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="订单 ID">
              <Text copyable={{ text: transaction.referenceId }}>
                {transaction.referenceId}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="共选者创建的订单链接">
              <Text code copyable={{ text: orderLink }} style={{ fontSize: 12 }}>
                {orderLink}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="平台线索">
              <Tag color="blue">{translateChannel(transaction.channelTag)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="触点">
              <Text type="secondary">
                最后点击：{formatDate(transaction.createdAt)}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Panel>

        {/* Commission Breakdown */}
        <Panel 
          header={
            <Space>
              <DollarOutlined />
              <Text strong>佣金拆解</Text>
            </Space>
          } 
          key="commission"
        >
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="计佣基数">
              {formatCurrency(commissionableBase)}
            </Descriptions.Item>
            <Descriptions.Item label="佣金比例">
              {commissionRatePercent.toFixed(2)}%
            </Descriptions.Item>
            <Descriptions.Item label="佣金金额">
              <Text strong style={{ color: '#52c41a' }}>
                {formatCurrency(Math.abs(commissionAmount))}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="规则版本">
              <Tag>v{transaction.ruleVersion}</Tag>
            </Descriptions.Item>
          </Descriptions>

          {transaction.source === TransactionSource.ADJUSTMENT && (
            <Alert
              title="调整交易"
              description="这是一条手动调整或修正记录"
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
                <Text strong>锁定政策</Text>
              </Space>
            } 
            key="locking"
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="锁定结束日期">
                {formatDate(transaction.lockEndAt)}
              </Descriptions.Item>
              <Descriptions.Item label="政策">
                <Text type="secondary">
                  待锁定期 - 锁定日前可修改或冲正
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="剩余天数">
                {Math.ceil((new Date(transaction.lockEndAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} 天
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '12px 0' }} />

            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>政策详情：</strong>此交易处于待锁定状态，在锁定日前可冲正或修改。锁定后如需冲正，将生成一条独立调整记录。
            </Text>
          </Panel>
        )}

        {/* Reversal Reason */}
        {isReversed && (
          <Panel 
            header={
              <Space>
                <WarningOutlined />
                <Text strong>冲正详情</Text>
              </Space>
            } 
            key="reversal"
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="冲正原因">
                <Tag color="red">
                  {transaction.timeline[transaction.timeline.length - 1]?.reasonCode 
                    ? getReversalReasonLabel(transaction.timeline[transaction.timeline.length - 1].reasonCode as ReversalReason)
                    : '未指定'
                  }
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="冲正时间">
                {transaction.timeline.length > 0 
                  ? formatDate(transaction.timeline[transaction.timeline.length - 1].occurredAt)
                  : '未知'
                }
              </Descriptions.Item>
              <Descriptions.Item label="冲正人">
                {transaction.timeline.length > 0 
                  ? transaction.timeline[transaction.timeline.length - 1].actorName
                  : '系统'
                }
              </Descriptions.Item>
            </Descriptions>

            {isNegativeAmount && (
              <Alert
                title="调整记录"
                description="这是一条负向调整记录，用于冲正此前已锁定、可提现或已支付的交易。原始交易会保留在系统中用于审计。"
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
              <Text strong>状态历史</Text>
              <Tag color="default">{transaction.timeline.length} 个事件</Tag>
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
                  <Text strong>{translateText(event.eventType)}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDate(event.occurredAt)}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {translateText(event.description)}
                </Text>
                {event.reasonCode && (
                  <div style={{ marginTop: 4 }}>
                    <Tag color="orange">
                      {translateReasonCode(event.reasonCode)}
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

