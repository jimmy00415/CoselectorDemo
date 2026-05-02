import { ColumnType } from 'antd/es/table';
import { Tag, Button, Tooltip } from 'antd';
import { Transaction } from '../../types';
import { EarningsState, TransactionSource } from '../../types/enums';
import { formatDate, formatCurrency, translateStatus } from '../../utils';

/**
 * Earnings Module Configuration
 * Per PRD §7.5: Transaction table columns, filters, and state colors
 */

// State color mapping per earnings lifecycle
export const stateColors: Record<EarningsState, string> = {
  [EarningsState.PENDING]: 'orange',
  [EarningsState.LOCKED]: 'blue',
  [EarningsState.PAYABLE]: 'green',
  [EarningsState.PAID]: 'default',
  [EarningsState.REVERSED]: 'red',
};

// Source type icons and labels
export const sourceLabels: Record<TransactionSource, string> = {
  [TransactionSource.ORDER]: '订单',
  [TransactionSource.MILESTONE]: '里程碑',
  [TransactionSource.ADJUSTMENT]: '调整',
};

/**
 * Calculate days until lock date
 */
export const getDaysUntilLock = (lockEndAt: string): number => {
  const lockDate = new Date(lockEndAt);
  const now = new Date();
  const diffMs = lockDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays); // Never negative
};

/**
 * Get lock date bucket (0-7, 8-14, 15-30, 30+)
 */
export const getLockDateBucket = (daysUntil: number): string => {
  if (daysUntil <= 7) return '0-7 天';
  if (daysUntil <= 14) return '8-14 天';
  if (daysUntil <= 30) return '15-30 天';
  return '30 天以上';
};

/**
 * Check if transaction can be locked now
 */
export const canLockNow = (lockEndAt: string): boolean => {
  return getDaysUntilLock(lockEndAt) === 0;
};

/**
 * Transaction table columns
 * Per PRD §7.5.3: Date, Source, Reference, Amount, State, Locking date, Rule version, Action
 */
export const getTransactionColumns = (onViewTrace: (transaction: Transaction) => void): ColumnType<Transaction>[] => [
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
    width: 180,
    render: (date: string) => formatDate(date),
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    defaultSortOrder: 'descend',
  },
  {
    title: '来源',
    dataIndex: 'source',
    key: 'source',
    width: 120,
    render: (source: TransactionSource) => (
      <Tag>{sourceLabels[source]}</Tag>
    ),
    filters: [
      { text: '订单', value: TransactionSource.ORDER },
      { text: '里程碑', value: TransactionSource.MILESTONE },
      { text: '调整', value: TransactionSource.ADJUSTMENT },
    ],
    onFilter: (value, record) => record.source === value,
  },
  {
    title: '引用',
    dataIndex: 'referenceId',
    key: 'referenceId',
    width: 150,
    render: (refId: string, record: Transaction) => (
      <Tooltip title={`${sourceLabels[record.source]}: ${refId}`}>
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {refId.substring(0, 12)}...
        </span>
      </Tooltip>
    ),
  },
  {
    title: '金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    align: 'right',
    render: (amount: number) => (
      <span style={{ 
        color: amount >= 0 ? '#52c41a' : '#f5222d',
        fontWeight: 500,
      }}>
        {amount >= 0 ? '+' : ''}{formatCurrency(amount)}
      </span>
    ),
    sorter: (a, b) => a.amount - b.amount,
  },
  {
    title: '状态',
    dataIndex: 'state',
    key: 'state',
    width: 120,
    render: (state: EarningsState) => (
      <Tag color={stateColors[state]}>
        {translateStatus(state)}
      </Tag>
    ),
    filters: [
      { text: '待锁定', value: EarningsState.PENDING },
      { text: '已锁定', value: EarningsState.LOCKED },
      { text: '可提现', value: EarningsState.PAYABLE },
      { text: '已支付', value: EarningsState.PAID },
      { text: '已冲正', value: EarningsState.REVERSED },
    ],
    onFilter: (value, record) => record.state === value,
  },
  {
    title: '锁定日期',
    dataIndex: 'lockEndAt',
    key: 'lockEndAt',
    width: 180,
    render: (lockEndAt: string, record: Transaction) => {
      if (record.state !== EarningsState.PENDING) {
        return <span style={{ color: '#999' }}>—</span>;
      }
      
      const daysUntil = getDaysUntilLock(lockEndAt);
      
      if (daysUntil === 0) {
        return (
          <Tag color="warning">
            今日锁定
          </Tag>
        );
      }
      
      return (
        <Tooltip title={formatDate(lockEndAt)}>
          <span style={{ color: '#1890ff' }}>
            {daysUntil} 天
          </span>
        </Tooltip>
      );
    },
  },
  {
    title: '规则',
    dataIndex: 'ruleVersion',
    key: 'ruleVersion',
    width: 100,
    render: (version: string) => (
      <Tag color="default" style={{ fontSize: 11 }}>
        v{version}
      </Tag>
    ),
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
    render: (_, record: Transaction) => (
      <Button 
        type="link" 
        size="small"
        onClick={() => onViewTrace(record)}
      >
        查看追踪
      </Button>
    ),
  },
];

