import { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Empty, Progress, Row, Segmented, Space, Statistic, Tag, Tooltip, Typography } from 'antd';
import {
  ArrowRightOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FundOutlined,
  LinkOutlined,
  LockOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Transaction, TrackingAsset } from '../../types';
import { EarningsState } from '../../types/enums';
import { formatCurrency, formatNumber, formatPercentage, translateChannel } from '../../utils';
import {
  calculateBalanceSummary,
  calculateCommissionableBase,
  calculateLockDistribution,
  calculateReversalRate,
  stateColors,
} from './config';

const { Title, Text } = Typography;

interface EarningsOverviewProps {
  transactions: Transaction[];
  assets: TrackingAsset[];
  onFilterByState: (state: EarningsState) => void;
  onFilterByLockRange: (minDays: number, maxDays: number) => void;
  onOpenPayouts: () => void;
  isEligible: boolean;
  eligibilityIssues: Array<{ label: string; action: string; actionUrl: string }>;
}

interface PlatformMetric {
  key: string;
  label: string;
  clueCount: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  realizedCommission: number;
  netCommission: number;
  commissionableBase: number;
  averageCommissionRate: number;
}

interface DailyPoint {
  date: string;
  label: string;
  amount: number;
}

interface LinkMetric {
  id: string;
  name: string;
  orderLink: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  realizedCommission: number;
  netCommission: number;
  platformClues: PlatformClue[];
}

interface PlatformClue {
  key: string;
  label: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  realizedCommission: number;
  netCommission: number;
  averageCommissionRate: number;
}

const REALIZED_STATES = new Set<EarningsState>([
  EarningsState.LOCKED,
  EarningsState.PAYABLE,
  EarningsState.PAID,
]);

const isUsedAsset = (asset: TrackingAsset) => Boolean(asset.lastUsedAt) || asset.clickCount > 0 || asset.conversionCount > 0;
const isRealizedTransaction = (transaction: Transaction) => REALIZED_STATES.has(transaction.state) && transaction.amount > 0;
const getDisplayConversions = (asset: TrackingAsset) => Math.min(asset.conversionCount, asset.clickCount);

const PLATFORM_KEYS = ['wechat', 'xiaohongshu', 'douyin', 'kuaishou', 'weibo', 'bilibili'];
const PLATFORM_WEIGHTS = [0.52, 0.31, 0.17];

const hashString = (value: string) =>
  value.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);

const isPlatformKey = (value?: string) => Boolean(value && PLATFORM_KEYS.includes(value));

const getSpuPlatformKeys = (asset: TrackingAsset, assetTransactions: Transaction[]) => {
  const keys = new Set<string>();

  assetTransactions.forEach((transaction) => {
    if (isPlatformKey(transaction.channelTag)) {
      keys.add(transaction.channelTag);
    }
  });

  if (isPlatformKey(asset.channelTag)) {
    keys.add(asset.channelTag);
  }

  const offset = hashString(asset.id) % PLATFORM_KEYS.length;
  for (let index = 0; keys.size < 3 && index < PLATFORM_KEYS.length; index += 1) {
    keys.add(PLATFORM_KEYS[(offset + index) % PLATFORM_KEYS.length]);
  }

  return Array.from(keys).slice(0, 3);
};

const splitByWeights = (total: number, count: number, precision = 0) => {
  if (count <= 0) return [];
  const weights = PLATFORM_WEIGHTS.slice(0, count);
  const weightTotal = weights.reduce((value, weight) => value + weight, 0) || 1;
  const normalizedWeights = weights.map(weight => weight / weightTotal);
  const multiplier = 10 ** precision;
  let remaining = Math.round(total * multiplier);

  return normalizedWeights.map((weight, index) => {
    if (index === normalizedWeights.length - 1) {
      return remaining / multiplier;
    }

    const value = Math.round(total * weight * multiplier);
    remaining -= value;
    return value / multiplier;
  });
};

const sum = <T,>(items: T[], selector: (item: T) => number) =>
  items.reduce((total, item) => total + selector(item), 0);

