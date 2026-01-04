import { Row, Col, Card, Statistic, Progress, Space, Typography, Alert, Button, Tag } from 'antd';
import { 
  DollarOutlined, 
  LockOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Transaction } from '../../types';
import { EarningsState } from '../../types/enums';
import { formatCurrency } from '../../utils';
import { 
  calculateBalanceSummary, 
  calculateLockDistribution, 
  calculateReversalRate,
  stateColors,
} from './config';

/**
 * EarningsOverview Component
 * Per PRD §7.5.2: Shows:
 * - Balance by state (Pending/Locked/Payable/Paid/Reversed)
 * - Next locking dates distribution (7/14/30 day buckets)
 * - Reversal rate indicator
 * - Eligibility banner
 * 
 * Interactions:
 * - Click state → filter transactions
 * - Click lock bucket → filter by date range
 */

const { Title, Text } = Typography;

interface EarningsOverviewProps {
  transactions: Transaction[];
  onFilterByState: (state: EarningsState) => void;
  onFilterByLockRange: (minDays: number, maxDays: number) => void;
  isEligible: boolean;
  eligibilityIssues: Array<{ label: string; action: string; actionUrl: string }>;
}

export const EarningsOverview: React.FC<EarningsOverviewProps> = ({
  transactions,
  onFilterByState,
  onFilterByLockRange,
  isEligible,
  eligibilityIssues,
}) => {
  const summary = calculateBalanceSummary(transactions);
  const lockDistribution = calculateLockDistribution(transactions);
  const reversalRate = calculateReversalRate(transactions);

  // Calculate total pending amount for distribution visualization
  const totalPending = lockDistribution.reduce((sum, bucket) => sum + bucket.amount, 0);

  return (
    <div>
      {/* Eligibility Banner */}
      {!isEligible && eligibilityIssues.length > 0 && (
        <Alert
          message="Payout Blocked - Action Required"
          description={
            <div>
              <Text>Complete the following items to enable payouts:</Text>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                {eligibilityIssues.map((issue, index) => (
                  <li key={index}>
                    <Space>
                      <Text>{issue.label}</Text>
                      <Button type="link" size="small" href={issue.actionUrl}>
                        {issue.action}
                      </Button>
                    </Space>
                  </li>
                ))}
              </ul>
            </div>
          }
          type="error"
          showIcon
          icon={<WarningOutlined />}
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {isEligible && (
        <Alert
          message="Eligible for Payout"
          description="Your account is verified and ready to request withdrawals"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Balance by State */}
      <Title level={4}>Balance by State</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card 
            hoverable
            onClick={() => onFilterByState(EarningsState.PENDING)}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#faad14' }} />
                  <span>Pending</span>
                </Space>
              }
              value={summary.pending}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#faad14' }}
            />
            <Tag color={stateColors[EarningsState.PENDING]} style={{ marginTop: 8 }}>
              Modifiable
            </Tag>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card 
            hoverable
            onClick={() => onFilterByState(EarningsState.LOCKED)}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title={
                <Space>
                  <LockOutlined style={{ color: '#1890ff' }} />
                  <span>Locked</span>
                </Space>
              }
              value={summary.locked}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
            <Tag color={stateColors[EarningsState.LOCKED]} style={{ marginTop: 8 }}>
              Approved
            </Tag>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card 
            hoverable
            onClick={() => onFilterByState(EarningsState.PAYABLE)}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title={
                <Space>
                  <DollarOutlined style={{ color: '#52c41a' }} />
                  <span>Payable</span>
                </Space>
              }
              value={summary.payable}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}
            />
            <Tag color={stateColors[EarningsState.PAYABLE]} style={{ marginTop: 8 }}>
              Ready to withdraw
            </Tag>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card 
            hoverable
            onClick={() => onFilterByState(EarningsState.PAID)}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#8c8c8c' }} />
                  <span>Paid</span>
                </Space>
              }
              value={summary.paid}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#8c8c8c' }}
            />
            <Tag color={stateColors[EarningsState.PAID]} style={{ marginTop: 8 }}>
              Completed
            </Tag>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card 
            hoverable
            onClick={() => onFilterByState(EarningsState.REVERSED)}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title={
                <Space>
                  <WarningOutlined style={{ color: '#f5222d' }} />
                  <span>Reversed</span>
                </Space>
              }
              value={Math.abs(summary.reversed)}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#f5222d' }}
            />
            <Tag color={stateColors[EarningsState.REVERSED]} style={{ marginTop: 8 }}>
              Refunded/Disputed
            </Tag>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card style={{ backgroundColor: '#f5f5f5' }}>
            <Statistic
              title="Total Earnings"
              value={summary.total}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#262626', fontWeight: 600 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Lifetime
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Next Locking Dates Distribution */}
      <Title level={4}>
        <Space>
          <LockOutlined />
          Next Locking Dates
        </Space>
      </Title>
      <Card style={{ marginBottom: 24 }}>
        {totalPending > 0 ? (
          <div>
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              {lockDistribution.map((bucket) => {
                const percentage = totalPending > 0 ? (bucket.amount / totalPending) * 100 : 0;
                
                return (
                  <div key={bucket.bucket}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Space>
                        <Text strong>{bucket.bucket}</Text>
                        <Tag>{bucket.count} transaction{bucket.count !== 1 ? 's' : ''}</Tag>
                      </Space>
                      <Text strong style={{ color: '#1890ff' }}>
                        {formatCurrency(bucket.amount)}
                      </Text>
                    </div>
                    <div 
                      style={{ cursor: 'pointer' }}
                      onClick={() => onFilterByLockRange(bucket.minDays, bucket.maxDays)}
                    >
                      <Progress 
                        percent={percentage} 
                        strokeColor="#1890ff"
                        format={(percent) => `${percent?.toFixed(1)}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </Space>

            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <LockOutlined style={{ marginRight: 8 }} />
                Pending transactions lock automatically on their scheduled dates. 
                Click a bucket to filter transactions by lock date range.
              </Text>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <ClockCircleOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <div>
              <Text type="secondary">No pending transactions</Text>
            </div>
          </div>
        )}
      </Card>

      {/* Reversal Rate Indicator */}
      <Title level={4}>
        <Space>
          <WarningOutlined />
          Reversal Rate (Last 30 Days)
        </Space>
      </Title>
      <Card>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Progress
              percent={reversalRate}
              strokeColor={reversalRate > 10 ? '#f5222d' : reversalRate > 5 ? '#faad14' : '#52c41a'}
              format={(percent) => `${percent?.toFixed(2)}%`}
              style={{ marginBottom: 0 }}
            />
          </Col>
          <Col>
            <Tag 
              color={reversalRate > 10 ? 'red' : reversalRate > 5 ? 'orange' : 'green'}
              style={{ margin: 0 }}
            >
              {reversalRate > 10 ? 'High' : reversalRate > 5 ? 'Moderate' : 'Low'}
            </Tag>
          </Col>
        </Row>
        
        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fffbe6', borderRadius: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {reversalRate > 10 && (
              <>
                <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                High reversal rate may indicate quality issues. Review recent transactions and lead quality.
              </>
            )}
            {reversalRate > 5 && reversalRate <= 10 && (
              <>
                Monitor your reversal rate. Most common causes: refunds, disputes, or invalid conversions.
              </>
            )}
            {reversalRate <= 5 && (
              <>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                Good performance! Low reversal rate indicates high-quality leads and conversions.
              </>
            )}
          </Text>
        </div>
      </Card>
    </div>
  );
};
