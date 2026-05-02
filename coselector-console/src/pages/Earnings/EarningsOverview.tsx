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
          message="提现受阻 - 需要操作"
          description={
            <div>
              <Text>完成以下项目后即可启用提现：</Text>
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
          message="符合提现条件"
          description="你的账户已验证，可发起提现申请"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Balance by State */}
      <Title level={4}>按状态汇总余额</Title>
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
                  <span>待锁定</span>
                </Space>
              }
              value={summary.pending}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#faad14' }}
            />
            <Tag color={stateColors[EarningsState.PENDING]} style={{ marginTop: 8 }}>
              可调整
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
                  <span>已锁定</span>
                </Space>
              }
              value={summary.locked}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
            <Tag color={stateColors[EarningsState.LOCKED]} style={{ marginTop: 8 }}>
              已确认
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
                  <span>可提现</span>
                </Space>
              }
              value={summary.payable}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 600 }}
            />
            <Tag color={stateColors[EarningsState.PAYABLE]} style={{ marginTop: 8 }}>
              可申请提现
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
                  <span>已支付</span>
                </Space>
              }
              value={summary.paid}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#8c8c8c' }}
            />
            <Tag color={stateColors[EarningsState.PAID]} style={{ marginTop: 8 }}>
              已完成
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
                  <span>已冲正</span>
                </Space>
              }
              value={Math.abs(summary.reversed)}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#f5222d' }}
            />
            <Tag color={stateColors[EarningsState.REVERSED]} style={{ marginTop: 8 }}>
              退款/争议
            </Tag>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <Card style={{ backgroundColor: '#f5f5f5' }}>
            <Statistic
              title="累计收益"
              value={summary.total}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#262626', fontWeight: 600 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              全周期
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Next Locking Dates Distribution */}
      <Title level={4}>
        <Space>
          <LockOutlined />
          下一批锁定日期
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
                        <Tag>{bucket.count} 笔交易</Tag>
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
                待锁定交易会在计划日期自动锁定。点击区间可按锁定日期范围筛选交易。
              </Text>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <ClockCircleOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <div>
              <Text type="secondary">暂无待锁定交易</Text>
            </div>
          </div>
        )}
      </Card>

      {/* Reversal Rate Indicator */}
      <Title level={4}>
        <Space>
          <WarningOutlined />
          冲正率（近 30 天）
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
              {reversalRate > 10 ? '高' : reversalRate > 5 ? '中' : '低'}
            </Tag>
          </Col>
        </Row>
        
        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fffbe6', borderRadius: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {reversalRate > 10 && (
              <>
                <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                冲正率较高可能说明质量存在问题。请复盘近期交易和线索质量。
              </>
            )}
            {reversalRate > 5 && reversalRate <= 10 && (
              <>
                请持续关注冲正率。常见原因包括退款、争议或无效转化。
              </>
            )}
            {reversalRate <= 5 && (
              <>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                表现良好！较低冲正率说明线索和转化质量较高。
              </>
            )}
          </Text>
        </div>
      </Card>
    </div>
  );
};