/**
 * Calculate balance summary by state
 */
export interface BalanceSummary {
  pending: number;
  locked: number;
  payable: number;
  paid: number;
  reversed: number;
  total: number;
}

export const calculateBalanceSummary = (transactions: Transaction[]): BalanceSummary => {
  const summary: BalanceSummary = {
    pending: 0,
    locked: 0,
    payable: 0,
    paid: 0,
    reversed: 0,
    total: 0,
  };

  transactions.forEach(tx => {
    const amount = tx.amount;
    
    switch (tx.state) {
      case EarningsState.PENDING:
        summary.pending += amount;
        break;
      case EarningsState.LOCKED:
        summary.locked += amount;
        break;
      case EarningsState.PAYABLE:
        summary.payable += amount;
        break;
      case EarningsState.PAID:
        summary.paid += amount;
        break;
      case EarningsState.REVERSED:
        summary.reversed += amount;
        break;
    }
  });

  summary.total = summary.pending + summary.locked + summary.payable + summary.paid + summary.reversed;

  return summary;
};

/**
 * Calculate locking date distribution
 */
export interface LockDistribution {
  bucket: string;
  count: number;
  amount: number;
  minDays: number;
  maxDays: number;
}

export const calculateLockDistribution = (transactions: Transaction[]): LockDistribution[] => {
  const buckets = new Map<string, { count: number; amount: number; minDays: number; maxDays: number }>();
  
  // Initialize buckets
  buckets.set('0-7 天', { count: 0, amount: 0, minDays: 0, maxDays: 7 });
  buckets.set('8-14 天', { count: 0, amount: 0, minDays: 8, maxDays: 14 });
  buckets.set('15-30 天', { count: 0, amount: 0, minDays: 15, maxDays: 30 });
  buckets.set('30 天以上', { count: 0, amount: 0, minDays: 31, maxDays: 999 });

  // Aggregate pending transactions
  transactions
    .filter(tx => tx.state === EarningsState.PENDING)
    .forEach(tx => {
      const daysUntil = getDaysUntilLock(tx.lockEndAt);
      const bucketKey = getLockDateBucket(daysUntil);
      const bucket = buckets.get(bucketKey)!;
      
      bucket.count += 1;
      bucket.amount += tx.amount;
    });

  return Array.from(buckets.entries()).map(([bucket, data]) => ({
    bucket,
    ...data,
  }));
};

/**
 * Calculate reversal rate for current period (last 30 days)
 */
export const calculateReversalRate = (transactions: Transaction[]): number => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentTransactions = transactions.filter(tx => 
    new Date(tx.date) >= thirtyDaysAgo
  );

  const totalTransactions = recentTransactions.filter(tx => 
    tx.amount > 0 // Only count positive transactions (not reversals)
  ).length;

  const reversedTransactions = recentTransactions.filter(tx =>
    tx.state === EarningsState.REVERSED && tx.amount > 0
  ).length;

  if (totalTransactions === 0) return 0;
  
  return (reversedTransactions / totalTransactions) * 100;
};