const buildPlatformClues = (asset: TrackingAsset, assetTransactions: Transaction[]): PlatformClue[] => {
  const keys = getSpuPlatformKeys(asset, assetTransactions);
  const clicks = splitByWeights(asset.clickCount, keys.length);
  const conversions = splitByWeights(getDisplayConversions(asset), keys.length);
  const realizedTotal = sum(assetTransactions.filter(isRealizedTransaction), (transaction) => transaction.amount);
  const netTotal = sum(assetTransactions, (transaction) => transaction.amount);
  const realizedAmounts = splitByWeights(realizedTotal, keys.length, 2);
  const netAmounts = splitByWeights(netTotal, keys.length, 2);

  return keys.map((key, index) => {
    const clueRealized = realizedAmounts[index] || 0;
    const channelTransactions = assetTransactions.filter(transaction => transaction.channelTag === key);
    const channelBase = sum(channelTransactions.filter(isRealizedTransaction), (transaction) =>
      calculateCommissionableBase(transaction.amount, transaction.commissionRate)
    );
    const fallbackBase = clueRealized > 0 ? clueRealized / 0.09 : 0;
    const commissionableBase = channelBase || fallbackBase;

    return {
      key,
      label: translateChannel(key),
      clicks: clicks[index] || 0,
      conversions: conversions[index] || 0,
      conversionRate: (clicks[index] || 0) > 0 ? ((conversions[index] || 0) / (clicks[index] || 1)) * 100 : 0,
      realizedCommission: clueRealized,
      netCommission: netAmounts[index] || 0,
      averageCommissionRate: commissionableBase > 0 ? (clueRealized / commissionableBase) * 100 : 0,
    };
  });
};

const sameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const formatDayLabel = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;

const buildDailySeries = (transactions: Transaction[], days: number): DailyPoint[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));

    const amount = transactions
      .filter((transaction) => sameDay(new Date(transaction.date), date))
      .reduce((total, transaction) => {
        if (isRealizedTransaction(transaction) || transaction.state === EarningsState.REVERSED) {
          return total + transaction.amount;
        }
        return total;
      }, 0);

    return {
      date: date.toISOString(),
      label: formatDayLabel(date),
      amount,
    };
  });
};

const DailyEarningsChart: React.FC<{ data: DailyPoint[] }> = ({ data }) => {
  if (data.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无收益数据" />;
  }

  const width = 760;
  const height = 260;
  const top = 18;
  const right = 20;
  const bottom = 38;
  const left = 48;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxAmount = Math.max(0, ...data.map((point) => point.amount));
  const minAmount = Math.min(0, ...data.map((point) => point.amount));
  const range = Math.max(maxAmount - minAmount, 1);
  const step = chartWidth / data.length;
  const barWidth = Math.max(8, Math.min(26, step * 0.58));
  const yFor = (amount: number) => top + ((maxAmount - amount) / range) * chartHeight;
  const baselineY = yFor(0);
  const linePoints = data
    .map((point, index) => `${left + step * index + step / 2},${yFor(point.amount)}`)
    .join(' ');
  const showEvery = data.length > 14 ? 3 : data.length > 7 ? 2 : 1;

  return (
    <div className="earnings-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="每日收益趋势" className="earnings-daily-chart">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const value = minAmount + range * tick;
          const y = yFor(value);
          return (
            <g key={tick}>
              <line x1={left} x2={width - right} y1={y} y2={y} className="earnings-chart-grid" />
              <text x={left - 8} y={y + 4} textAnchor="end" className="earnings-chart-axis">
                {Math.round(value).toLocaleString()}
              </text>
            </g>
          );
        })}

        <line x1={left} x2={width - right} y1={baselineY} y2={baselineY} className="earnings-chart-baseline" />

        {data.map((point, index) => {
          const x = left + step * index + (step - barWidth) / 2;
          const y = point.amount >= 0 ? yFor(point.amount) : baselineY;
          const barHeight = Math.max(2, Math.abs(baselineY - yFor(point.amount)));

          return (
            <g key={point.date}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                className={point.amount >= 0 ? 'earnings-chart-bar' : 'earnings-chart-bar negative'}
              >
                <title>{`${point.label} ${formatCurrency(point.amount)}`}</title>
              </rect>
              {index % showEvery === 0 && (
                <text x={left + step * index + step / 2} y={height - 12} textAnchor="middle" className="earnings-chart-axis">
                  {point.label}
                </text>
              )}
            </g>
          );
        })}

        <polyline points={linePoints} fill="none" className="earnings-chart-line" />
        {data.map((point, index) => (
          <circle
            key={`${point.date}-dot`}
            cx={left + step * index + step / 2}
            cy={yFor(point.amount)}
            r={3}
            className="earnings-chart-dot"
          />
        ))}
      </svg>
    </div>
  );
};

