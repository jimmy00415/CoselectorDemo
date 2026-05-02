import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Typography, DatePicker, Alert, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import type { Statement, Transaction, Payout } from '../../types';
import { PayoutStatus, EarningsState } from '../../types/enums';
import { formatCurrency } from '../../utils/format';
import { translateChannel, translateStatus, translateText } from '../../utils/i18n';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface StatementListProps {
  transactions: Transaction[];
  payouts: Payout[];
}

interface MonthlyStatement extends Statement {
  month: string; // YYYY-MM format
  timezone: string;
}

export const StatementList: React.FC<StatementListProps> = ({ transactions, payouts }) => {
  const [statements, setStatements] = useState<MonthlyStatement[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Generate monthly statements
  useEffect(() => {
    generateStatements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, payouts]);

  const generateStatements = () => {
    // Get user's timezone (for display)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Find earliest and latest transaction dates
    const dates = transactions.map((t) => new Date(t.date).getTime());
    if (dates.length === 0) {
      setStatements([]);
      return;
    }

    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));

    // Generate statements for each month
    const monthlyStatements: MonthlyStatement[] = [];
    const currentDate = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);

    while (currentDate <= latestDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

      // Get start and end of month in user's timezone
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      // Calculate opening balance (closing of previous month)
      const prevMonthStatements = monthlyStatements.filter((s) => s.month < monthStr);
      const openingBalance =
        prevMonthStatements.length > 0
          ? prevMonthStatements[prevMonthStatements.length - 1].closingBalance
          : 0;

      // Calculate earnings for this month (all non-reversed transactions)
      const monthTransactions = transactions.filter((t) => {
        const txDate = new Date(t.date);
        return (
          txDate >= startOfMonth &&
          txDate <= endOfMonth &&
          t.state !== EarningsState.REVERSED
        );
      });
      const earnings = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Calculate reversals for this month
      const reversalTransactions = transactions.filter((t) => {
        const txDate = new Date(t.date);
        return (
          txDate >= startOfMonth &&
          txDate <= endOfMonth &&
          t.state === EarningsState.REVERSED
        );
      });
      const reversals = Math.abs(
        reversalTransactions.reduce((sum, t) => sum + t.amount, 0)
      );

      // Calculate payouts PAID in this month
      const monthPayouts = payouts.filter((p) => {
        if (p.status !== PayoutStatus.PAID || !p.paidAt) return false;
        const paidDate = new Date(p.paidAt);
        return paidDate >= startOfMonth && paidDate <= endOfMonth;
      });
      const payoutsAmount = monthPayouts.reduce((sum, p) => sum + p.amount, 0);

      // Calculate closing balance
      const closingBalance = openingBalance + earnings - reversals - payoutsAmount;

      monthlyStatements.push({
        id: monthStr,
        period: `${year}-${String(month + 1).padStart(2, '0')}`,
        month: monthStr,
        timezone,
        openingBalance,
        earnings,
        reversals,
        payouts: payoutsAmount,
        closingBalance,
        createdAt: new Date().toISOString(),
      });

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    setStatements(monthlyStatements.reverse()); // Most recent first
  };

  // Export statement as CSV
  const exportCSV = (statement: MonthlyStatement, detailed: boolean) => {
    const year = parseInt(statement.month.split('-')[0]);
    const month = parseInt(statement.month.split('-')[1]);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Get transactions for this month
    const monthTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= startOfMonth && txDate <= endOfMonth;
    });

    // Build CSV content
    let csv = '';
    
    if (detailed) {
      // Detailed CSV with all fields
      csv = '日期,来源,引用,金额,状态,锁定结束时间,规则版本,佣金率,资产 ID,渠道标签\n';
      monthTransactions.forEach((t) => {
        csv += `${t.date},${translateText(t.source)},${t.referenceId},${t.amount},${translateStatus(t.state)},${t.lockEndAt},${t.ruleVersion},${t.commissionRate},${t.assetId},${translateChannel(t.channelTag)}\n`;
      });
    } else {
      // Summary CSV with essential fields only
      csv = '日期,来源,引用,金额,状态\n';
      monthTransactions.forEach((t) => {
        csv += `${t.date},${translateText(t.source)},${t.referenceId},${t.amount},${translateStatus(t.state)}\n`;
      });
    }

    // Add summary section
    csv += '\n\n摘要\n';
    csv += `期初余额,${statement.openingBalance}\n`;
    csv += `收益,${statement.earnings}\n`;
    csv += `冲正,${-statement.reversals}\n`;
    csv += `提现,${-statement.payouts}\n`;
    csv += `期末余额,${statement.closingBalance}\n`;

    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement_${statement.month}_${detailed ? 'detailed' : 'summary'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    message.success(`对账单已导出：${statement.period}（${detailed ? '明细' : '摘要'}）`);
  };

  const columns: ColumnsType<MonthlyStatement> = [
    {
      title: '月份',
      dataIndex: 'period',
      key: 'period',
      width: 150,
      render: (period: string, record: MonthlyStatement) => (
        <Space direction="vertical" size={0}>
          <Text strong>{dayjs(period).format('MMMM YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.timezone}
          </Text>
        </Space>
      ),
    },
    {
      title: '期初余额',
      dataIndex: 'openingBalance',
      key: 'openingBalance',
      width: 150,
      align: 'right',
      render: (balance: number) => formatCurrency(balance),
    },
    {
      title: '收益',
      dataIndex: 'earnings',
      key: 'earnings',
      width: 150,
      align: 'right',
      render: (earnings: number) => (
        <Text style={{ color: '#52c41a' }}>+ {formatCurrency(earnings)}</Text>
      ),
    },
    {
      title: '冲正',
      dataIndex: 'reversals',
      key: 'reversals',
      width: 150,
      align: 'right',
      render: (reversals: number) => (
        <Text style={{ color: '#ff4d4f' }}>- {formatCurrency(reversals)}</Text>
      ),
    },
    {
      title: '提现',
      dataIndex: 'payouts',
      key: 'payouts',
      width: 150,
      align: 'right',
      render: (payouts: number) => (
        <Text style={{ color: '#1890ff' }}>- {formatCurrency(payouts)}</Text>
      ),
    },
    {
      title: '期末余额',
      dataIndex: 'closingBalance',
      key: 'closingBalance',
      width: 150,
      align: 'right',
      render: (balance: number) => (
        <Text strong style={{ fontSize: '16px' }}>
          {formatCurrency(balance)}
        </Text>
      ),
    },
    {
      title: '导出',
      key: 'export',
      width: 200,
      fixed: 'right',
      render: (_: unknown, record: MonthlyStatement) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => exportCSV(record, false)}
          >
            摘要
          </Button>
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => exportCSV(record, true)}
          >
            明细
          </Button>
        </Space>
      ),
    },
  ];

  // Filter statements by date range
  const filteredStatements = dateRange
    ? statements.filter((s) => {
        const statementDate = dayjs(s.month);
        const startDate = dayjs(dateRange[0]);
        const endDate = dayjs(dateRange[1]);
        return (
          (statementDate.isAfter(startDate) || statementDate.isSame(startDate, 'month')) &&
          (statementDate.isBefore(endDate) || statementDate.isSame(endDate, 'month'))
        );
      })
    : statements;

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>
            月度对账单
          </Title>
          <RangePicker
            picker="month"
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            placeholder={['开始月份', '结束月份']}
          />
        </Space>

        {/* Info Alert */}
        <Alert
          type="info"
          message="对账单计算方式"
          description={
            <span>
              <strong>期初余额</strong>（上月期末） + <strong>收益</strong>
              （已批准交易） - <strong>冲正</strong>（退款/争议） -{' '}
              <strong>提现</strong>（已支付提现） = <strong>期末余额</strong>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                对账单基于你的本地时区计算。每个月会在最后一天 23:59:59 锁定。
              </Text>
            </span>
          }
          showIcon
        />

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredStatements}
          rowKey="id"
          pagination={{
            pageSize: 12,
            showTotal: (total) => `共 ${total} 个月`,
          }}
          scroll={{ x: 1000 }}
        />
      </Space>
    </Card>
  );
};
