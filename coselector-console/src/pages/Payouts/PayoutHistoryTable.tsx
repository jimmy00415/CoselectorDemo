import React from 'react';
import { Table, Tag, Space, Button, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { Payout } from '../../types';
import { PayoutStatus } from '../../types/enums';
import { formatDate, formatCurrency } from '../../utils/format';
import { translateStatus } from '../../utils/i18n';

interface PayoutHistoryTableProps {
  payouts: Payout[];
  loading?: boolean;
  onViewDetails: (payout: Payout) => void;
  onCancelPayout: (payoutId: string) => void;
  currentUserRole: string;
}

export const PayoutHistoryTable: React.FC<PayoutHistoryTableProps> = ({
  payouts,
  loading,
  onViewDetails,
  onCancelPayout,
  currentUserRole,
}) => {
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

  const columns: ColumnsType<Payout> = [
    {
      title: '申请日期',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 180,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        <span style={{ fontSize: '16px', fontWeight: 500 }}>{formatCurrency(amount)}</span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '银行账户',
      dataIndex: ['bankAccount', 'bankName'],
      key: 'bankAccount',
      width: 200,
      render: (_: string, record: Payout) => (
        <Space direction="vertical" size={0}>
          <span>{record.bankAccount.bankName}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {record.bankAccount.accountNumber}
          </span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: PayoutStatus) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
      filters: Object.values(PayoutStatus).map((status) => ({
        text: getStatusConfig(status).label,
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '通过日期',
      dataIndex: 'approvedAt',
      key: 'approvedAt',
      width: 180,
      render: (date: string | undefined) => (date ? formatDate(date) : '-'),
      sorter: (a, b) => {
        if (!a.approvedAt && !b.approvedAt) return 0;
        if (!a.approvedAt) return 1;
        if (!b.approvedAt) return -1;
        return new Date(a.approvedAt).getTime() - new Date(b.approvedAt).getTime();
      },
    },
    {
      title: '支付日期',
      dataIndex: 'paidAt',
      key: 'paidAt',
      width: 180,
      render: (date: string | undefined) => (date ? formatDate(date) : '-'),
      sorter: (a, b) => {
        if (!a.paidAt && !b.paidAt) return 0;
        if (!a.paidAt) return 1;
        if (!b.paidAt) return -1;
        return new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime();
      },
    },
    {
      title: '交易',
      dataIndex: 'transactionIds',
      key: 'transactionIds',
      width: 120,
      align: 'center',
      render: (ids: string[]) => (
        <Tooltip title={`包含 ${ids.length} 笔交易`}>
          <Tag>{ids.length}</Tag>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: unknown, record: Payout) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetails(record)}
          >
            查看详情
          </Button>
          {record.status === PayoutStatus.REQUESTED &&
            currentUserRole === 'AFFILIATE' && (
              <Button
                type="link"
                danger
                size="small"
                icon={<StopOutlined />}
                onClick={() => onCancelPayout(record.id)}
              >
                取消
              </Button>
            )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={payouts}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 笔提现`,
      }}
      scroll={{ x: 1400 }}
    />
  );
};