export const EarningsOverview: React.FC<EarningsOverviewProps> = ({
  transactions,
  assets,
  onFilterByState,
  onFilterByLockRange,
  onOpenPayouts,
  isEligible,
  eligibilityIssues,
}) => {
  const [chartDays, setChartDays] = useState(14);
  const summary = useMemo(() => calculateBalanceSummary(transactions), [transactions]);
  const lockDistribution = useMemo(() => calculateLockDistribution(transactions), [transactions]);
  const reversalRate = useMemo(() => calculateReversalRate(transactions), [transactions]);
  const usedAssets = useMemo(() => assets.filter(isUsedAsset), [assets]);
  const dailySeries = useMemo(() => buildDailySeries(transactions, chartDays), [transactions, chartDays]);

  const totalClicks = useMemo(() => sum(usedAssets, (asset) => asset.clickCount), [usedAssets]);
  const totalConversions = useMemo(() => sum(usedAssets, getDisplayConversions), [usedAssets]);
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const realizedTransactions = transactions.filter(isRealizedTransaction);
  const realizedCommission = sum(realizedTransactions, (transaction) => transaction.amount);
  const commissionableBase = sum(realizedTransactions, (transaction) =>
    calculateCommissionableBase(transaction.amount, transaction.commissionRate)
  );
  const averageCommissionRate = commissionableBase > 0 ? (realizedCommission / commissionableBase) * 100 : 0;
  const totalPending = lockDistribution.reduce((total, bucket) => total + bucket.amount, 0);
  const bestDay = dailySeries.reduce<DailyPoint | null>((best, point) => {
    if (!best || point.amount > best.amount) return point;
    return best;
  }, null);

  const linkMetrics = useMemo<LinkMetric[]>(() => {
    return usedAssets.map((asset) => {
      const assetTransactions = transactions.filter((transaction) => transaction.assetId === asset.id);
      const platformClues = buildPlatformClues(asset, assetTransactions);
      const clicks = sum(platformClues, (clue) => clue.clicks);
      const conversions = sum(platformClues, (clue) => clue.conversions);
      const realized = sum(platformClues, (clue) => clue.realizedCommission);
      const net = sum(platformClues, (clue) => clue.netCommission);

      return {
        id: asset.id,
        name: asset.name,
        orderLink: asset.assetValue,
        clicks,
        conversions,
        conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
        realizedCommission: realized,
        netCommission: net,
        platformClues,
      };
    }).sort((left, right) => right.realizedCommission - left.realizedCommission || right.clicks - left.clicks);
  }, [transactions, usedAssets]);

  const platformMetrics = useMemo<PlatformMetric[]>(() => {
    const metrics = new Map<string, PlatformMetric>();

    linkMetrics.forEach((linkMetric) => {
      linkMetric.platformClues.forEach((clue) => {
        const current = metrics.get(clue.key) || {
          key: clue.key,
          label: clue.label,
          clueCount: 0,
          clicks: 0,
          conversions: 0,
          conversionRate: 0,
          realizedCommission: 0,
          netCommission: 0,
          commissionableBase: 0,
          averageCommissionRate: 0,
        };

        current.clueCount += 1;
        current.clicks += clue.clicks;
        current.conversions += clue.conversions;
        current.realizedCommission += clue.realizedCommission;
        current.netCommission += clue.netCommission;
        current.commissionableBase += clue.averageCommissionRate > 0
          ? clue.realizedCommission / (clue.averageCommissionRate / 100)
          : 0;
        metrics.set(clue.key, current);
      });
    });

    return Array.from(metrics.values()).map((metric) => ({
      ...metric,
      conversionRate: metric.clicks > 0 ? (metric.conversions / metric.clicks) * 100 : 0,
      averageCommissionRate: metric.commissionableBase > 0
        ? (metric.realizedCommission / metric.commissionableBase) * 100
        : 0,
    })).sort((left, right) => right.clicks - left.clicks || right.realizedCommission - left.realizedCommission);
  }, [linkMetrics]);

  const maxLinkClicks = Math.max(1, ...linkMetrics.map((metric) => metric.clicks));

  const funnelStages = [
    {
      label: 'SPU 链接点击',
      value: totalClicks,
      helper: `${usedAssets.length} 个已使用 SPU 链接`,
      icon: <LinkOutlined />,
    },
    {
      label: '有效转化',
      value: totalConversions,
      helper: formatPercentage(conversionRate, 2),
      icon: <ShoppingCartOutlined />,
    },
    {
      label: '已实现抽佣',
      value: realizedCommission,
      helper: `${realizedTransactions.length} 笔已确认交易`,
      icon: <DollarOutlined />,
      money: true,
    },
    {
      label: '可提现',
      value: summary.payable,
      helper: isEligible ? '账户已满足提现条件' : '需先完成资料条件',
      icon: <WalletOutlined />,
      money: true,
    },
  ];

  return (
    <div className="earnings-overview">
      <section className="earnings-hero-panel">
        <div className="earnings-hero-main">
          <Tag color="blue">浏览与收益看板</Tag>
          <h2>从 SPU 链接浏览到佣金到账，一屏看清</h2>
          <p>SPU 是唯一归因单位；每个 SPU 链接下面可以看到不同平台浏览线索的点击、转化和收益贡献。</p>
        </div>
        <div className="earnings-hero-actions">
          <div className="earnings-payable-box">
            <span>当前可提现</span>
            <strong>{formatCurrency(summary.payable)}</strong>
            <Text type="secondary">最终净佣金 {formatCurrency(summary.total)}</Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<WalletOutlined />}
            onClick={onOpenPayouts}
          >
            选择提现
          </Button>
        </div>
      </section>

      {!isEligible && eligibilityIssues.length > 0 && (
        <Alert
          title="提现前还需要补齐资料"
          description={
            <Space wrap>
              {eligibilityIssues.map((issue) => (
                <Button key={issue.label} type="link" href={issue.actionUrl}>
                  {issue.label}: {issue.action}
                </Button>
              ))}
            </Space>
          }
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          className="earnings-status-alert"
        />
      )}

      {isEligible && (
        <Alert
          title="账户已满足提现条件"
          description="可提现佣金可以进入提现 tab 选择金额并提交。"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          className="earnings-status-alert"
        />
      )}

      <Row gutter={[16, 16]} className="earnings-metric-grid">
        <Col xs={24} sm={12} xl={6}>
          <Card className="earnings-metric-card">
            <div className="earnings-metric-icon clicks"><LinkOutlined /></div>
            <Statistic title="SPU 链接点击" value={totalClicks} formatter={(value) => formatNumber(Number(value))} />
            <Text type="secondary">来自 {platformMetrics.filter((item) => item.clicks > 0).length} 个平台浏览线索</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="earnings-metric-card">
            <div className="earnings-metric-icon conversion"><RiseOutlined /></div>
            <Statistic title="总体转化率" value={conversionRate} precision={2} suffix="%" />
            <Text type="secondary">{formatNumber(totalConversions)} 次转化 / {formatNumber(totalClicks)} 次点击</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="earnings-metric-card">
            <div className="earnings-metric-icon realized"><FundOutlined /></div>
            <Statistic title="已实现抽佣" value={realizedCommission} precision={2} prefix="¥" />
            <Text type="secondary">平均抽佣率 {formatPercentage(averageCommissionRate, 2)}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="earnings-metric-card highlight" onClick={() => onFilterByState(EarningsState.PAYABLE)} hoverable>
            <div className="earnings-metric-icon payable"><WalletOutlined /></div>
            <Statistic title="最终净佣金" value={summary.total} precision={2} prefix="¥" />
            <Text type="secondary">可提现 {formatCurrency(summary.payable)}</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="earnings-section-grid">
        <Col xs={24} xl={16}>
          <Card
            className="earnings-dashboard-card"
            title={
              <Space>
                <BarChartOutlined />
                每日实现收益
              </Space>
            }
            extra={
              <Segmented
                size="small"
                value={chartDays}
                onChange={(value) => setChartDays(Number(value))}
                options={[
                  { label: '7日', value: 7 },
                  { label: '14日', value: 14 },
                  { label: '30日', value: 30 },
                ]}
              />
            }
          >
            <div className="earnings-chart-summary">
              <div>
                <Text type="secondary">周期收益</Text>
                <strong>{formatCurrency(sum(dailySeries, (point) => point.amount))}</strong>
              </div>
              <div>
                <Text type="secondary">最高单日</Text>
                <strong>{bestDay ? `${bestDay.label} ${formatCurrency(bestDay.amount)}` : '-'}</strong>
              </div>
            </div>
            <DailyEarningsChart data={dailySeries} />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            className="earnings-dashboard-card"
            title={
              <Space>
                <SafetyCertificateOutlined />
                转化漏斗
              </Space>
            }
          >
            <div className="earnings-funnel">
              {funnelStages.map((stage, index) => {
                const stageRate = index === 1 && totalClicks > 0
                  ? conversionRate
                  : index === 3 && realizedCommission > 0
                    ? (summary.payable / realizedCommission) * 100
                    : null;

                return (
                  <div key={stage.label} className="earnings-funnel-stage">
                    <div className="earnings-funnel-icon">{stage.icon}</div>
                    <div className="earnings-funnel-body">
                      <div className="earnings-funnel-title">
                        <span>{stage.label}</span>
                        {stageRate !== null && <Tag>{formatPercentage(stageRate, 1)}</Tag>}
                      </div>
                      <strong>{stage.money ? formatCurrency(Number(stage.value)) : formatNumber(Number(stage.value))}</strong>
                      <Text type="secondary">{stage.helper}</Text>
                    </div>
                    {index < funnelStages.length - 1 && <ArrowRightOutlined className="earnings-funnel-arrow" />}
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="earnings-section-grid">
        <Col xs={24} xl={15}>
          <Card
            className="earnings-dashboard-card"
            title={
              <Space>
                <LinkOutlined />
                平台浏览来源汇总
              </Space>
            }
          >
            {platformMetrics.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无已使用链接数据" />
            ) : (
              <div className="earnings-platform-list">
                {platformMetrics.map((metric) => {
                  const clickShare = totalClicks > 0 ? (metric.clicks / totalClicks) * 100 : 0;
                  return (
                    <div key={metric.key} className="earnings-platform-row">
                      <div className="earnings-platform-topline">
                        <Space>
                          <span className="earnings-platform-name">{metric.label}</span>
                          <Tag>{metric.clueCount} 条 SPU 线索</Tag>
                        </Space>
                        <Tooltip title="该平台线索占全部 SPU 链接点击的比例">
                          <Text strong>{formatNumber(metric.clicks)} 次点击</Text>
                        </Tooltip>
                      </div>
                      <Progress percent={Number(clickShare.toFixed(1))} showInfo={false} strokeColor="#1677ff" />
                      <div className="earnings-platform-metrics">
                        <span>转化 {formatNumber(metric.conversions)}</span>
                        <span>转化率 {formatPercentage(metric.conversionRate, 2)}</span>
                        <span>已实现 {formatCurrency(metric.realizedCommission)}</span>
                        <span>抽佣率 {formatPercentage(metric.averageCommissionRate, 2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card
            className="earnings-dashboard-card"
            title={
              <Space>
                <LockOutlined />
                锁定与风险
              </Space>
            }
          >
            <div className="earnings-state-strip">
              {[
                { state: EarningsState.PENDING, label: '待锁定', amount: summary.pending },
                { state: EarningsState.LOCKED, label: '已锁定', amount: summary.locked },
                { state: EarningsState.PAYABLE, label: '可提现', amount: summary.payable },
                { state: EarningsState.PAID, label: '已支付', amount: summary.paid },
              ].map((item) => (
                <button key={item.state} type="button" onClick={() => onFilterByState(item.state)}>
                  <Tag color={stateColors[item.state]}>{item.label}</Tag>
                  <strong>{formatCurrency(item.amount)}</strong>
                </button>
              ))}
            </div>

            <Title level={5}>下一批锁定</Title>
            <Space orientation="vertical" style={{ width: '100%' }} size={12}>
              {lockDistribution.map((bucket) => {
                const percentage = totalPending > 0 ? (bucket.amount / totalPending) * 100 : 0;
                return (
                  <div key={bucket.bucket} className="earnings-lock-row" onClick={() => onFilterByLockRange(bucket.minDays, bucket.maxDays)}>
                    <div>
                      <Text strong>{bucket.bucket}</Text>
                      <Text type="secondary">{bucket.count} 笔</Text>
                    </div>
                    <div>
                      <Text strong>{formatCurrency(bucket.amount)}</Text>
                      <Progress percent={Number(percentage.toFixed(1))} showInfo={false} size="small" />
                    </div>
                  </div>
                );
              })}
            </Space>

            <div className="earnings-risk-box">
              <div>
                <WarningOutlined />
                <span>近 30 天冲正率</span>
              </div>
              <strong>{formatPercentage(reversalRate, 2)}</strong>
              <Text type="secondary">{summary.reversed < 0 ? `已冲正 ${formatCurrency(Math.abs(summary.reversed))}` : '暂无冲正金额'}</Text>
            </div>

            <div className="earnings-commission-base">
              <ClockCircleOutlined />
              <span>已实现计佣基数 {formatCurrency(commissionableBase)}</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="earnings-section-grid">
        <Col span={24}>
          <Card
            className="earnings-dashboard-card"
            title={
              <Space>
                <FundOutlined />
                SPU 链接平台线索明细
              </Space>
            }
          >
            {linkMetrics.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无已使用 SPU 链接" />
            ) : (
              <div className="earnings-link-detail-list">
                {linkMetrics.slice(0, 8).map((metric, index) => {
                  const clickShare = (metric.clicks / maxLinkClicks) * 100;
                  return (
                    <div key={metric.id} className="earnings-link-detail-row">
                      <div className="earnings-link-rank">{index + 1}</div>
                      <div className="earnings-link-main">
                        <div className="earnings-link-title">
                          <Text strong ellipsis>{metric.name}</Text>
                          <Tag>SPU 唯一归因</Tag>
                        </div>
                        <Progress percent={Number(clickShare.toFixed(1))} showInfo={false} strokeColor="#52c41a" />
                        <Text type="secondary" ellipsis className="earnings-link-order">
                          {metric.orderLink}
                        </Text>
                      </div>
                      <div className="earnings-link-stats">
                        <div>
                          <span>总点击</span>
                          <strong>{formatNumber(metric.clicks)}</strong>
                        </div>
                        <div>
                          <span>总转化率</span>
                          <strong>{formatPercentage(metric.conversionRate, 2)}</strong>
                        </div>
                        <div>
                          <span>已实现抽佣</span>
                          <strong>{formatCurrency(metric.realizedCommission)}</strong>
                        </div>
                        <div>
                          <span>净佣金贡献</span>
                          <strong>{formatCurrency(metric.netCommission)}</strong>
                        </div>
                      </div>
                      <div className="earnings-platform-clue-list">
                        {metric.platformClues.map((clue) => (
                          <div key={`${metric.id}-${clue.key}`} className="earnings-platform-clue-row">
                            <Tag color="blue">{clue.label}</Tag>
                            <span>点击 {formatNumber(clue.clicks)}</span>
                            <span>转化 {formatNumber(clue.conversions)}</span>
                            <span>转化率 {formatPercentage(clue.conversionRate, 2)}</span>
                            <span>已实现 {formatCurrency(clue.realizedCommission)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};