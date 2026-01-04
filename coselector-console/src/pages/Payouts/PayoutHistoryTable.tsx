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

  const columns: ColumnsType<Payout> = [
    {
      title: 'Request Date',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 180,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Amount',
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
      title: 'Bank Account',
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
      title: 'Status',
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
      title: 'Approved Date',
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
      title: 'Paid Date',
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
      title: 'Transactions',
      dataIndex: 'transactionIds',
      key: 'transactionIds',
      width: 120,
      align: 'center',
      render: (ids: string[]) => (
        <Tooltip title={`${ids.length} transactions included`}>
          <Tag>{ids.length}</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Action',
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
            View Details
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
                Cancel
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
        showTotal: (total) => `Total ${total} payouts`,
      }}
      scroll={{ x: 1400 }}
    />
  );
};
